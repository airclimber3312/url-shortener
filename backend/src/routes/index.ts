import { Router } from 'express';
import authRouter from './auth';
import urlRouter from './url';
import redirectRouter from './redirect';

const router = Router();

router.use('/api/auth', authRouter);
router.use('/api/urls', urlRouter);
router.use('/', redirectRouter);

export default router;