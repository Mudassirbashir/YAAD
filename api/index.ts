import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    return (app as any)(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Unhandled Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: err?.message || 'Internal Server Error in API handler',
          code: 'SERVERLESS_FUNCTION_ERROR',
        })
      );
    }
  }
}
