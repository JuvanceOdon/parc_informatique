import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { config } from '../config/index.js';

const TICKET_UPLOAD_DIR = path.join(config.upload.dir, 'tickets');

const ensureUploadDir = (): void => {
  if (!fs.existsSync(TICKET_UPLOAD_DIR)) {
    fs.mkdirSync(TICKET_UPLOAD_DIR, { recursive: true });
  }
};

ensureUploadDir();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, TICKET_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

export const ticketAttachmentUpload = multer({
  storage,
  limits: { fileSize: config.upload.maxSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Format de fichier non supporté'));
  },
});

export const getTicketAttachmentPath = (filename: string): string => {
  return path.join(TICKET_UPLOAD_DIR, filename);
};

export const getTicketAttachmentUrl = (filename: string): string => {
  return `/uploads/tickets/${filename}`;
};

export const deleteTicketAttachmentFile = (filename: string): void => {
  const filePath = getTicketAttachmentPath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
