import { Router } from 'express';
import { db } from '../../db/index.ts';
import { cases, documents, caseEvaluations, caseVotes } from '../../db/schema.ts';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/requireAuth.ts';
import { uploadHandler } from '../middlewares/uploadHandler.ts';
import { intakeCaseSchema } from '../../shared/schemas/index.ts';
import { eq, and, sql } from 'drizzle-orm';
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

router.post('/', requireAuth, uploadHandler.fields([
  { name: 'passportImage', maxCount: 1 },
  { name: 'cancelledCheck', maxCount: 1 },
  { name: 'livingConditions', maxCount: 5 }
]), async (req: AuthRequest, res) => {
  try {
    // Parse numeric/JSON fields properly from formdata
    const parsedBody = {
      ...req.body,
      requiredAmount: req.body.requiredAmount ? Number(req.body.requiredAmount) : undefined,
      locationLat: req.body.locationLat ? Number(req.body.locationLat) : undefined,
      locationLng: req.body.locationLng ? Number(req.body.locationLng) : undefined,
      familyMembersCount: req.body.familyMembersCount ? Number(req.body.familyMembersCount) : undefined,
    };

    const data = intakeCaseSchema.parse(parsedBody);
    
    // Update User KYC
    const { users } = await import('../../db/schema.ts');
    await db.update(users).set({
      nationalId: data.nationalId,
      phone: data.phone,
      maritalStatus: data.maritalStatus,
      familyMembersCount: data.familyMembersCount,
      passportNumber: data.passportNumber,
      localBankAccount: data.localBankAccount,
      iban: data.iban,
    }).where(eq(users.id, req.user!.userId));

    // Create Case
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
    
    // Save documents
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const docInserts = [];
    
    if (files.passportImage?.[0]) {
      docInserts.push({ caseId: newCase.id, url: files.passportImage[0].path, type: 'passport' });
    }
    if (files.cancelledCheck?.[0]) {
      docInserts.push({ caseId: newCase.id, url: files.cancelledCheck[0].path, type: 'cancelled_check' });
    }
    if (files.livingConditions) {
      files.livingConditions.forEach(f => {
        docInserts.push({ caseId: newCase.id, url: f.path, type: 'living_condition' });
      });
    }
    
    if (docInserts.length > 0) {
      await db.insert(documents).values(docInserts);
    }

    res.json(newCase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const queryResult = await db.select({
      id: cases.id,
      needsType: cases.needsType,
      requiredAmount: cases.requiredAmount,
      collectedAmount: cases.collectedAmount,
      municipality: cases.municipality,
      description: cases.description,
      status: cases.status,
      votesCount: cases.votesCount,
      locationLat: cases.locationLat,
      locationLng: cases.locationLng
    }).from(cases);
    
    const publicCases = queryResult.map(c => ({
      ...c,
      citizenName: 'محتاج',
      locationLat: c.locationLat ? parseFloat(c.locationLat).toFixed(2) : null,
      locationLng: c.locationLng ? parseFloat(c.locationLng).toFixed(2) : null,
    }));
    
    res.json(publicCases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

// Community Pulse Voting
router.post('/:id/vote', requireAuth, async (req: AuthRequest, res) => {
  try {
    const caseId = req.params.id;
    const userId = req.user!.userId;
    
    // Check if already voted
    const existingVote = await db.select().from(caseVotes).where(and(eq(caseVotes.caseId, caseId), eq(caseVotes.userId, userId))).limit(1);
    
    if (existingVote.length > 0) {
      return res.status(400).json({ error: 'You have already voted for this case.' });
    }
    
    await db.insert(caseVotes).values({ caseId, userId });
    
    // Update count in cases
    const [updatedCase] = await db.update(cases)
      .set({ votesCount: sql`${cases.votesCount} + 1` })
      .where(eq(cases.id, caseId))
      .returning();
      
    res.json({ success: true, votesCount: updatedCase.votesCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
