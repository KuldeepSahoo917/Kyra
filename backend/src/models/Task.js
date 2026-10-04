const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        status: {
            type: String,
            enum: ['todo', 'inprogress', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Number, default: 0 }, // for kanban ordering
        dueDate: { type: Date, default: null },
        labels: [{ type: String }],
        attachments: [
            {
                url: String,
                publicId: String,
                filename: String,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
