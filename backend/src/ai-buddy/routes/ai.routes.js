import express from 'express';
import { chatWithAi, resetConversation } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/chat', chatWithAi);
router.post('/reset', resetConversation);

export default router;
