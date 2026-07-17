import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());

// Serve the assets directory at the root /assets
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// Lazy initialize Gemini client safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return ai;
}

// 1. API: AI Reflection Generator for a journal entry
app.post("/api/gemini/reflect", async (req, res) => {
  const { text, mood, prompt } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Entry text is required" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback mock when offline or key is missing
    const fallbacks = [
      `It sounds like you went through some meaningful experiences today. Reflecting on your feeling of being ${mood || 'yourself'} is a wonderful step towards deeper self-awareness. Remember that every emotion has its own wisdom.`,
      `Thank you for sharing these thoughts. Writing about "${prompt || 'your day'}" allows you to capture these transient moments of life. Keep listening to your inner world.`,
      `Your journal reveals a quiet dedication to personal growth. Acknowledging these details about your day is a beautiful form of self-care.`
    ];
    const mockReflect = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ reflection: mockReflect, isFallback: true });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are DearDiary AI, an incredibly warm, empathetic, and insightful journaling companion. 
The user is writing about the prompt: "${prompt || 'Daily Reflection'}".
They logged their mood as: "${mood || 'reflective'}".
Here is their journal entry:
"${text}"

Provide a short, deeply compassionate, and helpful reflection (2-3 sentences max).
Do not offer unsolicited advice, but highlight their strengths, validate their emotions, and encourage them gently. 
Speak in a warm, humble, human tone.`,
    });

    res.json({ reflection: response.text || "A beautiful reflection on your day." });
  } catch (error: any) {
    console.error("Gemini reflection error:", error);
    res.status(500).json({ error: "Failed to generate reflection from Gemini" });
  }
});

// 2. API: Chat with DearDiary AI companion
app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Offline/Fallback AI companion responses
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    let mockReply = "I'm listening. Journaling is a safe space to unload any thoughts you have. Tell me more about what's on your mind today?";
    if (lastUserMessage.toLowerCase().includes("friend") || lastUserMessage.toLowerCase().includes("talked")) {
      mockReply = "Reconnecting and talking with someone in your life can bring so much clarity and comfort. It's beautiful to share those simple, casual conversations. How do you feel after talking to them?";
    } else if (lastUserMessage.toLowerCase().includes("sad") || lastUserMessage.toLowerCase().includes("tired")) {
      mockReply = "It's completely okay to feel tired or down. You don't have to carry it all. Taking a quiet moment to write it down is a lovely act of self-care. What would feel most comforting for you right now?";
    }
    return res.json({ reply: mockReply, isFallback: true });
  }

  try {
    // Map previous messages to Gemini contents structure
    const promptContents = messages.map((m: any) => {
      return {
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      };
    });

    const systemInstruction = `You are DearDiary AI ✨, a compassionate, warm, and comforting journaling companion.
Your purpose is to listen, provide validating responses, and guide the user in gentle reflection.
Keep your answers brief (1-3 sentences), warm, and natural.
Never lecture, judge, or overwhelm. Ask simple, open-ended questions that invite deeper reflection.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptContents,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text || "I am always here to listen to your inner world." });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    res.status(500).json({ error: "Failed to communicate with DearDiary AI" });
  }
});

// 3. API: Analyze Mood and suggest tags from journal text
app.post("/api/gemini/analyze-mood", async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Safe mock heuristics
    let predicted: string = "calm";
    let tags: string[] = ["Reflection"];
    const lower = text.toLowerCase();
    if (lower.includes("happy") || lower.includes("great") || lower.includes("smile") || lower.includes("good")) {
      predicted = "happy";
      tags = ["Joy", "Gratitude"];
    } else if (lower.includes("grateful") || lower.includes("thank") || lower.includes("blessed")) {
      predicted = "grateful";
      tags = ["Appreciation", "Thankful"];
    } else if (lower.includes("sad") || lower.includes("hurt") || lower.includes("cry") || lower.includes("miss")) {
      predicted = "sad";
      tags = ["Comfort", "Processing"];
    } else if (lower.includes("anxious") || lower.includes("worry") || lower.includes("scared") || lower.includes("stress")) {
      predicted = "anxious";
      tags = ["Letting Go", "Mindfulness"];
    } else if (lower.includes("motivate") || lower.includes("work") || lower.includes("achieve") || lower.includes("focus")) {
      predicted = "motivated";
      tags = ["Productivity", "Energy"];
    }
    return res.json({ mood: predicted, tags, isFallback: true });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following diary text. Determine which of these 6 moods fits best: 'happy', 'calm', 'grateful', 'anxious', 'sad', 'motivated'.
Also output 1-3 appropriate tags (e.g. "Work", "Relationships", "Joy", "Mindfulness").
Return strictly as a JSON object of this structure:
{
  "mood": "happy" | "calm" | "grateful" | "anxious" | "sad" | "motivated",
  "tags": ["Tag1", "Tag2"]
}

Diary Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
      }
    });

    let result: any = {};
    const responseText = response.text || "";
    try {
      const trimmed = responseText.trim();
      // Try parsing directly
      result = JSON.parse(trimmed);
    } catch (parseErr) {
      // Fallback: extract the JSON object bounded by the first '{' and last '}'
      try {
        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          const extracted = responseText.substring(start, end + 1);
          result = JSON.parse(extracted);
        } else {
          throw parseErr;
        }
      } catch (fallbackErr) {
        console.error("Failed to parse Gemini JSON. Response was:", responseText);
        throw fallbackErr;
      }
    }
    res.json({ mood: result.mood || "calm", tags: result.tags || ["Reflection"] });
  } catch (error) {
    console.error("Gemini mood analysis error:", error);
    res.json({ mood: "calm", tags: ["Reflection"] });
  }
});

// 4. API: Proxy Waitlist Formspark submission to prevent adblocker and CORS issues
app.post("/api/waitlist", async (req, res) => {
  const { name, email } = req.body;
  const formsparkActionUrl = "https://submit-form.com/lJkJs3bKv";

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    console.log(`Submitting waitlist request to Formspark for ${email}`);
    const response = await fetch(formsparkActionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    // Parse the response from Formspark
    let responseData: any = {};
    try {
      responseData = await response.json();
    } catch (e) {
      // Formspark sometimes doesn't return JSON or fails to parse
    }
    console.log("Formspark Response Status:", response.status, "Data:", responseData);

    if (response.ok) {
      return res.json({ success: true });
    } else {
      return res.status(response.status).json({
        error: responseData.message || responseData.error || "Formspark submission failed",
        details: responseData
      });
    }
  } catch (error: any) {
    console.error("Proxy waitlist error:", error);
    return res.status(500).json({
      error: "Failed to connect to Formspark server. Please check connection.",
      details: error?.message || String(error)
    });
  }
});

// Setup Vite or static serving based on production
async function startServer() {
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
    console.log(`DearDiary Server running on http://localhost:${PORT}`);
  });
}

startServer();
