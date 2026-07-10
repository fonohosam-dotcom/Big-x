import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.ts';
import { uploadHandler } from '../middlewares/uploadHandler.ts';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

router.post('/describe-image', requireAuth, uploadHandler.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const fileData = fs.readFileSync(req.file.path);
    const base64Data = fileData.toString('base64');
    const mimeType = req.file.mimetype;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "صف هذه الصورة بدقة باللغة العربية مع التركيز على الاحتياجات الإنسانية أو الطبية المحتملة الظاهرة." },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      ]
    });

    res.json({ description: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
