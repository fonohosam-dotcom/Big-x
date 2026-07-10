import { Router } from 'express';
import authRouter from './auth.ts';
import casesRouter from './cases.ts';
import donationsRouter from './donations.ts';
import medicalRouter from './medical.ts';
import ledgerRouter from './ledger.ts';
import leaderboardRouter from './leaderboard.ts';
import charityRouter from './charity.ts';

const router = Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRouter);
router.use('/cases', casesRouter);
router.use('/donations', donationsRouter);
router.use('/medical', medicalRouter);
router.use('/ledger', ledgerRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/charity', charityRouter);

export default router;

