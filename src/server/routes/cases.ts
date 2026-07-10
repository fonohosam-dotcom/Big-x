import { Router } from 'express';
import { db } from '../../db/index.ts';
import { cases, documents, caseEvaluations } from '../../db/schema.ts';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/requireAuth.ts';
import { uploadHandler } from '../middlewares/uploadHandler.ts';
import { intakeCaseSchema } from '../../shared/schemas/index.ts';
import { eq } from 'drizzle-orm';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = intakeCaseSchema.parse(req.body);
    const [newCase] = await db.insert(cases).values({
      citizenId: req.user!.userId,
      status: 'pending',
      description: data.description,
      needsType: data.needsType,
      requiredAmount: data.requiredAmount?.toString(),
      municipality: data.municipality,
      locationLat: data.locationLat?.toString(),
      locationLng: data.locationLng?.toString(),
    }).returning();
    
    res.json(newCase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    let queryResult;
    if (userRole === 'citizen') {
      queryResult = await db.select().from(cases).where(eq(cases.citizenId, req.user!.userId));
    } else {
      queryResult = await db.select().from(cases);
    }
    
    res.json(queryResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/public-verify', async (req, res) => {
  try {
    const caseId = req.params.id;
    // Do not require auth for this specific endpoint
    const queryResult = await db.select({
      id: cases.id,
      needsType: cases.needsType,
      status: cases.status,
      requiredAmount: cases.requiredAmount,
      collectedAmount: cases.collectedAmount
    }).from(cases).where(eq(cases.id, caseId)).limit(1);

    if (queryResult.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(queryResult[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/verify', requireAuth, requireRole('researcher'), async (req: AuthRequest, res) => {
  try {
    const caseId = req.params.id;
    const { evaluationScore, researcherNotes, status } = req.body;
    
    // Insert evaluation
    await db.insert(caseEvaluations).values({
      caseId,
      researcherId: req.user!.userId,
      evaluationScore: evaluationScore || 0,
      researcherNotes: researcherNotes || ''
    });

    const [updated] = await db.update(cases)
      .set({ status: status || 'under_review' })
      .where(eq(cases.id, caseId))
      .returning();
      
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/analyze', requireAuth, requireRole('researcher'), async (req: AuthRequest, res) => {
  try {
    const caseId = req.params.id;
    
    const caseDataList = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (!caseDataList.length) throw new Error('Case not found');
    const caseData = caseDataList[0];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this charity case for urgency and fraud potential. Case details: Needs: ${caseData.needsType}, Description: ${caseData.description}, Amount: ${caseData.requiredAmount}, Location: ${caseData.municipality}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A summary of the case analysis in Arabic.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score from 0 to 100 on the legitimacy and urgency.",
            },
            recommendation: {
              type: Type.STRING,
              description: "Short recommendation like 'أولوية قصوى' or 'مراجعة دقيقة'.",
            },
          },
          required: ["summary", "confidence", "recommendation"],
        },
      },
    });

    let aiAnalysis = {};
    try {
       aiAnalysis = JSON.parse(response.text || '{}');
    } catch (e) {
       console.error("Failed to parse Gemini response");
    }

    // Update case with AI analysis
    await db.update(caseEvaluations)
      .set({ aiAnalysis })
      .where(eq(caseEvaluations.caseId, caseId));

    res.json(aiAnalysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const caseId = req.params.id;
    const [updated] = await db.update(cases)
      .set({ status: 'approved' })
      .where(eq(cases.id, caseId))
      .returning();
      
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/documents', requireAuth, uploadHandler.array('documents'), async (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const caseId = req.params.id;
    
    const inserted = await db.insert(documents).values(
      files.map(f => ({
        caseId,
        url: f.path,
        type: f.mimetype,
      }))
    ).returning();
    
    res.json({ success: true, documents: inserted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
