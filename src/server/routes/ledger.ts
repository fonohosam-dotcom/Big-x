import { Router } from 'express';
import { db } from '../../db/index.ts';
import { donations, transactions, users } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.get('/transactions', async (req, res) => {
  try {
    // For ledger, we'll return donations combined with users to mimic transparent ledger
    const ledgerDonations = await db.select({
      id: donations.id,
      amount: donations.amount,
      status: donations.status,
      createdAt: donations.createdAt,
      targetId: donations.targetId,
      donorName: users.name,
      donorRole: users.role
    })
    .from(donations)
    .leftJoin(users, eq(donations.donorId, users.id))
    .orderBy(desc(donations.createdAt))
    .limit(50);
    
    // Transform to ledger format
    const ledger = ledgerDonations.map(d => ({
      id: d.id,
      date: new Date(d.createdAt).toLocaleString('ar-LY'),
      amount: d.amount,
      from: d.donorRole === 'donor' ? 'متبرع' : d.donorName || 'مجهول',
      to: `طلب #${d.targetId.slice(0, 8)}`,
      status: d.status === 'pending' ? 'قيد المعالجة' : 'مؤكدة'
    }));

    res.json(ledger);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
