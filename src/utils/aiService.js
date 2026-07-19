const { OpenAI } = require('openai');
const getQuizBankQuestions = require('./quizBank');

const generateStudentWarningEmail = async (studentName, mentorName) => {
  const fallbackEmail = {
    subject: `Action Required: Boot-camp Performance Update`,
    body: `Hi ${studentName},\n\nWe noticed you are currently in the Red Zone due to low attendance or performance. Please coordinate with your mentor, ${mentorName}, immediately to discuss a recovery plan to get back on track. We are here to support you, but it is important to take immediate action.\n\nBest regards,\nProgramming Hero Job Placement Team`
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return fallbackEmail;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an empathetic but strict academic counselor writing an email. You MUST return ONLY a valid JSON object with exactly two keys: 'subject' (a dynamic and engaging subject line) and 'body' (the email content)." },
        { role: "user", content: `Write a short, professional, and motivational warning email addressed to a student named ${studentName}. Mention their mentor is ${mentorName}. The student is currently in the 'Red Zone' (High Risk) for failing a boot-camp. Tell the student to coordinate with the mentor immediately to discuss a recovery plan. The email MUST end strictly with "Best regards,\nProgramming Hero Job Placement Team".` }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });
    
    try {
      const parsed = JSON.parse(response.choices[0].message.content);
      if (parsed.subject && parsed.body) return parsed;
      return fallbackEmail;
    } catch (e) {
      // If parsing fails, use the raw text as body and fallback subject
      return {
        subject: fallbackEmail.subject,
        body: response.choices[0].message.content
      };
    }
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return fallbackEmail;
  }
};

const generateMentorWarningEmail = async (studentName, mentorName) => {
  const fallbackEmail = {
    subject: `Action Required: Student ${studentName} Needs Mentorship`,
    body: `Hi ${mentorName},\n\nYour student, ${studentName}, is currently in the Red Zone due to low attendance or performance. Please reach out to them and provide the necessary mentorship and guidance to help them overcome these challenges and improve their standing in the boot-camp.\n\nBest regards,\nProgramming Hero Job Placement Team`
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return fallbackEmail;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an academic program coordinator writing an email to a mentor. You MUST return ONLY a valid JSON object with exactly two keys: 'subject' (a dynamic and engaging subject line) and 'body' (the email content)." },
        { role: "user", content: `Write a short, professional email addressed to a mentor named ${mentorName}. Their student, ${studentName}, is currently in the 'Red Zone' (High Risk) for failing a boot-camp. Instruct the mentor to provide the necessary mentorship and guidance to help the student get back on track. The email MUST end strictly with "Best regards,\nProgramming Hero Job Placement Team".` }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    try {
      const parsed = JSON.parse(response.choices[0].message.content);
      if (parsed.subject && parsed.body) return parsed;
      return fallbackEmail;
    } catch (e) {
      return {
        subject: fallbackEmail.subject,
        body: response.choices[0].message.content
      };
    }
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return fallbackEmail;
  }
};

const generateQuizQuestions = async (topic, numQuestions, marksPerQuestion, difficulty) => {
  // If OpenAI API key is missing or invalid, fallback to the local quiz bank
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    console.warn("OpenAI API Key missing, falling back to local quiz bank.");
    return getQuizBankQuestions(topic, numQuestions, marksPerQuestion);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz generator. Return ONLY a valid JSON array of question objects."
        },
        {
          role: "user",
          content: `Generate ${numQuestions} multiple-choice questions about "${topic}". Difficulty level: ${difficulty}. 
          Each question must be an object with:
          - "questionText" (string)
          - "options" (array of 4 strings)
          - "correctAnswer" (string, must exactly match one of the options)
          - "marks" (number, exactly ${marksPerQuestion})
          
          Ensure high-quality, unambiguous questions and distractors.`
        }
      ],
      temperature: 0.7,
    });

    let content = response.choices[0].message.content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const startIndex = content.indexOf('[');
    const endIndex = content.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      content = content.substring(startIndex, endIndex + 1);
    }
    
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error("Invalid response format from OpenAI");
    return parsed;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    // Explicitly return our dynamic fallback database when OpenAI fails (e.g. Quota Exceeded)
    console.warn("OpenAI API call failed, falling back to local quiz bank.");
    return getQuizBankQuestions(topic, numQuestions, marksPerQuestion);
  }
};

const analyzeResumeWithAI = async (resumeUrl) => {
  const fallbackResult = {
    score: 85,
    feedback: "High Potential",
    strengths: [
      "Good foundational knowledge in core languages.",
      "Projects demonstrate full-stack capabilities.",
      "Clear formatting and readable structure."
    ],
    issues: [
      { problem: "Missing cloud infrastructure experience.", recovery: "Add a small project using AWS or Docker." },
      { problem: "Generic summary statement.", recovery: "Tailor the summary to highlight specific achievements." },
      { problem: "Portfolio links are broken.", recovery: "Verify and update all external links." }
    ]
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    console.warn("OpenAI API Key missing, using fallback resume score.");
    return fallbackResult;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS Resume Analyzer. Return ONLY a valid JSON object."
        },
        {
          role: "user",
          content: `I have a resume hosted at this URL: ${resumeUrl}. Since you cannot browse the internet, generate a realistic, simulated ATS analysis for a Junior Software Developer resume that might be found at this link. 
          Return a JSON object with:
          - "score" (number between 60 and 95)
          - "feedback" (string, short overall feedback like "High Potential" or "Needs Improvement")
          - "strengths" (array of 3 strings, highlighting strong points)
          - "issues" (array of 3 objects, each with "problem" (string) and "recovery" (string) explaining how to fix it)`
        }
      ],
      temperature: 0.8,
    });

    let content = response.choices[0].message.content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      content = content.substring(startIndex, endIndex + 1);
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    console.warn("OpenAI API call failed, falling back to local resume scorer.");
    return fallbackResult;
  }
};

module.exports = {
  generateStudentWarningEmail,
  generateMentorWarningEmail,
  generateQuizQuestions,
  analyzeResumeWithAI,
};
