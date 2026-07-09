import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { config } from '../config/index.js';

const MATERIEL_UPLOAD_DIR = path.join(config.upload.dir, 'materiels');

const ensureUploadDir = (): void => {
  if (!fs.existsSync(MATERIEL_UPLOAD_DIR)) {
    fs.mkdirSync(MATERIEL_UPLOAD_DIR, { recursive: true });
  }
};

ensureUploadDir();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, MATERIEL_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

export const materielImageUpload = multer({
  storage,
  limits: { fileSize: config.upload.maxSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Format image non supporté (jpeg, png, webp uniquement)'));
  },
});

export const getMaterielImagePath = (filename: string): string => {
  return path.join(MATERIEL_UPLOAD_DIR, filename);
};

export const getMaterielImageUrl = (filename: string): string => {
  return `/uploads/materiels/${filename}`;
};

export const deleteMaterielImageFile = (filename: string): void => {
  const filePath = getMaterielImagePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
