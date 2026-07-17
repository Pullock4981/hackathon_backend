const { OpenAI } = require('openai');

const generateWarningEmail = async (studentName, mentorName) => {
  // Fallback if OpenAI key is missing or invalid
  const fallbackEmail = `
    Hi ${studentName},\n
    We noticed you are currently in the Red Zone due to low attendance or performance.\n
    Please reach out to your mentor, ${mentorName}, immediately to discuss how we can help you get back on track.\n
    Best regards,\n
    Hackathon Admin
  `;

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
          content: `Write a short, professional, and motivational warning email to a student named ${studentName} who is currently in the 'Red Zone' (High Risk) for failing a boot-camp. Tell them to contact their mentor, ${mentorName}, immediately for guidance.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return fallbackEmail;
  }
};

module.exports = {
  generateWarningEmail,
};
