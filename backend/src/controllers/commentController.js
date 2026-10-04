const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get comments for a task
// @route   GET /api/comments?taskId=xxx
// @access  Private
const getComments = async (req, res) => {
    try {
        const { taskId } = req.query;
        if (!taskId) return res.status(400).json({ message: 'taskId is required' });

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const comments = await Comment.find({ task: taskId })
            .populate('author', 'name email avatar')
            .populate('mentions', 'name email avatar')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to a task
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text, taskId } = req.body;
        if (!text || !taskId) return res.status(400).json({ message: 'text and taskId are required' });

        const task = await Task.findById(taskId).populate('project');
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Parse @mentions from text (format: @userId)
        const mentionRegex = /@([a-f0-9]{24})/gi;
        const mentionIds = [];
        let match;
        while ((match = mentionRegex.exec(text)) !== null) {
            mentionIds.push(match[1]);
        }

        const comment = await Comment.create({
            text,
            task: taskId,
            author: req.user._id,
            mentions: mentionIds,
        });

        const populated = await comment.populate([
            { path: 'author', select: 'name email avatar' },
            { path: 'mentions', select: 'name email avatar' },
        ]);

        // Notify task owner / assignee
        const notifyUsers = new Set();
        if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
            notifyUsers.add(task.assignedTo.toString());
        }
        if (task.createdBy && task.createdBy.toString() !== req.user._id.toString()) {
            notifyUsers.add(task.createdBy.toString());
        }

        for (const uid of notifyUsers) {
            await Notification.create({
                recipient: uid,
                sender: req.user._id,
                type: 'comment_added',
                message: `${req.user.name} commented on "${task.title}"`,
                task: task._id,
                project: task.project._id,
            });
        }

        // Notify mentioned users
        for (const uid of mentionIds) {
            if (uid !== req.user._id.toString()) {
                await Notification.create({
                    recipient: uid,
                    sender: req.user._id,
                    type: 'mention',
                    message: `${req.user.name} mentioned you in a comment on "${task.title}"`,
                    task: task._id,
                    project: task.project._id,
                });
            }
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`project_${task.project._id}`).emit('comment:added', {
                taskId,
                comment: populated,
            });

            // Emit notifications to specific user rooms
            for (const uid of [...notifyUsers, ...mentionIds]) {
                io.to(`user_${uid}`).emit('notification', {
                    type: uid in mentionIds ? 'mention' : 'comment_added',
                    message: `${req.user.name} commented on "${task.title}"`,
                });
            }
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author only)
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getComments, addComment, deleteComment };
