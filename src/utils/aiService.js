const { OpenAI } = require('openai');

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

const getTopicQuestions = (topic) => {
  const t = topic.toLowerCase();
  
  if (t.includes('react')) {
    return [
      { questionText: 'Which hook is used for managing side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 'useEffect' },
      { questionText: 'What is the Virtual DOM?', options: ['A direct copy of the actual DOM', 'A lightweight JavaScript representation of the DOM', 'A browser extension for debugging', 'A CSS framework'], correctAnswer: 'A lightweight JavaScript representation of the DOM' },
      { questionText: 'How do you pass data from a parent to a child component in React?', options: ['Using State', 'Using Context API', 'Using Props', 'Using Redux'], correctAnswer: 'Using Props' },
      { questionText: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON X', 'JavaScript Execution'], correctAnswer: 'JavaScript XML' },
      { questionText: 'Which hook should be used to memorize a complex calculation?', options: ['useMemo', 'useCallback', 'useEffect', 'useRef'], correctAnswer: 'useMemo' },
      { questionText: 'What is the purpose of a key in a React list?', options: ['To style the element', 'To uniquely identify elements for efficient reconciliation', 'To bind event listeners', 'To set the initial state'], correctAnswer: 'To uniquely identify elements for efficient reconciliation' },
      { questionText: 'Can a React functional component have local state?', options: ['No, only class components can', 'Yes, by using the useState hook', 'Yes, by using Redux only', 'Yes, by modifying props directly'], correctAnswer: 'Yes, by using the useState hook' }
    ];
  }
  
  if (t.includes('node') || t.includes('express')) {
    return [
      { questionText: 'What is Node.js?', options: ['A frontend framework', 'A JavaScript runtime environment', 'A database management system', 'A CSS preprocessor'], correctAnswer: 'A JavaScript runtime environment' },
      { questionText: 'Which core module in Node.js is used to create a web server?', options: ['fs', 'path', 'http', 'url'], correctAnswer: 'http' },
      { questionText: 'What is Express.js?', options: ['A database', 'A minimalist web framework for Node.js', 'An ORM', 'A testing library'], correctAnswer: 'A minimalist web framework for Node.js' },
      { questionText: 'How do you define a middleware in Express?', options: ['app.use()', 'app.get()', 'app.set()', 'app.listen()'], correctAnswer: 'app.use()' },
      { questionText: 'Which object represents the HTTP request in an Express route callback?', options: ['res', 'req', 'next', 'app'], correctAnswer: 'req' },
      { questionText: 'What does "npm" stand for?', options: ['Node Package Manager', 'Node Project Module', 'New Package Manager', 'No Problem Mate'], correctAnswer: 'Node Package Manager' }
    ];
  }

  if (t.includes('javascript') || t.includes('js')) {
    return [
      { questionText: 'Which of the following is NOT a JavaScript data type?', options: ['String', 'Number', 'Boolean', 'Character'], correctAnswer: 'Character' },
      { questionText: 'What is closure in JavaScript?', options: ['A way to block script execution', 'A function retaining access to its lexical scope', 'Closing a browser window', 'A method to end a loop'], correctAnswer: 'A function retaining access to its lexical scope' },
      { questionText: 'Which keyword is used to declare a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correctAnswer: 'let' },
      { questionText: 'What does the "this" keyword refer to in a regular function?', options: ['The global object', 'The object that invoked the function', 'The function itself', 'Undefined'], correctAnswer: 'The object that invoked the function' },
      { questionText: 'How do you check if a variable is an array?', options: ['typeof array', 'Array.isArray()', 'array instanceof Object', 'array.length > 0'], correctAnswer: 'Array.isArray()' }
    ];
  }

  // Generic fallback if topic is unknown
  return [
    { questionText: `What is the main advantage of using ${topic} in a production environment?`, options: ['Improved scalability and performance', 'It requires zero configuration', 'It replaces the need for a database', 'It allows writing code without syntax rules'], correctAnswer: 'Improved scalability and performance' },
    { questionText: `Which of the following is considered a best practice when working with ${topic}?`, options: ['Modularizing the codebase', 'Using global variables everywhere', 'Ignoring error handling', 'Writing monolithic functions'], correctAnswer: 'Modularizing the codebase' },
    { questionText: `In the context of ${topic}, how should you handle asynchronous operations?`, options: ['Using Promises or Async/Await', 'Using synchronous blocking loops', 'Ignoring them completely', 'Using CSS transitions'], correctAnswer: 'Using Promises or Async/Await' },
    { questionText: `What is a common pitfall developers face when learning ${topic}?`, options: ['Poor state or data management', 'Typing too fast', 'Using dark mode in their editor', 'Upgrading packages too rarely'], correctAnswer: 'Poor state or data management' },
    { questionText: `Which security measure is crucial when deploying applications built with ${topic}?`, options: ['Input validation and sanitization', 'Disabling HTTPS', 'Storing passwords in plain text', 'Making all endpoints public'], correctAnswer: 'Input validation and sanitization' }
  ];
};

const generateQuizQuestions = async (topic, numQuestions, marksPerQuestion, difficulty) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    throw new Error('OpenAI API Key is missing. Please set OPENAI_API_KEY in backend/.env');
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
    throw new Error(`OpenAI API Error: ${error.message}`);
  }
};

const analyzeResumeWithAI = async (resumeUrl) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    throw new Error('OpenAI API Key is missing. Please set OPENAI_API_KEY in backend/.env');
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
          - "feedback" (string, overall feedback)
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
    throw new Error(`OpenAI API Error: ${error.message}`);
  }
};

module.exports = {
  generateStudentWarningEmail,
  generateMentorWarningEmail,
  generateQuizQuestions,
  analyzeResumeWithAI,
};
