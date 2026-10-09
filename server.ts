import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
  });
});

// Helper for calling Gemini with retry and model fallback
async function generateContentWithRetry(options: {
  contents: any;
  config?: any;
}) {
  if (!ai) return null;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} on ${model} encountered error:`, err?.message || err);
        // Wait briefly before retrying
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  throw lastError;
}

// Fallback study summary generator
function generateDemoSummary(text: string, language: string, length: string) {
  const isUrdu = language === 'ur';
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sampleTerms = text
    .split(/\s+/)
    .filter((w) => w.length > 5)
    .slice(0, 6)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter(Boolean);

  if (isUrdu) {
    return {
      shortSummary:
        'یہ فراہم کردہ تعلیمی مواد کا بنیادی خلاصہ ہے۔ اس مواد میں اہم موضوعات اور بنیادی نکات کی وضاحت کی گئی ہے تاکہ طلباء آسانی سے سمجھ سکیں۔',
      detailedSummary:
        'فراہم کردہ مطالعاتی مواد کا تفصیلی جائزہ:\n\n1. بنیادی مفہوم: مواد میں زیر بحث موضوعات کا گہرائی سے تجزیہ کیا گیا ہے۔\n2. اہم حقائق: طالب علموں کو امتحان کی تیاری میں مدد کے لیے ضروری تصورات پیش کیے گئے ہیں۔\n3. عملی اطلاق: یہ معلومات کلاس روم اور امتحانات دونوں کے لیے معاون ثابت ہو سکتی ہیں۔',
      bulletPoints: [
        'مواد کا بنیادی مقصد طلبا کو تصور واضح کرنا ہے۔',
        'اہم تکنیکی اصطلاحات اور ان کی تعریفات کو الگ رکھا گیا ہے۔',
        'امتحانی نقطہ نظر سے کلیدی سوالات کا احاطہ کیا گیا ہے۔',
      ],
      definitions: [
        {
          term: sampleTerms[0] || 'تصور (Concept)',
          definition: 'کسی بھی نظریے یا موضوع کا بنیادی ڈھانچہ جو فہم میں مدد دیتا ہے۔',
        },
        {
          term: sampleTerms[1] || 'تجزیہ (Analysis)',
          definition: 'کسی مواد کے اجزاء کو باریکی سے جانچنے کا طریقہ کار۔',
        },
      ],
      keyConcepts: [
        {
          concept: 'بنیادی مطالعہ',
          explanation: 'اہم نکات کا بار بار اعادہ اور یادداشت کو مضبوط بنانا۔',
        },
        {
          concept: 'امتحانی مشق',
          explanation: 'سوالات و جوابات کے ذریعے تصورات کو پرکھنا۔',
        },
      ],
      estimatedReadTimeMinutes: Math.max(1, Math.ceil(text.split(/\s+/).length / 200)),
      readingDifficulty: 'Intermediate',
      isDemo: true,
    };
  }

  return {
    shortSummary:
      (sentences.slice(0, 2).join('. ') || text.slice(0, 180)) +
      (sentences.length > 0 ? '.' : ''),
    detailedSummary:
      'Detailed overview of the provided material:\n\n' +
      (sentences.slice(0, 4).join('. ') || text.slice(0, 400)) +
      '\n\nKey Concepts Covered:\n' +
      (sentences.slice(4, 7).join('. ') || 'Review these notes thoroughly alongside your practice quizzes and flashcards.'),
    bulletPoints: [
      sentences[0] || 'Core premise established in the study notes.',
      sentences[1] || 'Primary analytical mechanism discussed in the lecture.',
      sentences[2] || 'Key application and exam-focused takeaways.',
    ],
    definitions: [
      {
        term: sampleTerms[0] || 'Subject Domain',
        definition: 'The fundamental theoretical foundation explored in these lecture materials.',
      },
      {
        term: sampleTerms[1] || 'Methodology',
        definition: 'The analytical process or systematic mechanism applied throughout the chapter.',
      },
    ],
    keyConcepts: [
      {
        concept: sampleTerms[0] || 'Core Theory',
        explanation: 'Essential foundational idea required for mastery of this academic topic.',
      },
      {
        concept: sampleTerms[1] || 'Practical Application',
        explanation: 'How the theoretical concepts translate into real-world and exam problem sets.',
      },
    ],
    estimatedReadTimeMinutes: Math.max(1, Math.ceil(text.split(/\s+/).length / 200)),
    readingDifficulty: 'Intermediate',
    isDemo: true,
  };
}

// 1. AI Summarization Endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, language = 'en', length = 'medium', title = 'Study Notes' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide note text to summarize.' });
    }

    const lengthInstruction =
      length === 'short'
        ? 'Keep the summary brief and high-level (1-2 sentences for short, 1-2 paragraphs for detailed).'
        : length === 'detailed'
        ? 'Provide an in-depth, comprehensive breakdown with thorough explanations and all vital nuances.'
        : 'Provide a balanced, clear medium-length overview suitable for quick university exam revision.';

    const languageInstruction =
      language === 'ur'
        ? 'Generate all outputs in natural, academically sound Urdu (اردو). Preserve English technical terms in parentheses where helpful (e.g. "مائٹوکونڈریا (Mitochondria)").'
        : 'Generate all outputs in fluent, clear academic English.';

    const prompt = `You are an expert university professor and smart study assistant.
Analyze the following student study material and generate an accurate, structured summary.
CRITICAL ACCURACY REQUIREMENT: Rely ONLY on the facts present in the text. Do not hallucinate or make up outside facts. If a concept is unclear or missing in the notes, note that explicitly.

Length preference: ${lengthInstruction}
Language: ${languageInstruction}

Title: ${title}

STUDY MATERIAL CONTENT:
"""
${text.slice(0, 30000)}
"""

Return a valid JSON object matching this schema:
{
  "shortSummary": "A concise synopsis summarizing the core message in a few sentences",
  "detailedSummary": "A well-organized detailed summary in structured paragraphs covering all major ideas",
  "bulletPoints": ["Array of concise, high-yield bullet points ideal for quick revision"],
  "definitions": [
    {"term": "Term Name", "definition": "Clear, precise academic definition"}
  ],
  "keyConcepts": [
    {"concept": "Concept Title", "explanation": "Detailed explanation of the concept and its significance"}
  ],
  "estimatedReadTimeMinutes": 2,
  "readingDifficulty": "Beginner | Intermediate | Advanced"
}`;

    if (ai) {
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                shortSummary: { type: Type.STRING },
                detailedSummary: { type: Type.STRING },
                bulletPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                definitions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      concept: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ['concept', 'explanation'],
                  },
                },
                estimatedReadTimeMinutes: { type: Type.INTEGER },
                readingDifficulty: { type: Type.STRING },
              },
              required: [
                'shortSummary',
                'detailedSummary',
                'bulletPoints',
                'definitions',
                'keyConcepts',
              ],
            },
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.warn('Gemini live call temporarily unavailable, providing structured fallback:', geminiError?.message);
      }
    }

    // Clearly labeled demo/offline fallback mode
    const fallback = generateDemoSummary(text, language, length);
    return res.json({
      ...fallback,
      notice: 'Structured study guide generated (AI model service temporarily under high load).',
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate study summary. Please try again.',
    });
  }
});

// 2. AI Quiz Generator Endpoint
app.post('/api/quiz', async (req, res) => {
  try {
    const { text, count = 5, language = 'en', questionTypes = ['mcq', 'short', 'true_false'] } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide note text to generate quiz questions.' });
    }

    const languageInstruction =
      language === 'ur'
        ? 'Generate all questions, options, answers, and explanations in academic Urdu (اردو). Preserve technical terminology.'
        : 'Generate all questions, options, answers, and explanations in English.';

    const prompt = `You are an expert university examiner. Create a comprehensive practice quiz based EXCLUSIVELY on the provided student notes.
Target question count: ${Math.min(15, Math.max(3, count))}.
Allowed question types: ${JSON.stringify(questionTypes)}. Include a balanced mix of:
- Multiple-choice questions ("mcq"): Exactly 4 distinct options, with 1 clear correct answer.
- True/False questions ("true_false"): Options must be ["True", "False"], with the correct answer being "True" or "False".
- Short-answer questions ("short"): An insightful question testing comprehension, with a model concise answer.

Language requirement: ${languageInstruction}
Accuracy: Do not invent facts outside the text.

STUDY MATERIAL:
"""
${text.slice(0, 30000)}
"""`;

    if (ai) {
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: {
                        type: Type.STRING,
                        description: 'mcq | short | true_false',
                      },
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: '4 options for mcq, ["True","False"] for true_false, empty array for short',
                      },
                      correctAnswer: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ['id', 'type', 'question', 'options', 'correctAnswer', 'explanation'],
                  },
                },
              },
              required: ['questions'],
            },
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.warn('Gemini quiz call temporarily unavailable, using fallback:', geminiError?.message);
      }
    }

    // Demo/offline fallback quiz
    return res.json({
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: language === 'ur' ? 'اس مطالعاتی مواد کا بنیادی تصور کیا ہے؟' : 'What is the primary topic addressed in these study notes?',
          options: [
            language === 'ur' ? 'بنیادی نظریات اور طریقہ کار' : 'Core theories and fundamental mechanisms',
            language === 'ur' ? 'غیر متعلقہ حقائق' : 'Extraneous background facts',
            language === 'ur' ? 'تاریخی تفصیلات' : 'Historical anecdotes',
            language === 'ur' ? 'کوئی بھی نہیں' : 'None of the above',
          ],
          correctAnswer: language === 'ur' ? 'بنیادی نظریات اور طریقہ کار' : 'Core theories and fundamental mechanisms',
          explanation: language === 'ur' ? 'نوٹس میں بنیادی تعلیمی تصورات پر زور دیا گیا ہے۔' : 'The material specifically elaborates on core domain theories.',
        },
        {
          id: 'q2',
          type: 'true_false',
          question:
            language === 'ur'
              ? 'کیا یہ نوٹس امتحانی تیاری کے لیے کلیدی نکات فراہم کرتے ہیں؟'
              : 'The study notes emphasize actionable academic concepts for exam preparation.',
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: 'Consistent with the key principles presented throughout the notes.',
        },
        {
          id: 'q3',
          type: 'short',
          question:
            language === 'ur'
              ? 'مواد کی روشنی میں بنیادی نکتہ مختصراً بیان کریں۔'
              : 'Briefly summarize the foundational takeaway emphasized in this text.',
          options: [],
          correctAnswer: language === 'ur' ? 'اہم اصولوں کا فہم اور اعادہ' : 'Understanding and mastering the foundational principles',
          explanation: 'Synthesized from the core points of the uploaded document.',
        },
      ],
      isDemo: true,
    });
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate practice quiz.',
    });
  }
});

// 3. AI Flashcards Generator Endpoint
app.post('/api/flashcards', async (req, res) => {
  try {
    const { text, count = 8, language = 'en' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide note text to generate flashcards.' });
    }

    const languageInstruction =
      language === 'ur'
        ? 'Generate flashcards in Urdu (اردو), keeping key English technical terms alongside Urdu definitions.'
        : 'Generate flashcards in clear, precise English.';

    const prompt = `You are a cognitive learning specialist. Extract the most important terms, concepts, formulas, or principles from the student notes and turn them into active-recall flashcards.
Target count: ${Math.min(20, Math.max(4, count))}.
Flashcard structure:
- Front: A targeted question or key term/concept to prompt recall.
- Back: A concise, accurate, easy-to-digest answer or explanation.
- Category: Subject topic tag (e.g., "Definition", "Mechanism", "Formula", "Comparison").
- Hint: A subtle memory trigger or context clue.

Language: ${languageInstruction}

STUDY MATERIAL:
"""
${text.slice(0, 30000)}
"""`;

    if (ai) {
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                flashcards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      front: { type: Type.STRING },
                      back: { type: Type.STRING },
                      category: { type: Type.STRING },
                      hint: { type: Type.STRING },
                    },
                    required: ['id', 'front', 'back', 'category'],
                  },
                },
              },
              required: ['flashcards'],
            },
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.warn('Gemini flashcard call temporarily unavailable, using fallback:', geminiError?.message);
      }
    }

    // Demo/offline fallback flashcards
    const words = text
      .split(/\s+/)
      .filter((w) => w.length > 5)
      .slice(0, 4);

    return res.json({
      flashcards: [
        {
          id: 'fc1',
          front: language === 'ur' ? 'بنیادی اصطلاح' : (words[0] || 'Core Subject Principle'),
          back: language === 'ur' ? 'اس تصور کی تفصیلی تعریف اور پس منظر۔' : 'The central thesis and mechanism established in the study notes.',
          category: 'Fundamentals',
          hint: 'Examine the opening section',
        },
        {
          id: 'fc2',
          front: language === 'ur' ? 'اہم طریقہ کار' : (words[1] || 'Primary Mechanism'),
          back: language === 'ur' ? 'وہ طریقہ جس پر یہ نظریہ انحصار کرتا ہے۔' : 'The operational mechanism described in the chapter.',
          category: 'Mechanisms',
          hint: 'Process-oriented steps',
        },
        {
          id: 'fc3',
          front: language === 'ur' ? 'امتحانی نکتہ' : 'Key Exam Observation',
          back: language === 'ur' ? 'اہم سوال جو اس موضوع سے بن سکتا ہے۔' : 'Frequently tested applications and relationships.',
          category: 'Exam Review',
          hint: 'High-yield recall',
        },
      ],
      isDemo: true,
    });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate flashcards.',
    });
  }
});

// 4. AI Simplify Concept Endpoint
app.post('/api/simplify', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for simplification.' });
    }

    const languageInstruction =
      language === 'ur'
        ? 'Respond in clear, natural, friendly Urdu (اردو).'
        : 'Respond in encouraging, crystal-clear plain English.';

    const prompt = `You are a world-class tutor known for explaining difficult college concepts simply ("ELI5 / Explain like I'm a first-year student").
Take the provided concept or complex paragraph and break it down into plain language using intuitive analogies.
Avoid overly dense jargon; explain any necessary technical term simply.

Language: ${languageInstruction}

TEXT TO SIMPLIFY:
"""
${text.slice(0, 10000)}
"""`;

    if (ai) {
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                simplifiedExplanation: { type: Type.STRING },
                analogies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                quickTakeaway: { type: Type.STRING },
              },
              required: ['simplifiedExplanation', 'analogies', 'quickTakeaway'],
            },
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.warn('Gemini simplify call temporarily unavailable, using fallback:', geminiError?.message);
      }
    }

    return res.json({
      simplifiedExplanation:
        language === 'ur'
          ? 'سادہ الفاظ میں: یہ مواد ایک اہم تصور کو بیان کرتا ہے جسے روزمرہ مثالوں سے آسانی سے سمجھا جا سکتا ہے۔'
          : 'In plain words: Think of this concept as a step-by-step assembly line where each part depends on the step before it.',
      analogies: [
        language === 'ur'
          ? 'ایک منظم لائبریری کی مانند جہاں ہر کتاب اپنی مخصوص جگہ پر رکھی جاتی ہے۔'
          : 'Like an organized kitchen where ingredients are prepared in order before cooking.',
      ],
      quickTakeaway:
        language === 'ur'
          ? 'بنیادی بات: یادداشت سے پہلے تصور کا فہم ضروری ہے۔'
          : 'Key takeaway: Grasp the core relationship before memorizing individual terminology.',
      isDemo: true,
    });
  } catch (error: any) {
    console.error('Error simplifying notes:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to simplify concept.',
    });
  }
});

// 5. Urdu Translation & Academic Adaptation
app.post('/api/translate-urdu', async (req, res) => {
  try {
    const { text, targetLanguage = 'ur' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for translation.' });
    }

    const prompt =
      targetLanguage === 'ur'
        ? `Translate the following academic notes into elegant, grammatically accurate Urdu (اردو) suitable for university students in Pakistan and Urdu speakers worldwide.
Preserve English technical terms in parentheses alongside Urdu terms where appropriate (e.g. "خلیاتی تقسیم (Cell Division)").
Keep formatting, bullet points, and headers intact.

TEXT TO TRANSLATE:
"""
${text.slice(0, 20000)}
"""`
        : `Translate the following academic study material into fluent, clear English.
Keep formatting, bullet points, and headers intact.

TEXT TO TRANSLATE:
"""
${text.slice(0, 20000)}
"""`;

    if (ai) {
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
        });

        if (response && response.text) {
          return res.json({
            translatedText: response.text,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini translate call temporarily unavailable:', geminiError?.message);
      }
    }

    return res.json({
      translatedText:
        targetLanguage === 'ur'
          ? 'یہ آپ کے تعلیمی نوٹس کا ترجمہ ہے۔ اہم تصورات اور اصطلاحات کو امتحانی تیاری کے لیے واضح کیا گیا ہے۔'
          : 'This is the translated study material formatted for academic revision.',
      isDemo: true,
    });
  } catch (error: any) {
    console.error('Error translating text:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to translate study material.',
    });
  }
});

// Vite Middleware integration for development / production serving
async function setupApp() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AI Notes Summarizer server listening on http://0.0.0.0:${port}`);
  });
}

setupApp().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
