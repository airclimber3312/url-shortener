import { Router } from 'express';
import { redirectToUrl } from '../controllers/urlController';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/:shortId', apiLimiter, redirectToUrl);

export default router;