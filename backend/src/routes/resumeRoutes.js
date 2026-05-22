import express from 'express';
import multer from 'multer';
import { uploadResume, getMyResumes, deleteResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Storage Configuration (In-Memory for now, can be changed to Disk for local storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'), false);
        }
    }
});

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/my-resumes', protect, getMyResumes);
router.delete('/:id', protect, deleteResume);

export default router;
