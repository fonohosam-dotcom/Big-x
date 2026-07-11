import { z } from 'zod';

export const userRoleSchema = z.enum(['guest', 'citizen', 'donor', 'researcher', 'charity', 'medical', 'admin']);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  nationalId: z.string().min(10).optional(),
  phone: z.string().optional(),
  municipality: z.string().optional(),
});

export const intakeCaseSchema = z.object({
  description: z.string().min(10),
  needsType: z.enum(['medical', 'housing', 'living', 'education']),
  requiredAmount: z.number().positive().optional(),
  municipality: z.string().min(2),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  
  // KYC Fields
  nationalId: z.string().min(10).max(20, 'الرقم الوطني يجب أن يكون بين 10 و 20 رقم'),
  phone: z.string().min(8, 'رقم الهاتف مطلوب'),
  maritalStatus: z.enum(['أعزب', 'متزوج', 'أرمل', 'مطلق']),
  familyMembersCount: z.number().min(1),
  passportNumber: z.string().optional(),
  
  // Financial Fields
  localBankAccount: z.string().min(10, 'رقم الحساب البنكي مطلوب'),
  iban: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/i, 'صيغة IBAN غير صالحة'),
});

export const evaluateCaseSchema = z.object({
  evaluationScore: z.number().min(1).max(10),
  researcherNotes: z.string().min(10),
});

export const donateSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['case', 'project']),
  amount: z.number().positive(),
  paymentMethod: z.enum(['mobicash', 'sadad', 'lypay', 'stripe', 'paypal', 'crypto']),
  // Crypto specific fields
  cryptoTxHash: z.string().optional(),
  cryptoCurrency: z.enum(['USDT', 'USDC', 'BTC']).optional(),
});

export const communityReportSchema = z.object({
  description: z.string().min(10),
  type: z.string().min(3),
});

export const whistleblowerReportSchema = z.object({
  reportText: z.string().min(10),
  encryptedData: z.string().optional(),
});
