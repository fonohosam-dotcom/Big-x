import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, cases, donations, communityReports, whistleblowerReports, projects } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const router = Router();

// In a real app this should be protected by an admin auth middleware
router.post('/purge-demo', async (req, res) => {
  try {
    console.log('Purging demo data...');
    // Delete in reverse dependency order
    await db.delete(donations).where(eq(donations.isDemoData, true));
    await db.delete(cases).where(eq(cases.isDemoData, true));
    await db.delete(projects).where(eq(projects.isDemoData, true));
    await db.delete(communityReports).where(eq(communityReports.isDemoData, true));
    await db.delete(whistleblowerReports).where(eq(whistleblowerReports.isDemoData, true));
    await db.delete(users).where(eq(users.isDemoData, true));

    res.json({ success: true, message: 'Demo data purged successfully.' });
  } catch (err: any) {
    console.error('Failed to purge demo data:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed-demo', async (req, res) => {
  try {
    console.log('Seeding demo data...');
    const passwordHash = await bcrypt.hash('demo123', 10);

    const demoDonors = [];
    for (let i = 1; i <= 100; i++) {
      let impactPoints = Math.floor(Math.random() * 50); 
      if (i <= 5) impactPoints = 5000 + Math.floor(Math.random() * 1000); 
      else if (i <= 10) impactPoints = 3000 + Math.floor(Math.random() * 500); 
      else if (i <= 20) impactPoints = 1500 + Math.floor(Math.random() * 500); 
      else if (i <= 40) impactPoints = 600 + Math.floor(Math.random() * 200); 

      const currentLevel = Math.max(1, Math.floor(impactPoints / 50));

      demoDonors.push({
        name: `متبرع ${i}`,
        email: `donor${i}@demo.com`,
        passwordHash,
        role: 'donor' as any,
        impactPoints,
        currentLevel,
        isDemoData: true,
      });
    }

    const insertedDonors = await db.insert(users).values(demoDonors).returning();
    console.log(`Inserted ${insertedDonors.length} donors.`);

    const [citizen] = await db.insert(users).values({
      name: 'مواطن تجريبي',
      email: 'citizen_demo@example.com',
      passwordHash,
      role: 'citizen',
      isDemoData: true,
    }).returning();

    const caseDataList = [
      { description: 'أسرة نازحة بحاجة لتوفير مواد غذائية وأساسيات عاجلة في بنغازي.', needsType: 'living' as any, requiredAmount: '2500', collectedAmount: '2500', municipality: 'بنغازي', locationLat: '32.1166', locationLng: '20.0666', status: 'approved' as any, votesCount: 154 },
      { description: 'عملية جراحية مستعجلة لزراعة قوقعة لطفل يبلغ من العمر 5 سنوات.', needsType: 'medical' as any, requiredAmount: '12000', collectedAmount: '8500', municipality: 'طرابلس', locationLat: '32.8872', locationLng: '13.1913', status: 'approved' as any, votesCount: 320 },
      { description: 'ترميم سقف منزل آيل للسقوط لعائلة متعففة في سبها.', needsType: 'housing' as any, requiredAmount: '4500', collectedAmount: '1200', municipality: 'سبها', locationLat: '27.0376', locationLng: '14.4283', status: 'approved' as any, votesCount: 89 },
      { description: 'توفير أدوية أمراض مزمنة لمسن لا عائل له.', needsType: 'medical' as any, requiredAmount: '800', collectedAmount: '800', municipality: 'مصراتة', locationLat: '32.3754', locationLng: '15.0925', status: 'completed' as any, votesCount: 45 },
      { description: 'مستلزمات مدرسية وحقائب لعدد 50 طفلاً من الأيتام بمناسبة العام الجديد.', needsType: 'education' as any, requiredAmount: '3000', collectedAmount: '500', municipality: 'الزاوية', locationLat: '32.7522', locationLng: '12.7277', status: 'under_review' as any, votesCount: 12 },
      { description: 'تجهيز سكن طارئ لعائلة تعرضت للاحتراق التام.', needsType: 'housing' as any, requiredAmount: '7000', collectedAmount: '0', municipality: 'الخمس', locationLat: '32.6489', locationLng: '14.2619', status: 'pending' as any, votesCount: 8 },
      { description: 'دفع رسوم دراسية لطالب جامعي متميز توفي والده حديثاً.', needsType: 'education' as any, requiredAmount: '1500', collectedAmount: '0', municipality: 'درنة', locationLat: '32.7675', locationLng: '22.6372', status: 'pending' as any, votesCount: 4 },
      { description: 'توفير كراسي متحركة وكراسي كهربائية لـ 3 من ذوي الاحتياجات الخاصة.', needsType: 'medical' as any, requiredAmount: '6000', collectedAmount: '1500', municipality: 'غريان', locationLat: '32.1722', locationLng: '13.0188', status: 'approved' as any, votesCount: 67 },
      { description: 'كسوة الشتاء لـ 20 عائلة فقيرة لمواجهة موجة البرد.', needsType: 'living' as any, requiredAmount: '4000', collectedAmount: '4000', municipality: 'البيضاء', locationLat: '32.7627', locationLng: '21.7551', status: 'completed' as any, votesCount: 201 },
      { description: 'سداد ديون متراكمة لأرملة مهددة بالسجن لإعالتها أطفالها.', needsType: 'living' as any, requiredAmount: '9500', collectedAmount: '4000', municipality: 'سرت', locationLat: '31.2057', locationLng: '16.5886', status: 'approved' as any, votesCount: 112 }
    ];

    const demoCases = caseDataList.map(c => ({
      ...c,
      citizenId: citizen.id,
      isDemoData: true,
    }));

    const insertedCases = await db.insert(cases).values(demoCases).returning();
    console.log(`Inserted ${insertedCases.length} cases.`);

    res.json({ success: true, message: 'Demo data seeded successfully.' });
  } catch (err: any) {
    console.error('Failed to seed demo data:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
