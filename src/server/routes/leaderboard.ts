import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, leaderboardPoints, userBadges, badges } from '../../db/schema.ts';
import { desc, eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    
    // In a real app we'd filter by week_start if timeframe == 'weekly'
    
    const pointsData = await db.select({
      id: leaderboardPoints.id,
      points: leaderboardPoints.points,
      userId: leaderboardPoints.userId,
      userName: users.name,
    })
    .from(leaderboardPoints)
    .leftJoin(users, eq(leaderboardPoints.userId, users.id))
    .orderBy(desc(leaderboardPoints.points))
    .limit(10);
    
    // We should also get their badges, for simplicity we return just the array of top users
    res.json(pointsData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed data
router.post('/seed', async (req, res) => {
  try {
    // Generate some mock leaderboard data
    const existingUsers = await db.select().from(users).where(eq(users.role, 'donor'));
    if (existingUsers.length > 0) {
      await db.insert(leaderboardPoints).values({
        userId: existingUsers[0].id,
        points: 450,
        weekStart: new Date(),
      }).onConflictDoNothing();
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
