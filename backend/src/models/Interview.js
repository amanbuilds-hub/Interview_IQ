import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    resume: {
        type: mongoose.Schema.ObjectId,
        ref: 'Resume',
        required: true,
    },
    role: {
        type: String,
        required: [true, 'Please provide the target role'],
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate',
    },
    focusAreas: [String],
    status: {
        type: String,
        enum: ['Pending', 'In-Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    currentQuestionIndex: {
        type: Number,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        default: 5,
    },
    questions: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
    }],
    report: {
        type: mongoose.Schema.ObjectId,
        ref: 'Report',
    },
    startedAt: Date,
    completedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
