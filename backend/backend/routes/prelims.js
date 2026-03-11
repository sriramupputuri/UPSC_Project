import { Router } from 'express';
import { getPrelims, getAllPrelims } from '../controllers/prelimsController.js';

const router = Router();

router.get('/', getAllPrelims); // Get all prelims questions
router.get('/:paper/:year', getPrelims); // Get by paper and year

export default router;


