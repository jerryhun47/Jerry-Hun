import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API endpoints FIRST
  app.get('/api/ai-config', (req, res) => {
    try {
      if (fs.existsSync(path.join(process.cwd(), 'ai-config.json'))) {
        const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ai-config.json'), 'utf8'));
        res.json({ enabled: config.enabled, keyPreview: config.key ? '********' : '' });
      } else {
        res.json({ enabled: false, keyPreview: '' });
      }
    } catch (e) {
      res.json({ enabled: false, keyPreview: '' });
    }
  });

  app.post('/api/ai-config', (req, res) => {
    try {
      const { key, enabled } = req.body;
      let config = { enabled, key: '' };
      if (fs.existsSync(path.join(process.cwd(), 'ai-config.json'))) {
        config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ai-config.json'), 'utf8'));
      }
      config.enabled = enabled !== undefined ? enabled : config.enabled;
      if (key !== undefined) config.key = key; // update key if provided
      fs.writeFileSync(path.join(process.cwd(), 'ai-config.json'), JSON.stringify(config));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save config' });
    }
  });

  app.post('/api/test-ai-key', async (req, res) => {
    try {
      const { key } = req.body;
      if (!key) return res.status(400).json({ valid: false });
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }]
      });
      res.json({ valid: true });
    } catch (e: any) {
      res.json({ valid: false, error: e.message });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      let apiKey = process.env.GEMINI_API_KEY;
      let enabled = true;
      if (fs.existsSync(path.join(process.cwd(), 'ai-config.json'))) {
        const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ai-config.json'), 'utf8'));
        if (config.key) apiKey = config.key;
        if (config.enabled !== undefined) enabled = config.enabled;
      }

      if (!enabled) {
        return res.json({ error: 'AI is currently disabled by the administrator.' });
      }

      if (!apiKey) {
        return res.json({ error: 'AI API Key is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { message, systemPrompt, history } = req.body;

      const formattedHistory = (history || []).map((msg: any) => ({
         role: msg.role === 'user' ? 'user' : 'model',
         parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemPrompt || "You are a helpful assistant.",
          temperature: 0.7,
        }
      });
      res.json({ response: response.text });
    } catch (e: any) {
      console.error('Chat error', e);
      res.status(500).json({ error: e.message || 'Failed to generate response' });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      console.log("[/api/send-email] Received request");
      const { to, subject, body } = req.body;
      const resendApiKey = "re_A95Lhfq2_EUk3SnKLxMS2eZSyYBP3xhV1"; // Use explicitly specified key

      const requestData = {
        from: "Jerry Automation <noreply@jerryautomation.com>",
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: body,
      };
      
      console.log("[/api/send-email] Data being sent to Resend:", JSON.stringify(requestData, null, 2));

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        console.log("[/api/send-email] Email sent successfully");
        return res.json({ success: true });
      }

      const errorData = await response.json();
      console.error("[/api/send-email] Resend error validation JSON:", JSON.stringify(errorData, null, 2));
      return res.status(400).json({ error: errorData });
    } catch (error: any) {
      console.error("[/api/send-email] Email send network error:", error.stack || error.message || error);
      res.status(500).json({ error: error.message });
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
    // Production
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
