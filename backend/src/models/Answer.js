import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    interview: {
        type: mongoose.Schema.ObjectId,
        ref: 'Interview',
        required: true,
    },
    question: {
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
        required: true,
    },
    answerText: String,
    voiceUrl: String, // If recorded
    codeSnippet: String, // If it's a coding question
    score: {
        type: Number,
        min: 0,
        max: 100,
    },
    feedback: String,
    detectedWeakAreas: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
