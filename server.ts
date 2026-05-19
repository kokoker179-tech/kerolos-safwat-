import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) aiClient = new GoogleGenAI();
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
      res.json({ text: response.text() });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
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
