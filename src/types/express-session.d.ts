// src/types/express-session.d.ts

import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: { id: number; role: string };
  }
}
