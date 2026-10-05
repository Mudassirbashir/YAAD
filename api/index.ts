import type { IncomingMessage, ServerResponse } from 'http';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);

let cachedApp: any = null;

function getApp() {
  if (cachedApp) return cachedApp;

  const candidatePaths = [
    path.join(process.cwd(), 'dist', 'server.cjs'),
    path.resolve('dist/server.cjs'),
    '/var/task/dist/server.cjs',
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const mod = require(p);
        cachedApp = mod.default?.default || mod.default || mod.app || mod;
        if (typeof cachedApp === 'function') {
          return cachedApp;
        }
      } catch (err) {
        console.warn('[Vercel Serverless] Failed loading from:', p, err);
      }
    }
  }

  try {
    const mod = require('../dist/server.cjs');
    cachedApp = mod.default?.default || mod.default || mod.app || mod;
    if (typeof cachedApp === 'function') {
      return cachedApp;
    }
  } catch (err) {
    console.warn('[Vercel Serverless] Direct require failed:', err);
  }

  throw new Error('Failed to load server application instance in serverless environment.');
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = getApp();
    return new Promise<void>((resolve, reject) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', reject);
      app(req, res);
    });
  } catch (err: any) {
    console.error('[Vercel Serverless Unhandled Handler Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: err?.message || 'Internal Server Error in Serverless API',
          code: 'SERVERLESS_FUNCTION_ERROR',
        })
      );
    }
  }
}

