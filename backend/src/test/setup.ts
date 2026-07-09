import { config as loadEnv } from 'dotenv';

loadEnv();

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'error';
