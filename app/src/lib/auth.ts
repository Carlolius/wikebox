import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
  socialProviders: {
    spotify: {
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      scope: [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-email',
        'user-read-private'
      ]
    }
  }
});

export type Auth = typeof auth;
