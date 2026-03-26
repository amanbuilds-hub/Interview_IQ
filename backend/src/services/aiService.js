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
Return ONLY JSON.

Evaluate interview.

Interview: ${JSON.stringify(interviewData)}
Answers: ${JSON.stringify(answers)}
`;

  const content = await callWithRetry(prompt);
  return safeParseJSON(content);
};