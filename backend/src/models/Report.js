import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    interview: {
        type: mongoose.Schema.ObjectId,
        ref: 'Interview',
        unique: true,
        required: true,
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    },
    summary: String,
    strengths: [String],
    weaknesses: [String],
    questionWiseFeedback: [{
        questionText: String,
        category: String,
        answerScore: Number,
        userAnswer: String,
        suggestedAnswer: String,
        feedback: String,
        suggestedImprovement: String,
    }],
    hiringRecommendation: {
        type: String,
        enum: ['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommended'],
    },
    roadmap30Days: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
