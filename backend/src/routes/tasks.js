const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addAttachment,
  removeAttachment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Multer storage for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const taskId = req.params.id || 'general';
    const uploadDir = path.join(__dirname, '..', 'uploads', 'tasks', taskId);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);

router.post('/:id/attachments', protect, upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', protect, removeAttachment);

module.exports = router;
