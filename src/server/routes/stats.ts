import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, cases } from '../../db/schema.ts';

const router = Router();

// In-memory active users tracker for the live counter
export const activeUsersMap = new Map<string, number>();

router.get('/live', async (req, res) => {
  try {
    const now = Date.now();
    // Cleanup old sessions (older than 5 minutes)
    for (const [ip, lastActive] of activeUsersMap.entries()) {
      if (now - lastActive > 5 * 60 * 1000) {
        activeUsersMap.delete(ip);
      }
    }
    
    // Add current IP if not present, just for simulation if they query
    const clientIp = req.ip || 'unknown';
    activeUsersMap.set(clientIp, now);

    const activeUsers = activeUsersMap.size;

    const totalUsersList = await db.select({ count: users.id }).from(users);
    const totalCasesList = await db.select({ count: cases.id }).from(cases);
    
    res.json({
      activeUsers: activeUsers > 0 ? activeUsers : 1, // Fallback to 1
      totalUsers: totalUsersList.length,
      totalCases: totalCasesList.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
