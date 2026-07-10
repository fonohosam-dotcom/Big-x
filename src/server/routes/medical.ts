import { Router } from 'express';
import { db } from '../../db/index.ts';
import { medicalInventory } from '../../db/schema.ts';
import { requireAuth } from '../middlewares/requireAuth.ts';

const router = Router();

router.get('/inventory', requireAuth, async (req, res) => {
  try {
    const inventory = await db.select().from(medicalInventory);
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed medical inventory
router.post('/seed', async (req, res) => {
  try {
    const items = [
      { facilityName: 'مستشفى طرابلس المركزي', itemName: 'أجهزة تنفس صناعي', quantity: 12, criticalThreshold: 5 },
      { facilityName: 'مستشفى بنغازي الطبي', itemName: 'كراسي متحركة', quantity: 3, criticalThreshold: 10 },
      { facilityName: 'مستوصف مصراتة', itemName: 'أدوية ضغط وسكر', quantity: 120, criticalThreshold: 50 }
    ];
    
    await db.insert(medicalInventory).values(items).onConflictDoNothing();
    res.json({ success: true, message: 'Medical inventory seeded' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
