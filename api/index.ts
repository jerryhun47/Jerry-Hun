import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(express.json());
// Allow all origins for Vercel/GitHub Pages deployment
app.use(cors({ origin: '*' }));

const resendApiKey = process.env.RESEND_API_KEY || 're_A95Lhfq2_EUk3SnKLxMS2eZSyYBP3xhV1';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8292790098:AAFYCX-DLcDmp6MXZPJgg_1mTA8O2WcD3eg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5459072718';

async function sendTelegramNotification(subject: string, htmlContent: string) {
  try {
    const plainText = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p\s*>/gi, '\n\n')
      .replace(/<li\s*>/gi, '\n• ')
      .replace(/<[^>]*>?/gm, '')
      .trim();
      
    const textMessage = `🚨 NEW ORDER / NOTIFICATION 🚨\n\nSubject: ${subject}\n\nDetails:\n${plainText}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: textMessage.substring(0, 4000)
      }),
    });
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, html } = req.body;
    
    const content = html || body;
    
    if (!to || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const requestData = {
      from: "Jerry Automation <noreply@jerryautomation.com>",
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: content,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(requestData),
    });

    const toArray = Array.isArray(to) ? to : [to];
    const isToAdmin = toArray.some(email => email.toLowerCase().includes('jerryhun47@gmail.com'));
    
    // Trigger Telegram alert if this email is going to the Admin or is an Order confirmation
    if (isToAdmin || subject.toLowerCase().includes('order')) {
      await sendTelegramNotification(subject, content);
    }

    if (response.ok) {
      return res.status(200).json({ success: true, data: await response.json() });
    }

    const errorData = await response.json();
    return res.status(400).json({ error: errorData });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

import fs from "fs";
import path from "path";

const CONFIG_PATH = process.env.VERCEL ? '/tmp/ai-config.json' : path.join(process.cwd(), 'ai-config.json');

app.get('/api/ai-config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
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
    if (fs.existsSync(CONFIG_PATH)) {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
    config.enabled = enabled !== undefined ? enabled : config.enabled;
    if (key !== undefined) config.key = key;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
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
    
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// For Vercel Serverless Function, export the app instead of app.listen()
export default app;
