import { Router } from 'express';
import { getActivePackages } from '../controllers/packageController';

const router = Router();

router.get('/', getActivePackages);

export default router;
