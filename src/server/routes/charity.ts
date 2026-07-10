import { Router } from 'express';
import { db } from '../../db/index.ts';
import { cases, funds, transactions } from '../../db/schema.ts';
import { requireAuth, requireRole } from '../middlewares/requireAuth.ts';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/fund', requireAuth, requireRole('charity'), async (req, res) => {
  try {
    const charityFundList = await db.select().from(funds).where(eq(funds.charityId, (req as any).user.userId)).limit(1);
    if (charityFundList.length === 0) {
       // Auto-create a mock fund for the charity on first login
       const [newFund] = await db.insert(funds).values({
         charityId: (req as any).user.userId,
         name: 'صندوق الاستجابة السريعة',
         balance: '5000'
       }).returning();
       res.json(newFund);
       return;
    }
    res.json(charityFundList[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/disburse', requireAuth, requireRole('charity'), async (req, res) => {
  try {
    const { caseId, amount } = req.body;
    
    // Get charity fund
    const charityFundList = await db.select().from(funds).where(eq(funds.charityId, (req as any).user.userId)).limit(1);
    if (!charityFundList.length) throw new Error('Fund not found');
    const fund = charityFundList[0];
    
    if (parseFloat(fund.balance || '0') < amount) {
      throw new Error('Insufficient funds');
    }

    // Deduct from fund
    const newBalance = parseFloat(fund.balance || '0') - amount;
    await db.update(funds).set({ balance: newBalance.toString() }).where(eq(funds.id, fund.id));
    
    // Update Case
    const targetCaseList = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (targetCaseList.length > 0) {
       const c = targetCaseList[0];
       const newCollected = parseFloat(c.collectedAmount || '0') + amount;
       let newStatus = c.status;
       if (c.requiredAmount && newCollected >= parseFloat(c.requiredAmount)) {
          newStatus = 'funded';
       }
       await db.update(cases)
          .set({ 
            collectedAmount: newCollected.toString(),
            status: newStatus as any
          })
          .where(eq(cases.id, caseId));
    }
    
    // Record transaction
    await db.insert(transactions).values({
      entityId: (req as any).user.userId,
      entityType: 'charity',
      amount: amount.toString(),
      type: 'debit',
      status: 'completed',
      referenceId: caseId
    });
    
    res.json({ success: true, newBalance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
