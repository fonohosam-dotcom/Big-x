const fs = require('fs');
let code = fs.readFileSync('src/db/seed.ts', 'utf-8');

// We will add the following things before console.log('Seeding completed!');

const injection = `
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
`;

code = code.replace("console.log('Seeding completed!');", injection + "\n  console.log('Seeding completed!');");
fs.writeFileSync('src/db/seed.ts', code);
