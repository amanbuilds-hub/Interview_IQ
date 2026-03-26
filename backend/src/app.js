import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

const app = express();

// Standard Production-Grade Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/interview', interviewRoutes);

// Testing route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'InterviewIQ Backend is running!' });
});

// Global Error Handling
app.use((err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log for developer
    console.error('🔥 Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { status: 404, message };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { status: 400, message };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { status: 400, message: message.join(', ') };
    }

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
    });
});

export default app;
