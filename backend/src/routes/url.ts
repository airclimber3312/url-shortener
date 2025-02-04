import { Router } from 'express';
import { 
  createShortUrl,
  updateShortUrl,
  deleteUrl,
  getUserUrls,
  getUrlAnalytics
} from '../controllers/urlController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/shorten', apiLimiter, authenticate, createShortUrl);
router.patch('/:id', authenticate, updateShortUrl);
router.delete('/:id', authenticate, deleteUrl);
router.get('/', authenticate, getUserUrls);
router.get('/:id/analytics', authenticate, getUrlAnalytics);

export default router;