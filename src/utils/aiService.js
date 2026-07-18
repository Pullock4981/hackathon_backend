const { OpenAI } = require('openai');

const generateWarningEmail = async (studentName, mentorName) => {
  // Fallback if OpenAI key is missing or invalid
  const fallbackEmail = `Hi ${studentName} and Mentor ${mentorName},

${studentName}, we noticed you are currently in the Red Zone due to low attendance or performance. Please coordinate with your mentor immediately to discuss a recovery plan to get back on track.

${mentorName}, as ${studentName}'s mentor, please provide the necessary mentorship and guidance to help them overcome these challenges and improve their standing in the boot-camp.

Best regards,
Programming Hero Job Placement Team`;

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return fallbackEmail;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an empathetic but strict academic counselor writing an email."
        },
        {
          role: "user",
          content: `Write a short, professional, and motivational warning email addressed to both a student named ${studentName} and their mentor named ${mentorName}. The student is currently in the 'Red Zone' (High Risk) for failing a boot-camp. Tell the student to coordinate with the mentor immediately. Instruct the mentor to provide the necessary mentorship and guidance to help the student get back on track. The email MUST end strictly with "Best regards,\nProgramming Hero Job Placement Team".`
        }
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return fallbackEmail;
  }
};

const generateQuizQuestions = async (topic, numQuestions, marksPerQuestion, difficulty) => {
  const fallbackQuestions = Array.from({ length: numQuestions }).map((_, idx) => ({
    questionText: `(Fallback) Sample Question ${idx + 1} about ${topic} (${difficulty})?`,
    options: ['Option A', 'Option B', 'Option C (Correct)', 'Option D'],
    correctAnswer: 'Option C (Correct)',
    marks: marksPerQuestion
  }));

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return fallbackQuestions;
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

    const parsed = JSON.parse(response.choices[0].message.content);
    return Array.isArray(parsed) ? parsed : fallbackQuestions;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return fallbackQuestions;
  }
};

module.exports = {
  generateWarningEmail,
  generateQuizQuestions,
};
