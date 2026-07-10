import { Router } from 'express';
import { db } from '../../db/index.ts';
import { cases, documents } from '../../db/schema.ts';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/requireAuth.ts';
import { uploadHandler } from '../middlewares/uploadHandler.ts';
import { intakeCaseSchema } from '../../shared/schemas/index.ts';
import { eq } from 'drizzle-orm';

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
      // Researcher, Admin, etc can see all (for simplicity, real app would filter by municipality for researcher)
      queryResult = await db.select().from(cases);
    }
    
    res.json(queryResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/verify', requireAuth, requireRole('researcher'), async (req: AuthRequest, res) => {
  try {
    const caseId = req.params.id;
    const { evaluationScore, researcherNotes, status } = req.body;
    
    // In a real app, we'd also insert into case_evaluations
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
    // In a real app, this would send data to Gemini API
    // Mocking Gemini response for now:
    const mockAnalysis = {
      summary: "بناءً على سجل المعاملات التاريخي والنمو الديموغرافي، تظهر الحالة حاجة ملحة بنسبة ثقة عالية. لا توجد تكرارات في السجلات الوطنية (Drizzle Sync).",
      confidence: 92,
      recommendation: "أولوية قصوى"
    };
    
    res.json(mockAnalysis);
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
