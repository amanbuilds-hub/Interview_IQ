import dotenv from 'dotenv';
import Groq from 'groq-sdk';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "google/gemma-3-12b-it";

/**
 * 🧠 Safe JSON Parser
 */
const safeParseJSON = (text, expectedType = 'object') => {
  try {
    // 1. Remove markdown backticks
    let cleaned = text.replace(/```json|```/g, "").trim();
    
    // 2. Extract first valid JSON block
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) throw new Error("No JSON found in response");
    
    let jsonStr = match[0];
    
    // 3. Fix common AI JSON errors
    jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1"); // Trailing commas
    
    let parsed = JSON.parse(jsonStr);

    // 4. Force unwrap for Array expectations
    if (expectedType === 'array') {
      if (Array.isArray(parsed)) return parsed;
      
      // If it's an object, look for the first array field
      const arrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
      if (arrayKey) return parsed[arrayKey];
      
      throw new Error("AI returned an object but no array field was found inside.");
    }

    // 5. Force unwrap for Object expectations
    if (expectedType === 'object' && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      // If it's a single-key wrapper (e.g., {"report": {...}}), unwrap it
      if (keys.length === 1 && typeof parsed[keys[0]] === 'object' && !Array.isArray(parsed[keys[0]])) {
        return parsed[keys[0]];
      }
    }

    return parsed;
  } catch (err) {
    console.error("❌ AI JSON Error:", err.message);
    console.error("📄 RAW RESPONSE (first 200 chars):", text.slice(0, 200));
    throw new Error(`AI data error: ${err.message}`);
  }
};

/**
 * 📄 Parse Resume
 */
export const parseResumeWithAI = async (text) => {
  const prompt = `
Extract key information from this resume text.
STRICT RULE: Return a JSON object with these keys: skills, projects, experience, education.

Resume Text:
${text}

Output Format:
{
  "skills": ["..."],
  "projects": ["..."],
  "experience": ["..."],
  "education": ["..."]
}
`;

  const content = await callWithRetry(prompt);
  return safeParseJSON(content, 'object');
};

/**
 * 🔥 Normalize AI Output
 */
const normalizeQuestion = (q) => {
  let diff = (q.difficulty || "").toLowerCase();
  let difficulty = "Intermediate";
  if (diff.includes("easy") || diff.includes("beginner")) difficulty = "Beginner";
  else if (diff.includes("medium") || diff.includes("intermediate")) difficulty = "Intermediate";
  else if (diff.includes("hard") || diff.includes("advanced")) difficulty = "Advanced";

  let cat = (q.category || "").toLowerCase();
  let category = "General";
  if (cat.includes("behavior")) category = "Behavioral";
  else if (cat.includes("scenario")) category = "Scenario-based";
  else if (cat.includes("resume")) category = "Resume-based";
  else if (cat.includes("coding")) category = "Coding";
  else if (cat.includes("technical") || cat.includes("javascript") || cat.includes("react") || cat.includes("fundamentals") || cat.includes("framework")) category = "Technical";

  return {
    questionText: q.questionText || "No question provided",
    suggestedAnswer: q.suggestedAnswer || "",
    difficulty,
    category
  };
};

/**
 * 🔁 Retry Wrapper
 */
const callWithRetry = async (prompt, retries = 2) => {
  try {
    return await callGroq(prompt);
  } catch (err) {
    try {
      return await callOpenRouter(prompt);
    } catch (fallbackErr) {
      if (retries > 0) {
        return callWithRetry(prompt, retries - 1);
      }
      throw fallbackErr;
    }
  }
};

/**
 * 🏎️ Groq Call
 */
const callGroq = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a professional technical recruiter. Return ONLY valid JSON objects. Do not include markdown or explanations. Ensure all keys match the requested schema perfectly."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" }
  });

  return completion.choices[0]?.message?.content || "";
};

/**
 * 🌐 OpenRouter Call
 */
const callOpenRouter = async (prompt) => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON. No markdown. No explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data?.error?.message || "AI request failed");
  }

  return data.choices[0].message.content;
};

/**
 * 🎯 Generate Questions
 */
export const generateQuestionsWithAI = async (resumeData, role, difficulty, focusAreas, questionCount = 5) => {
  const prompt = `
Generate ${questionCount} interview questions for a ${role} position.
STRICT RULE: Return a JSON object with a "questions" key containing an array of ${questionCount} objects.

Context:
Difficulty: ${difficulty}
Focus: ${focusAreas}
Resume: ${JSON.stringify(resumeData)}

Output Format:
{
  "questions": [
    {
      "questionText": "...",
      "category": "Technical",
      "difficulty": "Intermediate",
      "suggestedAnswer": "..."
    }
  ]
}
`;

  const content = await callWithRetry(prompt);
  const parsed = safeParseJSON(content, 'array');

  if (!Array.isArray(parsed)) {
    throw new Error("Expected an array of questions but didn't receive one.");
  }

  return parsed.map(normalizeQuestion);
};

/**
 * 📊 Evaluation
 */
export const evaluateInterviewWithAI = async (interviewData, answers) => {
  const prompt = `
Evaluate the candidate's interview performance.
STRICT RULE: Return a JSON object with the following schema.

Interview Context:
- Role: ${interviewData.role}
- Difficulty: ${interviewData.difficulty}

Answers to evaluate:
${answers.map((ans, idx) => `
Q${idx + 1}: ${ans.question?.questionText}
Candidate: ${ans.answerText}
`).join('\n')}

Output Format:
{
  "overallScore": 85,
  "grade": "B+",
  "summary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "hiringRecommendation": "Recommend",
  "roadmap30Days": ["...", "...", "..."],
  "questionWiseFeedback": [
    {
      "questionText": "...",
      "category": "...",
      "answerScore": 80,
      "feedback": "...",
      "suggestedImprovement": "..."
    }
  ]
}
`;

  const content = await callWithRetry(prompt);
  const evaluation = safeParseJSON(content, 'object');

  // Ensure questionWiseFeedback exists even if AI misnames it
  if (!evaluation.questionWiseFeedback) {
    const feedbackKey = Object.keys(evaluation).find(key => Array.isArray(evaluation[key]));
    if (feedbackKey) {
      evaluation.questionWiseFeedback = evaluation[feedbackKey];
    } else {
      evaluation.questionWiseFeedback = [];
    }
  }

  // Defensive field normalization
  evaluation.overallScore = Math.round(Number(evaluation.overallScore)) || 0;
  if (evaluation.overallScore < 0) evaluation.overallScore = 0;
  if (evaluation.overallScore > 100) evaluation.overallScore = 100;

  evaluation.grade = getValidGrade(evaluation.grade, evaluation.overallScore);
  evaluation.hiringRecommendation = getValidRecommendation(evaluation.hiringRecommendation);

  return evaluation;
};

const getValidGrade = (grade, score) => {
  const allowed = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  
  if (allowed.includes(grade)) return grade;
  
  if (grade) {
    const clean = grade.trim().toUpperCase();
    if (clean === 'A-') return 'A';
    if (clean === 'B-') return 'B';
    if (clean === 'C-') return 'C';
    if (clean === 'D-') return 'D';
    if (allowed.includes(clean)) return clean;
  }
  
  // Fallback to calculating grade from score
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
};

const getValidRecommendation = (recommendation) => {
  const allowed = ['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommended'];
  if (allowed.includes(recommendation)) return recommendation;
  
  if (recommendation) {
    const clean = recommendation.trim().toLowerCase();
    if (clean.includes('strongly') && clean.includes('recommend')) return 'Strongly Recommend';
    if (clean.includes('not') && clean.includes('recommend')) return 'Not Recommended';
    if (clean.includes('recommend')) return 'Recommend';
    if (clean.includes('neutral')) return 'Neutral';
  }
  return 'Recommend';
};