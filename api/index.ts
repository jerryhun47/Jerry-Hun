import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(express.json());
// Allow all origins for Vercel/GitHub Pages deployment
app.use(cors({ origin: '*' }));

const resend = new Resend(process.env.RESEND_API_KEY || 're_your_key_here');

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = await resend.emails.send({
      from: 'Jerry Automation <onboarding@resend.dev>', // Update this to a verified domain if available
      to: [to],
      subject: subject,
      html: html,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// For Vercel Serverless Function, export the app instead of app.listen()
export default app;
