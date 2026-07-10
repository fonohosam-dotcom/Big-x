import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/index.ts';
import { users } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { loginSchema, registerSchema } from '../../shared/schemas/index.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const userResult = await db.select().from(users).where(eq(users.email, data.email));
    
    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult[0];
    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken: token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, data.email));
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const [newUser] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      passwordHash,
      nationalId: data.nationalId, // In real world: encrypt this
      phone: data.phone,
      municipality: data.municipality,
      role: 'citizen',
    }).returning();
    
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken: token, user: { id: newUser.id, name: newUser.name, role: newUser.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    const roles = ['citizen', 'donor', 'researcher', 'admin', 'medical'];
    const createdUsers = [];
    
    for (const role of roles) {
      const email = `test_${role}@example.com`;
      const existing = await db.select().from(users).where(eq(users.email, email));
      if (existing.length === 0) {
        const [newUser] = await db.insert(users).values({
          name: `مستخدم ${role} (تجريبي)`,
          email,
          passwordHash,
          role: role as any,
        }).returning();
        createdUsers.push(newUser);
      }
    }
    
    res.json({ success: true, message: 'تم إنشاء الحسابات التجريبية بنجاح.', password: defaultPassword });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
