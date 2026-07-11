import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['citizen', 'donor', 'researcher', 'charity', 'medical', 'admin']);
export const caseStatusEnum = pgEnum('case_status', ['pending', 'under_review', 'approved', 'funded', 'completed', 'rejected']);
export const needsTypeEnum = pgEnum('needs_type', ['medical', 'housing', 'living', 'education']);
export const donationStatusEnum = pgEnum('donation_status', ['pending', 'completed', 'failed']);
export const transactionTypeEnum = pgEnum('transaction_type', ['credit', 'debit']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: roleEnum('role').notNull().default('citizen'),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  nationalId: text('national_id').unique(), // Encrypted PII
  phone: text('phone'),
  maritalStatus: text('marital_status'),
  familyMembersCount: integer('family_members_count'),
  passportNumber: text('passport_number'),
  localBankAccount: text('local_bank_account'),
  iban: text('iban'),
  googleId: text('google_id').unique(),
  appleId: text('apple_id').unique(),
  municipality: text('municipality'),
  impactPoints: integer('impact_points').default(0),
  currentLevel: integer('current_level').default(1),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cases = pgTable('cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  citizenId: uuid('citizen_id').references(() => users.id).notNull(),
  status: caseStatusEnum('status').default('pending').notNull(),
  description: text('description').notNull(),
  needsType: needsTypeEnum('needs_type').notNull(),
  requiredAmount: decimal('required_amount', { precision: 12, scale: 2 }),
  collectedAmount: decimal('collected_amount', { precision: 12, scale: 2 }).default('0'),
  municipality: text('municipality').notNull(),
  locationLat: decimal('location_lat', { precision: 10, scale: 7 }),
  locationLng: decimal('location_lng', { precision: 10, scale: 7 }),
  votesCount: integer('votes_count').default(0).notNull(),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const caseVotes = pgTable('case_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const caseEvaluations = pgTable('case_evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  researcherId: uuid('researcher_id').references(() => users.id).notNull(),
  evaluationScore: integer('evaluation_score'),
  aiAnalysis: jsonb('ai_analysis'),
  researcherNotes: text('researcher_notes'),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const donations = pgTable('donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  donorId: uuid('donor_id').references(() => users.id),
  targetId: uuid('target_id').notNull(), // can be case or project
  targetType: text('target_type').notNull(), // 'case' | 'project'
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: donationStatusEnum('status').default('pending').notNull(),
  paymentMethod: text('payment_method'), // 'mobicash', 'sadad', 'lypay'
  providerRef: text('provider_ref'),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityId: uuid('entity_id'),
  entityType: text('entity_type'), // 'user', 'charity', 'fund'
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  status: text('status').default('completed').notNull(),
  referenceId: uuid('reference_id'), // e.g., donation_id
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(), // 'infrastructure', 'education', etc.
  title: text('title').notNull(),
  description: text('description'),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  status: text('status').default('active').notNull(),
  municipality: text('municipality'),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const funds = pgTable('funds', {
  id: uuid('id').defaultRandom().primaryKey(),
  charityId: uuid('charity_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  caseId: uuid('case_id').references(() => cases.id),
  url: text('url').notNull(),
  type: text('type').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

export const communityReports = pgTable('community_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportedBy: uuid('reported_by').references(() => users.id),
  description: text('description').notNull(),
  type: text('type').notNull(),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const whistleblowerReports = pgTable('whistleblower_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportText: text('report_text').notNull(),
  encryptedData: text('encrypted_data'),
  isDemoData: boolean('is_demo_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  targetTable: text('target_table'),
  targetId: uuid('target_id'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  description: text('description'),
});

export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  badgeId: uuid('badge_id').references(() => badges.id).notNull(),
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
});

export const leaderboardPoints = pgTable('leaderboard_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  points: integer('points').notNull().default(0),
  weekStart: timestamp('week_start').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const geoSosAlerts = pgTable('geo_sos_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  municipality: text('municipality').notNull(),
  alertLevel: text('alert_level').notNull(),
  description: text('description').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const medicalInventory = pgTable('medical_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  facilityName: text('facility_name').notNull(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  criticalThreshold: integer('critical_threshold').notNull().default(10),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});
