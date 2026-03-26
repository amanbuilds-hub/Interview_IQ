import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Resume from '../models/Resume.js';
import Report from '../models/Report.js';
import { generateQuestionsWithAI, evaluateInterviewWithAI } from '../services/aiService.js';

export const generateInterview = async (req, res, next) => {
  try {
    const { resumeId, role, difficulty, focusAreas } = req.body;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const aiQuestions = await generateQuestionsWithAI(
      resume.parsedData,
      role,
      difficulty,
      focusAreas
    );

    console.log("📦 FINAL QUESTIONS:", aiQuestions);

    const interview = await Interview.create({
      user: req.user.id,
      resume: resumeId,
      role,
      difficulty,
      focusAreas,
      totalQuestions: aiQuestions.length,
      startedAt: Date.now(),
    });

    const validCategories = ['General', 'Technical', 'Behavioral', 'Resume-based', 'Scenario-based', 'Coding'];
    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];

    const questionDocs = await Promise.all(
      aiQuestions.map(q => {
        const safeCategory = validCategories.includes(q.category) ? q.category : "General";
        const safeDifficulty = validDifficulties.includes(q.difficulty) ? q.difficulty : "Intermediate";

        return Question.create({
          questionText: q.questionText,
          suggestedAnswer: q.suggestedAnswer || "",
          category: safeCategory,
          difficulty: safeDifficulty,
          interview: interview._id
        });
      })
    );

    interview.questions = questionDocs.map(q => q._id);
    await interview.save();

    res.status(201).json({
      success: true,
      data: interview,
      firstQuestion: questionDocs[0]
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user interviews
export const getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .populate('questions')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer for a question
export const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionId, answerText, codeSnippet } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const answer = await Answer.create({
      user: req.user.id,
      interview: interviewId,
      question: questionId,
      answerText,
      codeSnippet
    });

    // Update question with answer reference
    await Question.findByIdAndUpdate(questionId, { answer: answer._id });

    // Move to next question
    interview.currentQuestionIndex += 1;
    const isLast = interview.currentQuestionIndex >= interview.totalQuestions;

    if (isLast) {
      interview.status = 'Completed';
      interview.completedAt = Date.now();
    } else {
      interview.status = 'In-Progress';
    }

    await interview.save();

    res.status(200).json({
      success: true,
      isLast,
      nextQuestionIndex: interview.currentQuestionIndex
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finalize interview & generate report
export const finalizeInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId).populate('questions');
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const answers = await Answer.find({ interview: interviewId }).populate('question');

    // Call AI to evaluate
    const evaluation = await evaluateInterviewWithAI(interview, answers);

    const report = await Report.create({
      user: req.user.id,
      interview: interviewId,
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      questionWiseFeedback: evaluation.questionWiseFeedback,
      hiringRecommendation: evaluation.hiringRecommendation,
      roadmap30Days: evaluation.roadmap30Days
    });

    interview.report = report._id;
    await interview.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};