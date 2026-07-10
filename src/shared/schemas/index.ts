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
});

export const evaluateCaseSchema = z.object({
  evaluationScore: z.number().min(1).max(10),
  researcherNotes: z.string().min(10),
});

export const donateSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['case', 'project']),
  amount: z.number().positive(),
  paymentMethod: z.enum(['mobicash', 'sadad', 'lypay']),
});

export const communityReportSchema = z.object({
  description: z.string().min(10),
  type: z.string().min(3),
});

export const whistleblowerReportSchema = z.object({
  reportText: z.string().min(10),
  encryptedData: z.string().optional(),
});
