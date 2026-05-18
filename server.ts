import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API endpoints FIRST
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, body } = req.body;

      if (process.env.RESEND_API_KEY) {
        // Use Resend
        const { Resend } = require("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Jerry Automation <onboarding@resend.dev>', // or a verified domain if they have one
          to: [to],
          subject,
          html: body,
        });
        
        return res.json({ success: true });
      }

      if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        return res.status(500).json({ error: "No email service configured. Please provide RESEND_API_KEY or SMTP credentials." });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD, // App Password
        },
      });

      const mailOptions = {
        from: '"Jerry Automation" <' + process.env.SMTP_EMAIL + '>',
        to,
        subject,
        html: body,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Email send error:", error);
      let errorMessage = error.message;
      if (errorMessage.includes('535-5.7.8')) {
        errorMessage = "SMTP Authentication failed. If using Gmail, make sure you are using an App Password instead of your regular password. Go to https://myaccount.google.com/apppasswords to generate one.";
      }
      res.status(500).json({ error: errorMessage });
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
