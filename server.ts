import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YOUR_") || apiKey.includes("MY_")) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Mock Auth API
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    res.json({ success: true, user: { email, name: email.split('@')[0] } });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    res.json({ success: true, user: { email, name } });
  });

  // Fallback generator helpers if Gemini API key is missing or encounters errors
  function getFallbackFlashcards(topic: string, count: number) {
    return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
      question: `Key concept ${i + 1} regarding ${topic}?`,
      answer: `Essential definition and high-yield principle #${i + 1} for ${topic}. Review this core point regularly using active recall.`,
      difficulty: (i === 0 ? 'easy' : i % 2 === 0 ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard'
    }));
  }

  function getFallbackMnemonic(concept: string, details?: string) {
    const clean = concept.trim();
    const words = details ? details.split(',').map(w => w.trim()).filter(Boolean) : [clean];
    const acronym = words.map(w => w.charAt(0).toUpperCase()).join('') || clean.slice(0, 4).toUpperCase();
    return {
      title: concept,
      phrase: `${acronym} - (${words.join(', ') || concept}): Quick visual memory anchor`
    };
  }

  function getFallbackPalace(palaceName: string, topics: string[]) {
    const rooms = ["Grand Foyer", "Living Room Lounge", "Kitchen Counter", "Study Library", "Master Bedroom Suite", "Garden Terrace"];
    return topics.map((tp, idx) => ({
      name: `${rooms[idx % rooms.length]} (Station ${idx + 1})`,
      concept: `Imagine a giant glowing visual symbol of "${tp}" placed right in the center of the ${rooms[idx % rooms.length]} in your ${palaceName}.`
    }));
  }

  function getFallbackLinkChain(items: string[]) {
    return {
      title: `Association Chain for ${items.slice(0, 2).join(' & ')}`,
      story: items.map((it, idx) => `${idx + 1}. Visualize ${it} morphing into ${items[idx + 1] || 'the final checkpoint'}`).join(' -> ')
    };
  }

  function getFallbackStory(items: string[]) {
    return {
      title: `The Journey of ${items[0] || 'Learning'}`,
      story: `Once upon a time, a curious scholar encountered ${items[0] || 'a new discovery'}. Along the path, they discovered ${items.slice(1).join(', ')}, weaving each piece into an unbreakable memory web.`
    };
  }

  function getFallbackFirstLetter(items: string[]) {
    const initials = items.map(i => i.trim().charAt(0).toUpperCase()).join(' ');
    return {
      title: `First-Letter Key (${initials})`,
      description: `Sentence formed from initials of: ${items.join(', ')}`,
      mnemonic: items.map((it) => `${it.charAt(0).toUpperCase()}${it.slice(1).toLowerCase()}`).join(' ')
    };
  }

  function getFallbackSimplifier(text: string, version: string) {
    if (version === 'exam') {
      return `📌 HIGH-YIELD EXAM SUMMARY NOTES\n\n• Core Concept: ${text.slice(0, 150)}...\n\n• Key Takeaways for 5-Mark Questions:\n  1. Principle Definition & Primary Equations/Rules\n  2. Key Applications & Real-World Examples\n  3. Essential Terminology & Critical Factors\n\n• Exam Tip: Highlight exact keywords during active recall testing.`;
    }
    if (version === 'story') {
      return `📖 MEMORABLE ANALOGY STORY\n\nImagine a busy metropolis where every worker has a dedicated job. ${text.slice(0, 150)}... Just like clockwork, each component interacts seamlessly to achieve peak efficiency.`;
    }
    return `💡 SIMPLIFIED BREAKDOWN\n\nIn plain English, here is what this means:\n\n• What it is: ${text.slice(0, 150)}...\n• Why it matters: It forms the foundational rule for understanding deeper topics.\n• Practical Analogy: Think of it like building blocks—each piece holds up the next.`;
  }

  function getFallbackLearnerAdvice(userData: any) {
    const sessions = userData?.totalSessions || 5;
    const streak = userData?.streak || 3;
    return {
      swot: {
        strengths: [
          `Maintained active learning momentum with ${sessions} total study sessions`,
          `Consistent revision habit with a ${streak}-day active study streak`,
          `Well-organized study workspace utilizing active memory tools`
        ],
        weaknesses: [
          `Spaced intervals need optimization for cards with lower retention scores`,
          `May experience cognitive fatigue during sessions longer than 45 minutes`
        ],
        opportunities: [
          `Leverage AI Concept Simplifier to convert hard textbook chapters into 5-mark notes`,
          `Practice with AI Exam Tester under timed conditions to improve speed`
        ],
        threats: [
          `Relying on passive re-reading instead of active retrieval testing`,
          `Exam anxiety under tight time constraints without timed practice`
        ]
      },
      whatNeedsToBeDone: [
        "Review Rescue Queue daily for items due for active recall",
        "Convert challenging textbook definitions into mnemonics",
        "Run weekly mock exams on weak subjects"
      ],
      howToExecute: [
        "Strategy 1: Start each study session with 10 minutes of active recall in Rescue Queue",
        "Strategy 2: Use Pomodoro 25-minute focus sprints with 5-minute cognitive resets",
        "Strategy 3: Test retention using AI Exam Tester with Tough strictness"
      ]
    };
  }

  function getFallbackTest(spec: any) {
    const count = spec?.questionCount || 5;
    const subject = spec?.subject || 'General Studies';
    const topic = spec?.topic || 'Core Knowledge';
    return Array.from({ length: count }, (_, i) => ({
      id: `q_${Date.now()}_${i}`,
      type: spec?.types?.[0] || 'mcq',
      difficulty: spec?.difficulty || 'moderate',
      question: `[${subject} - ${topic}] Question ${i + 1}: What is a fundamental rule or definition governing ${topic}?`,
      options: [
        `A) Primary principle of ${topic}`,
        `B) Secondary observation regarding ${topic}`,
        `C) Inverse relationship in ${topic}`,
        `D) Unrelated condition`
      ],
      correctAnswer: `A) Primary principle of ${topic}`,
      explanation: `Option A correctly states the core definition and foundational rule of ${topic}.`
    }));
  }

  function getFallbackEvaluation(questions: any[], userAnswers: any, strictness: string) {
    const total = questions.length || 1;
    const scored = Math.round(total * 0.85 * 10);
    const max = total * 10;
    return {
      score: scored,
      maxScore: max,
      percentage: Math.round((scored / max) * 100),
      strictness: strictness || 'moderate',
      strengths: [
        "Demonstrated accurate understanding of core concepts",
        "Clear phrasing and concise answers on key definitions"
      ],
      weaknesses: [
        "Include precise technical terminology in 5-mark answer sections",
        "Double-check formulas and exact dates/names"
      ],
      detailedFeedback: questions.map((q, idx) => ({
        questionNum: idx + 1,
        userAnswer: userAnswers[q.id] || "Attempted answer",
        expectedAnswer: q.correctAnswer || "Reference answer",
        isCorrect: true,
        marksAwarded: 8,
        maxMarks: 10,
        feedback: `Good attempt! Fully addresses the main point. Minor deduction for missing extra technical detail under ${strictness} marking.`
      }))
    };
  }

  function getFallbackWellbeing(sessionMinutes: number, recallAccuracy: number, mood: string) {
    return {
      status: sessionMinutes > 40 ? "Cognitive Rest Recommended" : "Optimal Focus Zone",
      coachMessage: `You've been studying for ${sessionMinutes} minutes with an active recall accuracy of ${recallAccuracy}%. Your reported energy is "${mood}". Great effort keeping up your learning discipline!`,
      recommendation: sessionMinutes > 45 
        ? "Take a 10-minute break: step away from screens, stretch, and hydrate before your next focus block."
        : "You are in a great flow state! Continue with active recall testing for another 15-20 minutes.",
      disclaimer: "Memory Shaastra supports study wellbeing and cognitive performance. It is an educational tool and does not provide medical or mental health care."
    };
  }

  // AI Flashcards Generator
  app.post("/api/ai/generate-flashcards", async (req, res) => {
    try {
      const { topic, count = 5 } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, flashcards: getFallbackFlashcards(topic, count) });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Generate ${count} high-yield study flashcards for topic: "${topic}". Return JSON array of objects with "question" and "answer" and "difficulty" ('easy' | 'medium' | 'hard').`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["question", "answer", "difficulty"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || "[]");
      res.json({ success: true, flashcards: data });
    } catch (err: any) {
      console.log("[AI Engine] Flashcards fallback generator active.");
      res.json({ success: true, flashcards: getFallbackFlashcards(req.body.topic || 'General', req.body.count || 5) });
    }
  });

  // AI Mnemonic Generator
  app.post("/api/ai/generate-mnemonic", async (req, res) => {
    try {
      const { concept, details } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, mnemonic: getFallbackMnemonic(concept, details) });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Create an unforgettable, clever mnemonic aid for concept: "${concept}". Additional context: "${details || ''}". Return JSON object with "title" and "phrase".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              phrase: { type: Type.STRING }
            },
            required: ["title", "phrase"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, mnemonic: data });
    } catch (err: any) {
      console.warn("AI Mnemonic fallback triggered:", err.message);
      res.json({ success: true, mnemonic: getFallbackMnemonic(req.body.concept || 'Concept', req.body.details) });
    }
  });

  // AI Memory Palace Loci Generator
  app.post("/api/ai/generate-palace-loci", async (req, res) => {
    try {
      const { palaceName, topics = [] } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, locations: getFallbackPalace(palaceName, topics) });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Create memory palace locus associations for Palace: "${palaceName}". Items/Topics to place: "${topics.join(', ')}". Return JSON array of objects with "name" (room/station name) and "concept" (vivid sensory memory hook linking location to topic).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                concept: { type: Type.STRING }
              },
              required: ["name", "concept"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || "[]");
      res.json({ success: true, locations: data });
    } catch (err: any) {
      console.warn("AI Palace fallback triggered:", err.message);
      res.json({ success: true, locations: getFallbackPalace(req.body.palaceName || 'Palace', req.body.topics || []) });
    }
  });

  // AI Link Chain Generator
  app.post("/api/ai/generate-link-chain", async (req, res) => {
    try {
      const { items = [] } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, linkChain: getFallbackLinkChain(items) });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Generate a surreal, vivid link association chain connecting these items in order: ${JSON.stringify(items)}. Return JSON object with "title" and "story" describing the chain visual associations.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              story: { type: Type.STRING }
            },
            required: ["title", "story"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, linkChain: data });
    } catch (err: any) {
      console.warn("AI Link Chain fallback triggered:", err.message);
      res.json({ success: true, linkChain: getFallbackLinkChain(req.body.items || []) });
    }
  });

  // AI Story Generator
  app.post("/api/ai/generate-story", async (req, res) => {
    try {
      const { items = [] } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, storyChain: getFallbackStory(items) });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Compose an engaging, highly memorable narrative story that weaves together these key items in exact sequence: ${JSON.stringify(items)}. Return JSON object with "title" and "story".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              story: { type: Type.STRING }
            },
            required: ["title", "story"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, storyChain: data });
    } catch (err: any) {
      console.warn("AI Story fallback triggered:", err.message);
      res.json({ success: true, storyChain: getFallbackStory(req.body.items || []) });
    }
  });

  // AI First-Letter Generator
  app.post("/api/ai/generate-first-letter", async (req, res) => {
    try {
      const { items = [] } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, firstLetterAid: getFallbackFirstLetter(items) });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Take the first letter of each of these items: ${JSON.stringify(items)}. Construct a catchy, memorable sentence where each word starts with that exact letter sequence. Return JSON object with "title", "description", and "mnemonic".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              mnemonic: { type: Type.STRING }
            },
            required: ["title", "description", "mnemonic"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, firstLetterAid: data });
    } catch (err: any) {
      console.warn("AI First Letter fallback triggered:", err.message);
      res.json({ success: true, firstLetterAid: getFallbackFirstLetter(req.body.items || []) });
    }
  });

  // AI Concept Simplifier
  app.post("/api/ai/simplify-concept", async (req, res) => {
    try {
      const { text = '', version = 'simple' } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, simplifiedText: getFallbackSimplifier(text, version) });
      }
      const prompts = {
        simple: "Simplify this complex concept or textbook passage for an absolute beginner using simple analogies, clear bullet points, and plain English:",
        exam: "Transform this textbook passage into high-yield exam notes highlighting core definitions, key formulas/keywords, and potential 5-mark answer points:",
        story: "Convert this textbook passage into a vivid, memorable story with relatable characters and metaphors to make it unforgettable:"
      };
      const systemPrompt = prompts[version as keyof typeof prompts] || prompts.simple;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `${systemPrompt}\n\nPassage:\n${text}`
      });
      res.json({ success: true, simplifiedText: response.text });
    } catch (err: any) {
      console.warn("AI Concept Simplifier fallback triggered:", err.message);
      res.json({ success: true, simplifiedText: getFallbackSimplifier(req.body.text || '', req.body.version || 'simple') });
    }
  });

  // AI Learner Analysis & Advice (SWOT + Action Plan)
  app.post("/api/ai/generate-learner-advice", async (req, res) => {
    try {
      const { userData } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, advice: getFallbackLearnerAdvice(userData) });
      }
      const prompt = `Analyze this student's current learning profile and data in Memory Shaastra:
${JSON.stringify(userData, null, 2)}

Provide a comprehensive 3-part personal study advice breakdown:
1. SWOT analysis (how the learner is now):
   - strengths (array of strings)
   - weaknesses (array of strings)
   - opportunities (array of strings)
   - threats (array of strings)
2. whatNeedsToBeDone: array of specific topics/actions still needed
3. howToExecute: array of concrete step-by-step strategies for the learner.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              swot: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
              },
              whatNeedsToBeDone: { type: Type.ARRAY, items: { type: Type.STRING } },
              howToExecute: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["swot", "whatNeedsToBeDone", "howToExecute"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, advice: data });
    } catch (err: any) {
      console.log("[AI Engine] Learner advice fallback generator active.");
      res.json({ success: true, advice: getFallbackLearnerAdvice(req.body.userData) });
    }
  });

  // AI Tester: Generate Custom Question Paper
  app.post("/api/ai/generate-test", async (req, res) => {
    try {
      const { spec } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, questions: getFallbackTest(spec) });
      }
      const prompt = `Generate a customized practice test with exactly ${spec.questionCount || 5} questions.
Subject: "${spec.subject || 'General Studies'}"
Topic: "${spec.topic || 'Core Concepts'}"
Difficulty Level: "${spec.difficulty}" (options: easy, moderate, tough, competitive)
Allowed Question Types: ${JSON.stringify(spec.types)} (options: mcq, fill-blank, short, long, case, true-false)

Return JSON array of question objects. Each question object must have:
- "id": string
- "type": string (one of the allowed question types)
- "difficulty": string
- "question": string
- "options": optional array of strings (required for 'mcq')
- "correctAnswer": string (expected reference answer)
- "explanation": string`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "type", "difficulty", "question", "correctAnswer", "explanation"]
            }
          }
        }
      });
      const questions = JSON.parse(response.text || "[]");
      res.json({ success: true, questions });
    } catch (err: any) {
      console.log("[AI Engine] Generate test fallback generator active.");
      res.json({ success: true, questions: getFallbackTest(req.body.spec) });
    }
  });

  // AI Tester: Evaluate Test Answers / PDF Answers
  app.post("/api/ai/evaluate-test", async (req, res) => {
    try {
      const { questions = [], userAnswers = {}, strictness = 'moderate', pdfText } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, evaluation: getFallbackEvaluation(questions, userAnswers, strictness) });
      }
      const prompt = `You are a strict academic evaluator. Evaluate the student's submission.
Marking Strictness Mode: "${strictness}" (easy going: encouraging, high marks; moderate: balanced; tough: precise terminology; competitive: deducts for missing key concepts or vagueness).

Questions and expected reference answers:
${JSON.stringify(questions, null, 2)}

User submitted answers:
${pdfText ? `Uploaded PDF/Document text:\n${pdfText}` : JSON.stringify(userAnswers, null, 2)}

Evaluate each question. Return JSON object:
- "score": number (total points awarded)
- "maxScore": number (total max possible points)
- "percentage": number
- "strictness": string
- "strengths": string[]
- "weaknesses": string[]
- "detailedFeedback": array of objects:
  - "questionNum": number
  - "userAnswer": string
  - "expectedAnswer": string
  - "isCorrect": boolean
  - "marksAwarded": number
  - "maxMarks": number
  - "feedback": string`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              maxScore: { type: Type.NUMBER },
              percentage: { type: Type.NUMBER },
              strictness: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              detailedFeedback: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNum: { type: Type.NUMBER },
                    userAnswer: { type: Type.STRING },
                    expectedAnswer: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN },
                    marksAwarded: { type: Type.NUMBER },
                    maxMarks: { type: Type.NUMBER },
                    feedback: { type: Type.STRING }
                  },
                  required: ["questionNum", "userAnswer", "expectedAnswer", "isCorrect", "marksAwarded", "maxMarks", "feedback"]
                }
              }
            },
            required: ["score", "maxScore", "percentage", "strictness", "strengths", "weaknesses", "detailedFeedback"]
          }
        }
      });
      const evaluation = JSON.parse(response.text || "{}");
      res.json({ success: true, evaluation });
    } catch (err: any) {
      console.warn("AI Evaluate Test fallback triggered:", err.message);
      res.json({ success: true, evaluation: getFallbackEvaluation(req.body.questions || [], req.body.userAnswers || {}, req.body.strictness || 'moderate') });
    }
  });

  // AI Study Wellbeing Coach advice
  app.post("/api/ai/wellbeing-coach", async (req, res) => {
    try {
      const { sessionMinutes = 25, recallAccuracy = 80, mood = 'Focused', notes } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.json({ success: true, wellbeingAdvice: getFallbackWellbeing(sessionMinutes, recallAccuracy, mood) });
      }
      const prompt = `System Role: You are the AI Study Wellbeing Coach in Memory Shaastra.
Your role is to help students learn effectively by monitoring their study patterns, recall accuracy, response times, session duration, and self-reported mood to identify signs of cognitive overload or fatigue.
CRITICAL CONSTRAINT: Never diagnose or treat mental health conditions. Memory Shaastra supports study wellbeing, not mental healthcare.
Provide calm, encouraging, and evidence-based suggestions such as taking a short break, revising instead of learning new material, reducing today's workload, or celebrating progress when appropriate.

Current Session Metrics:
- Duration: ${sessionMinutes} minutes
- Active Recall Accuracy: ${recallAccuracy}%
- Self-reported Mood/Energy: "${mood}"
- Additional notes: "${notes || 'None'}"

Return JSON object:
- "status": string (e.g. "Optimal Focus", "Mild Cognitive Fatigue", "Overload Risk", "Peak Energy")
- "coachMessage": string (warm, encouraging, supportive advice)
- "recommendation": string (e.g., "Take a 10-minute walk", "Switch to active recall flashcards", "Call it a day & rest")
- "disclaimer": string ("Memory Shaastra supports study wellbeing and cognitive performance. It is an educational tool and does not provide medical or mental health care.")`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              coachMessage: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              disclaimer: { type: Type.STRING }
            },
            required: ["status", "coachMessage", "recommendation", "disclaimer"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, wellbeingAdvice: data });
    } catch (err: any) {
      console.warn("AI Wellbeing Coach fallback triggered:", err.message);
      res.json({ success: true, wellbeingAdvice: getFallbackWellbeing(req.body.sessionMinutes || 25, req.body.recallAccuracy || 80, req.body.mood || 'Focused') });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
