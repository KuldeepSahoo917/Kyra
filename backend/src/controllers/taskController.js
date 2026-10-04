const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Helper to check project membership
const isMember = (project, userId) => {
    return (
        project.owner.toString() === userId.toString() ||
        project.members.some((m) => m.user.toString() === userId.toString())
    );
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks?projectId=xxx
// @access  Private
const getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'projectId is required' });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .sort({ order: 1, createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name email avatar')
            .populate('project', 'name key color');

        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.project._id);
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, assignedTo, projectId, dueDate, labels } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ message: 'Title and projectId are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        // Get the highest order in this status column
        const lastTask = await Task.findOne({ project: projectId, status: status || 'todo' }).sort({ order: -1 });
        const order = lastTask ? lastTask.order + 1 : 0;

        const task = await Task.create({
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            assignedTo: assignedTo || null,
            project: projectId,
            createdBy: req.user._id,
            dueDate,
            labels,
            order,
        });

        // Create notification if task is assigned to someone
        if (assignedTo && assignedTo !== req.user._id.toString()) {
            await Notification.create({
                recipient: assignedTo,
                sender: req.user._id,
                type: 'task_assigned',
                message: `${req.user.name} assigned you a task: "${title}"`,
                task: task._id,
                project: projectId,
            });

            // Tell socket to emit notification (via app-level socket ref)
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${assignedTo}`).emit('notification', {
                    type: 'task_assigned',
                    message: `${req.user.name} assigned you a task: "${title}"`,
                });
            }
        }

        const populated = await task.populate([
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email avatar' },
        ]);

        // Broadcast to project room
        const io = req.app.get('io');
        if (io) {
            io.to(`project_${projectId}`).emit('task:created', populated);
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        const prevAssignee = task.assignedTo ? task.assignedTo.toString() : null;
        const { title, description, status, priority, assignedTo, dueDate, labels, order } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (labels !== undefined) task.labels = labels;
        if (order !== undefined) task.order = order;

        await task.save();

        // Notify new assignee
        if (assignedTo && assignedTo !== prevAssignee && assignedTo !== req.user._id.toString()) {
            await Notification.create({
                recipient: assignedTo,
                sender: req.user._id,
                type: 'task_assigned',
                message: `${req.user.name} assigned you a task: "${task.title}"`,
                task: task._id,
                project: task.project,
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`user_${assignedTo}`).emit('notification', {
                    type: 'task_assigned',
                    message: `${req.user.name} assigned you a task: "${task.title}"`,
                });
            }
        }

        const populated = await task.populate([
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email avatar' },
        ]);

        const io = req.app.get('io');
        if (io) {
            io.to(`project_${task.project}`).emit('task:updated', populated);
        }

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        const taskId = task._id;
        const projectId = task.project;
        await task.deleteOne();

        const io = req.app.get('io');
        if (io) {
            io.to(`project_${projectId}`).emit('task:deleted', { taskId });
        }

        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload attachment for a task
// @route   POST /api/tasks/:id/attachments
// @access  Private
const addAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }

        const uploadsUrlBase = '/uploads';
        const relativePath = path.join('tasks', task._id.toString(), req.file.filename);
        const url = `${uploadsUrlBase}/${relativePath.replace(/\\\\/g, '/')}`;

        const attachment = {
            url,
            publicId: relativePath,
            filename: req.file.originalname,
        };

        task.attachments.push(attachment);
        await task.save();

        const populated = await task.populate([
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email avatar' },
        ]);

        const io = req.app.get('io');
        if (io) {
            io.to(`project_${task.project}`).emit('task:updated', populated);
        }

        res.status(201).json({
            attachment,
            task: populated,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
const removeAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id))
            return res.status(403).json({ message: 'Not authorized' });

        const attachment = task.attachments.id(req.params.attachmentId);
        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        // Try to remove file from disk (best-effort)
        if (attachment.publicId) {
            const filePath = path.join(__dirname, '../uploads', attachment.publicId);
            fs.unlink(filePath, () => { });
        }

        attachment.deleteOne();
        await task.save();

        const populated = await task.populate([
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email avatar' },
        ]);

        const io = req.app.get('io');
        if (io) {
            io.to(`project_${task.project}`).emit('task:updated', populated);
        }

        res.json({ message: 'Attachment removed', task: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, addAttachment, removeAttachment };
