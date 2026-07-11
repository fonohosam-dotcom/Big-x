import { db } from './index.ts';
import { users, cases, donations } from './schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function seed() {
  console.log('Cleaning old demo data...');
  await db.delete(cases).where(eq(cases.isDemoData, true));
  await db.delete(users).where(eq(users.isDemoData, true));

  console.log('Seeding demo data...');
  const passwordHash = await bcrypt.hash('demo123', 10);

  // 100 Donors
  const demoDonors = [];
  for (let i = 1; i <= 100; i++) {
    let impactPoints = Math.floor(Math.random() * 50); // normal
    if (i <= 5) impactPoints = 5000 + Math.floor(Math.random() * 1000); // Legendary (level > 99)
    else if (i <= 10) impactPoints = 3000 + Math.floor(Math.random() * 500); // Gold (level > 61)
    else if (i <= 20) impactPoints = 1500 + Math.floor(Math.random() * 500); // Silver (level > 31)
    else if (i <= 40) impactPoints = 600 + Math.floor(Math.random() * 200); // Bronze (level > 11)

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

  // Create a citizen for cases
  const [citizen] = await db.insert(users).values({
    name: 'مواطن تجريبي',
    email: 'citizen_demo@example.com',
    passwordHash,
    role: 'citizen',
    isDemoData: true,
  }).returning();

  // 10 Cases
  const caseDataList = [
    {
      description: 'أسرة نازحة بحاجة لتوفير مواد غذائية وأساسيات عاجلة في بنغازي.',
      needsType: 'living' as any,
      requiredAmount: '2500',
      collectedAmount: '2500',
      municipality: 'بنغازي',
      locationLat: '32.1166',
      locationLng: '20.0666',
      status: 'approved' as any,
      votesCount: 154,
    },
    {
      description: 'عملية جراحية مستعجلة لزراعة قوقعة لطفل يبلغ من العمر 5 سنوات.',
      needsType: 'medical' as any,
      requiredAmount: '12000',
      collectedAmount: '8500',
      municipality: 'طرابلس',
      locationLat: '32.8872',
      locationLng: '13.1913',
      status: 'approved' as any,
      votesCount: 320,
    },
    {
      description: 'ترميم سقف منزل آيل للسقوط لعائلة متعففة في سبها.',
      needsType: 'housing' as any,
      requiredAmount: '4500',
      collectedAmount: '1200',
      municipality: 'سبها',
      locationLat: '27.0376',
      locationLng: '14.4283',
      status: 'approved' as any,
      votesCount: 89,
    },
    {
      description: 'توفير أدوية أمراض مزمنة لمسن لا عائل له.',
      needsType: 'medical' as any,
      requiredAmount: '800',
      collectedAmount: '800',
      municipality: 'مصراتة',
      locationLat: '32.3754',
      locationLng: '15.0925',
      status: 'completed' as any,
      votesCount: 45,
    },
    {
      description: 'مستلزمات مدرسية وحقائب لعدد 50 طفلاً من الأيتام بمناسبة العام الجديد.',
      needsType: 'education' as any,
      requiredAmount: '3000',
      collectedAmount: '500',
      municipality: 'الزاوية',
      locationLat: '32.7522',
      locationLng: '12.7277',
      status: 'under_review' as any,
      votesCount: 12,
    },
    {
      description: 'تجهيز سكن طارئ لعائلة تعرضت للاحتراق التام.',
      needsType: 'housing' as any,
      requiredAmount: '7000',
      collectedAmount: '0',
      municipality: 'الخمس',
      locationLat: '32.6489',
      locationLng: '14.2619',
      status: 'pending' as any,
      votesCount: 8,
    },
    {
      description: 'دفع رسوم دراسية لطالب جامعي متميز توفي والده حديثاً.',
      needsType: 'education' as any,
      requiredAmount: '1500',
      collectedAmount: '0',
      municipality: 'درنة',
      locationLat: '32.7675',
      locationLng: '22.6372',
      status: 'pending' as any,
      votesCount: 4,
    },
    {
      description: 'توفير كراسي متحركة وكراسي كهربائية لـ 3 من ذوي الاحتياجات الخاصة.',
      needsType: 'medical' as any,
      requiredAmount: '6000',
      collectedAmount: '1500',
      municipality: 'غريان',
      locationLat: '32.1722',
      locationLng: '13.0188',
      status: 'approved' as any,
      votesCount: 67,
    },
    {
      description: 'كسوة الشتاء لـ 20 عائلة فقيرة لمواجهة موجة البرد.',
      needsType: 'living' as any,
      requiredAmount: '4000',
      collectedAmount: '4000',
      municipality: 'البيضاء',
      locationLat: '32.7627',
      locationLng: '21.7551',
      status: 'completed' as any,
      votesCount: 201,
    },
    {
      description: 'سداد ديون متراكمة لأرملة مهددة بالسجن لإعالتها أطفالها.',
      needsType: 'living' as any,
      requiredAmount: '9500',
      collectedAmount: '4000',
      municipality: 'سرت',
      locationLat: '31.2057',
      locationLng: '16.5886',
      status: 'approved' as any,
      votesCount: 112,
    }
  ];

  const demoCases = caseDataList.map(c => ({
    ...c,
    citizenId: citizen.id,
    isDemoData: true,
  }));

  const insertedCases = await db.insert(cases).values(demoCases).returning();
  console.log(`Inserted ${insertedCases.length} cases.`);

  
  // ---------------------------------------------------------
  // END-TO-END DEMO SEEDING
  // ---------------------------------------------------------
  
  // 1. Medical Inventory
  const { medicalInventory, donations, transactions } = await import('./schema.ts');
  
  await db.delete(medicalInventory);
  const demoInventory = [
    { facilityName: 'مستشفى طرابلس المركزي', itemName: 'إنسولين مختلط', quantity: 5, criticalThreshold: 20 },
    { facilityName: 'مركز بنغازي الطبي', itemName: 'أكياس دم O+', quantity: 2, criticalThreshold: 10 },
    { facilityName: 'مستشفى مصراتة', itemName: 'أجهزة تنفس صناعي', quantity: 15, criticalThreshold: 5 },
    { facilityName: 'صيدلية الجمعية', itemName: 'أدوية ضغط', quantity: 50, criticalThreshold: 15 },
    { facilityName: 'مستشفى سبها', itemName: 'مضادات حيوية', quantity: 8, criticalThreshold: 50 },
  ];
  await db.insert(medicalInventory).values(demoInventory);
  console.log('Inserted Medical Inventory.');

  // 2. Ledger Transactions (Transparency Center)
  await db.delete(transactions);
  await db.delete(donations).where(eq(donations.isDemoData, true));
  
  const demoDonations = [];
  const demoTransactions = [];
  
  for (let i = 1; i <= 50; i++) {
    const amount = Math.floor(Math.random() * 500) + 50;
    const isCompleted = Math.random() > 0.1;
    
    // We can just use the first donor
    const donorId = insertedDonors[Math.floor(Math.random() * insertedDonors.length)].id;
    const caseId = insertedCases[Math.floor(Math.random() * insertedCases.length)].id;
    
    // Distribute creation dates over the last 6 months
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    
    demoDonations.push({
      id: crypto.randomUUID(),
      donorId,
      targetId: caseId,
      targetType: 'case',
      amount: amount.toString(),
      status: isCompleted ? 'completed' : 'pending',
      paymentMethod: ['mobicash', 'sadad', 'lypay'][Math.floor(Math.random() * 3)],
      isDemoData: true,
      createdAt: date,
    });
  }
  
  const insertedDonations = await db.insert(donations).values(demoDonations).returning();
  console.log('Inserted ' + insertedDonations.length + ' Donations.');
  
  for (const don of insertedDonations) {
    if (don.status === 'completed') {
      demoTransactions.push({
        entityId: don.donorId,
        entityType: 'user',
        amount: don.amount,
        type: 'credit', // inbound to platform
        status: 'completed',
        referenceId: don.id,
        createdAt: don.createdAt,
      });
      
      // Also add some random 'debit' expenditures to charities
      if (Math.random() > 0.5) {
        demoTransactions.push({
          entityId: don.targetId, // just a placeholder ID
          entityType: 'charity',
          amount: (Number(don.amount) * 0.8).toString(),
          type: 'debit',
          status: 'completed',
          referenceId: don.id,
          createdAt: new Date(don.createdAt.getTime() + 86400000), // 1 day later
        });
      }
    }
  }
  
  if (demoTransactions.length > 0) {
    await db.insert(transactions).values(demoTransactions);
    console.log('Inserted ' + demoTransactions.length + ' Transactions.');
  }

  console.log('Seeding completed!');
  
}

