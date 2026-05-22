import { Router } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

import { generateTryOn } from '../controllers/tryon.controller.js';

const router = Router();

const uploadRoot = path.resolve(process.cwd(), 'uploads', 'tryon');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.png';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image uploads are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  '/',
  upload.fields([
    { name: 'person', maxCount: 1 },
    { name: 'garment', maxCount: 1 },
  ]),
  generateTryOn
);

export default router;
