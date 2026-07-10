import cron from 'node-cron';
import { db } from '../../db/index.ts';
import { leaderboardPoints, donations } from '../../db/schema.ts';
import { gte, lt, eq, and } from 'drizzle-orm';

// Run every Thursday at 00:00 to reset or summarize impact points
export function setupCronJobs() {
  cron.schedule('0 0 * * 4', async () => {
    console.log('Running weekly Thursday CRON job: summarizing impact points');
    try {
      const now = new Date();
      const lastThursday = new Date(now);
      lastThursday.setDate(now.getDate() - 7);
      
      // Calculate total donations for each user in the past week
      const recentDonations = await db.select().from(donations)
        .where(
          and(
            gte(donations.createdAt, lastThursday),
            lt(donations.createdAt, now)
          )
        );
        
      const userPoints: Record<string, number> = {};
      
      for (const d of recentDonations) {
        if (d.donorId && d.status === 'completed') {
          const amount = parseFloat(d.amount);
          // 1 point per 10 LYD
          const points = Math.floor(amount / 10);
          if (points > 0) {
            userPoints[d.donorId] = (userPoints[d.donorId] || 0) + points;
          }
        }
      }
      
      for (const [userId, points] of Object.entries(userPoints)) {
        await db.insert(leaderboardPoints).values({
          userId,
          points,
          weekStart: lastThursday,
        });
      }
      
      console.log('Weekly gamification impact leaderboard processed successfully.');
    } catch (error) {
      console.error('Error running weekly gamification job', error);
    }
  });
}
