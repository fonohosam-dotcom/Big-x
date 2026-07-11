import { Router } from 'express';
import { db } from '../../db/index.ts';
import { cases, transactions } from '../../db/schema.ts';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/donations-trends', async (req, res) => {
  try {
    // Generate trends for the last 6 months using transactions
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month_raw,
        SUM(amount) as total_amount
      FROM transactions
      WHERE type = 'credit' AND status = 'completed'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month_raw ASC
      LIMIT 12
    `);

    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const formatted = result.rows.map((row: any) => {
      const parts = row.month_raw.split('-');
      const monthIdx = parseInt(parts[1], 10) - 1;
      return {
        month: `${arabicMonths[monthIdx]} ${parts[0]}`,
        amount: parseFloat(row.total_amount)
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Donations trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

router.get('/cases-distribution', async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT needs_type, COUNT(*) as count
      FROM cases
      GROUP BY needs_type
    `);

    const typeMapping: Record<string, string> = {
      medical: 'طبية',
      housing: 'سكنية',
      living: 'معيشية',
      education: 'تعليمية'
    };

    const formatted = result.rows.map((row: any) => ({
      type: typeMapping[row.needs_type] || row.needs_type,
      count: parseInt(row.count, 10)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Cases distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch distribution' });
  }
});

export default router;
