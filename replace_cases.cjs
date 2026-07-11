const fs = require('fs');
let code = fs.readFileSync('src/server/routes/cases.ts', 'utf8');

const target = `router.get('/', requireAuth, async (req: AuthRequest, res) => {`;
const replacement = `router.get('/public', async (req, res) => {
  try {
    const queryResult = await db.select({
      id: cases.id,
      needsType: cases.needsType,
      requiredAmount: cases.requiredAmount,
      collectedAmount: cases.collectedAmount,
      municipality: cases.municipality,
      description: cases.description,
      status: cases.status,
      votesCount: cases.votesCount,
      locationLat: cases.locationLat,
      locationLng: cases.locationLng
    }).from(cases);
    
    const publicCases = queryResult.map(c => ({
      ...c,
      citizenName: 'محتاج',
      locationLat: c.locationLat ? parseFloat(c.locationLat).toFixed(2) : null,
      locationLng: c.locationLng ? parseFloat(c.locationLng).toFixed(2) : null,
    }));
    
    res.json(publicCases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {`;

if (code.includes(target) && !code.includes("router.get('/public'")) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/server/routes/cases.ts', code);
  console.log("Success");
} else {
  console.log("Failed or already replaced");
}
