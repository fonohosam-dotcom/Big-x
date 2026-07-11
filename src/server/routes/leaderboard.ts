import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users } from '../../db/schema.ts';
import { desc, eq, isNotNull } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pointsData = await db.select({
      id: users.id,
      points: users.impactPoints,
      currentLevel: users.currentLevel,
      userName: users.name,
    })
    .from(users)
    .where(isNotNull(users.impactPoints))
    .orderBy(desc(users.impactPoints))
    .limit(10);
    
    res.json(pointsData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed data
router.post('/seed', async (req, res) => {
  try {
    const existingUsers = await db.select().from(users).where(eq(users.role, 'donor'));
    if (existingUsers.length > 0) {
      await db.update(users).set({ impactPoints: 6000, currentLevel: 120 }).where(eq(users.id, existingUsers[0].id));
      if (existingUsers[1]) {
        await db.update(users).set({ impactPoints: 2000, currentLevel: 41 }).where(eq(users.id, existingUsers[1].id));
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
