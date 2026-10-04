const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
        })
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is a member or owner
        const isMember =
            project.owner._id.toString() === req.user._id.toString() ||
            project.members.some((m) => m.user._id.toString() === req.user._id.toString());

        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    try {
        const { name, description, key, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await Project.create({
            name,
            description,
            key: key || name.slice(0, 4).toUpperCase(),
            color,
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'owner' }],
        });

        const populated = await project.populate([
            { path: 'owner', select: 'name email avatar' },
            { path: 'members.user', select: 'name email avatar' },
        ]);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (owner/admin)
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can update this project' });
        }

        const { name, description, key, color } = req.body;
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (key) project.key = key;
        if (color) project.color = color;

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can delete this project' });
        }

        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (owner/admin)
const addMember = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check permissions
        const requestorMember = project.members.find(
            (m) => m.user.toString() === req.user._id.toString()
        );
        if (!requestorMember || (requestorMember.role !== 'owner' && requestorMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Not authorized to add members' });
        }

        const alreadyMember = project.members.find((m) => m.user.toString() === userId);
        if (alreadyMember) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        project.members.push({ user: userId, role: role || 'member' });
        await project.save();

        const populated = await project.populate('members.user', 'name email avatar');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (owner/admin)
const removeMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can remove members' });
        }

        project.members = project.members.filter(
            (m) => m.user.toString() !== req.params.userId
        );
        await project.save();
        res.json({ message: 'Member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
};
