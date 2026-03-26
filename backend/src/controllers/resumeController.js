import Resume from '../models/Resume.js';
import { PDFParse } from 'pdf-parse';
import { parseResumeWithAI } from '../services/aiService.js';

// @desc    Upload & Parse Resume
export const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // In a real production app, you'd upload this to S3 and get a URL.
        // For this demo, we'll simulate a local path as URL.
        const fileUrl = `/uploads/${req.file.filename}`;
        const fileName = req.file.originalname;

        // Extract text from PDF
        let extractedText = '';
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = req.file.buffer;
            const parser = new PDFParse({ data: dataBuffer });
            const pdfData = await parser.getText();
            extractedText = pdfData.text;
        } else {
            // Handle docx etc. (Simplified for this task: assuming PDF for now)
            extractedText = req.file.buffer.toString('utf-8');
        }

        // Call AI service to parse skills, experience etc.
        const parsedData = await parseResumeWithAI(extractedText);

        const resume = await Resume.create({
            user: req.user.id,
            fileName,
            fileUrl,
            extractedText,
            parsedData
        });

        res.status(201).json({
            success: true,
            data: resume
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user resumes
export const getMyResumes = async (req, res, next) => {
    try {
        const resumes = await Resume.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: resumes.length, data: resumes });
    } catch (error) {
        next(error);
    }
};
