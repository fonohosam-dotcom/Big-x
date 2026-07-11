import { Router } from 'express';
import { db } from '../../db/index.ts';
import { donations, cases, transactions } from '../../db/schema.ts';
import { requireAuth, AuthRequest } from '../middlewares/requireAuth.ts';
import { paymentAdapter } from '../services/payments/index.ts';
import { donateSchema } from '../../shared/schemas/index.ts';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.post('/process', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = donateSchema.parse(req.body);
    
    // Initiate DB record
    const [donation] = await db.insert(donations).values({
      donorId: req.user!.userId,
      targetId: data.targetId,
      targetType: data.targetType,
      amount: data.amount.toString(),
      status: 'completed', // Simulating instant success for demo
      paymentMethod: data.paymentMethod,
    }).returning();
    
    // Call payment provider
    const paymentResult = await paymentAdapter.initiate(data.amount, data.paymentMethod, donation.id);
    
    // Update case collected amount
    if (data.targetType === 'case') {
      const targetCase = await db.select().from(cases).where(eq(cases.id, data.targetId)).limit(1);
      if (targetCase.length > 0) {
        const c = targetCase[0];
        const newCollected = parseFloat(c.collectedAmount || '0') + data.amount;
        let newStatus = c.status;
        
        if (c.requiredAmount && newCollected >= parseFloat(c.requiredAmount)) {
          newStatus = 'funded';
        }

        await db.update(cases)
          .set({ 
            collectedAmount: newCollected.toString(),
            status: newStatus as any
          })
          .where(eq(cases.id, data.targetId));
      }
    }

    // Insert to transactions ledger
    await db.insert(transactions).values({
      entityId: req.user!.userId,
      entityType: 'user',
      amount: data.amount.toString(),
      type: 'credit',
      status: 'completed',
      referenceId: donation.id
    });

    // Gamification: Update user impact points and level
    const { users } = await import('../../db/schema.ts');
    const userRecords = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    if (userRecords.length > 0) {
      const u = userRecords[0];
      const newImpactPoints = (u.impactPoints || 0) + data.amount;
      // Simple leveling: 1 level per 50 points
      let newLevel = Math.floor(newImpactPoints / 50) + 1;
      
      await db.update(users)
        .set({
          impactPoints: newImpactPoints,
          currentLevel: newLevel
        })
        .where(eq(users.id, req.user!.userId));
    }

    res.json({ donation, paymentResult });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const result = await paymentAdapter.verifyWebhook(req.body);
    // In real app, update donation status based on webhook
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
