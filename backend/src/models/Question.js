import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.ObjectId,
    ref: 'Interview',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['General', 'Technical', 'Behavioral', 'Resume-based', 'Scenario-based', 'Coding'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  suggestedAnswer: String,
  answer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Answer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model('Question', questionSchema);
export default Question;