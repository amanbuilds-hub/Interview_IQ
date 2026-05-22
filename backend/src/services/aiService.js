import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemma-3-12b-it";

/**
 * 🧠 Safe JSON Parser
 */
const safeParseJSON = (text) => {
  try {
    let cleaned = text.replace(/```json|```/g, "").trim();

    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) throw new Error("No JSON found");

    let jsonStr = match[0];

    // Remove trailing commas
    jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");

    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("❌ JSON Parse Error:", text);
    throw new Error("Invalid AI JSON: " + err.message);
  }
};

/**
 * 📄 Parse Resume
 */
export const parseResumeWithAI = async (text) => {
  const prompt = `
Extract key information from this resume text.

STRICT RULES:
- Return ONLY JSON object
- Fields: skills (array), projects (array), experience (array), education (array)

Resume Text:
${text}

Format:
{
  "skills": ["..."],
  "projects": ["..."],
  "experience": ["..."],
  "education": ["..."]
}
`;

  const content = await callWithRetry(prompt);
  return safeParseJSON(content);
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
    return await callOpenRouter(prompt);
  } catch (err) {
    if (retries > 0) {
      console.warn("🔁 Retrying AI...");
      return callWithRetry(prompt, retries - 1);
    }
    throw err;
  }
};

/**
 * 🌐 OpenRouter Call
 */
const callOpenRouter = async (prompt) => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON. No markdown. No explanation. category MUST be exactly one of: General, Technical, Behavioral, Resume-based, Scenario-based, Coding. difficulty MUST be exactly one of: Beginner, Intermediate, Advanced."
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
export const generateQuestionsWithAI = async (resumeData, role, difficulty, focusAreas) => {
  const prompt = `
Generate 5 interview questions.

STRICT RULES:
- Return ONLY JSON array
- category MUST be EXACTLY one of these values: General, Technical, Behavioral, Resume-based, Scenario-based, Coding
- difficulty MUST be EXACTLY one of these values: Beginner, Intermediate, Advanced

Context:
Role: ${role}
Difficulty: ${difficulty}
Focus: ${focusAreas}
Resume: ${JSON.stringify(resumeData)}

Format:
[
  {
    "questionText": "...",
    "category": "Technical",
    "difficulty": "Intermediate",
    "suggestedAnswer": "..."
  }
]
`;

  const content = await callWithRetry(prompt);
  const parsed = safeParseJSON(content);

  console.log("🧠 RAW AI:", parsed);

  const normalized = parsed.map(normalizeQuestion);

  console.log("✅ NORMALIZED:", normalized);

  return normalized;
};

/**
 * 📊 Evaluation
 */
export const evaluateInterviewWithAI = async (interviewData, answers) => {
  const prompt = `
You are an expert interviewer. Your task is to evaluate the candidate's performance in this interview and generate a comprehensive diagnostic report.

Interview Context:
- Role: ${interviewData.role}
- Difficulty: ${interviewData.difficulty}
- Focus Areas: ${interviewData.focusAreas}

Questions & Answers to evaluate:
${answers.map((ans, idx) => `
Question ${idx + 1}: ${ans.question?.questionText || 'N/A'}
Category: ${ans.question?.category || 'General'}
Suggested Answer: ${ans.question?.suggestedAnswer || 'N/A'}
Candidate's Answer: ${ans.answerText || 'N/A'}
Code Snippet: ${ans.codeSnippet || 'N/A'}
`).join('\n')}

STRICT RULES:
1. Return ONLY a valid JSON object matching the format below.
2. The overallScore must be an integer between 0 and 100 representing the candidate's overall average performance.
3. The grade must be assigned based on the overallScore:
   - 95-100: "A+"
   - 90-94: "A"
   - 85-89: "B+"
   - 80-84: "B"
   - 70-79: "C+"
   - 60-69: "C"
   - 50-59: "D"
   - Below 50: "F"
4. The summary MUST be a detailed, encouraging, and clear paragraph (at least 3-4 sentences) summarizing the candidate's performance, communication style, and logical approach. It MUST NOT be empty or missing.
5. The strengths MUST be an array of 2 to 3 detailed strings highlighting what the candidate did well.
6. The weaknesses MUST be an array of 2 to 3 detailed strings highlighting specific areas for improvement.
7. The hiringRecommendation MUST be exactly one of: "Strongly Recommend", "Recommend", "Neutral", "Not Recommended".
8. The roadmap30Days MUST be an array of exactly 3 strings representing a 30-day mastery plan (Day 1-10 focus, Day 11-20 focus, Day 21-30 focus).
9. The questionWiseFeedback MUST be an array matching the candidate's answers, where each item contains:
   - questionText: The text of the question.
   - category: The category of the question.
   - answerScore: An integer between 0 and 100 for this specific answer's quality.
   - feedback: Clear, constructive mentor feedback about the answer.
   - suggestedImprovement: Next-level advice on how to improve this answer.

Expected Output Format:
{
  "overallScore": 85,
  "grade": "B+",
  "summary": "The candidate demonstrated solid technical and communication skills...",
  "strengths": ["Strong understanding of fundamental JS concepts...", "Clear and structured behavioral communication..."],
  "weaknesses": ["Needs to practice optimizing time complexity...", "Should explain design patterns more thoroughly..."],
  "hiringRecommendation": "Recommend",
  "roadmap30Days": [
    "Focus on deep understanding of advanced algorithms and data structures.",
    "Practice coding challenges daily focusing on runtime complexity.",
    "Refine communication and behavioral scenarios using the STAR method."
  ],
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
  return safeParseJSON(content);
};