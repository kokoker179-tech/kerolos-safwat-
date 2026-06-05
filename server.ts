import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());
  
  app.post("/api/chat", async (req, res) => {
    try {
      const response = await getAiClient().models.generateContent({
        model: "gemini-pro",
        contents: `أنت مساعد ذكي لموقع الحجوزات. تذكر دائماً أن مطور هذا الموقع ومبرمجه هو "كيرلس صفوت". إذا سألك أحد عن مين صاحب الموقع، مين المبرمج، أو أي أسئلة مشابهة، أجب دائماً بأن المطور هو كيرلس صفوت بأسلوب لطيف ومحترف وعالمي. الرسالة الأصلية: ${req.body.message}`,
      });
      res.json({ text: response.text });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payment/process", async (req, res) => {
    try {
      const apiKey = process.env.PAYMENT_GATEWAY_API_KEY;
      const { paymentMethod, paymentPhone, amount } = req.body;
      
      console.log(`Processing payment via ${paymentMethod} for ${paymentPhone}, amount: ${amount}`);

      if (!apiKey) {
        console.warn("Payment gateway API Key missing. Simulating successful response for demo.");
        res.json({ success: true, transactionId: "simulated_" + Date.now() });
        return;
      }

      // TODO: Call actual Payment Gateway library or API here based on paymentMethod
      // For now, simulating a successful API interaction
      
      res.json({ success: true, transactionId: "trans_" + Date.now() });
      
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  console.log("NODE_ENV:", process.env.NODE_ENV);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
