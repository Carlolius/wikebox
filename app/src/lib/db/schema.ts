import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// better-auth required tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

// App tables
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(), // short code like "abc123"
  name: text('name').notNull(),
  adminId: text('admin_id').notNull().references(() => user.id),
  playbackMode: text('playback_mode', { enum: ['sdk', 'connect'] }).notNull().default('sdk'),
  djMode: integer('dj_mode', { mode: 'boolean' }).notNull().default(false),
  creditsEnabled: integer('credits_enabled', { mode: 'boolean' }).notNull().default(false),
  creditsPerHour: integer('credits_per_hour').notNull().default(3),
  skipThreshold: integer('skip_threshold').notNull().default(50), // % of active users needed to skip
  genreFilter: text('genre_filter'), // JSON array or null
  activeDeviceId: text('active_device_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const songs = sqliteTable('songs', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  spotifyUri: text('spotify_uri').notNull(),
  title: text('title').notNull(),
  artists: text('artists').notNull(),
  albumArt: text('album_art'),
  durationMs: integer('duration_ms').notNull(),
  addedBy: text('added_by').notNull(), // fingerprint or userId
  addedByName: text('added_by_name'),
  addedMode: text('added_mode', { enum: ['search', 'playlist'] }).notNull().default('search'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  voterId: text('voter_id').notNull(), // fingerprint or userId
  value: integer('value').notNull(), // +1 or -1
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, (t) => ({
  uniqueVote: unique().on(t.songId, t.voterId)
}));

export const nowPlaying = sqliteTable('now_playing', {
  roomId: text('room_id').primaryKey().references(() => rooms.id, { onDelete: 'cascade' }),
  spotifyUri: text('spotify_uri').notNull(),
  title: text('title').notNull(),
  artists: text('artists').notNull(),
  albumArt: text('album_art'),
  durationMs: integer('duration_ms').notNull(),
  progressMs: integer('progress_ms').notNull().default(0),
  isPlaying: integer('is_playing', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const songHistory = sqliteTable('song_history', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  spotifyUri: text('spotify_uri').notNull(),
  title: text('title').notNull(),
  artists: text('artists').notNull(),
  albumArt: text('album_art'),
  durationMs: integer('duration_ms').notNull(),
  totalVotes: integer('total_votes').notNull().default(0),
  addedBy: text('added_by'),
  addedByName: text('added_by_name'),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const skipVotes = sqliteTable('skip_votes', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  voterId: text('voter_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, (t) => ({
  uniqueSkip: unique().on(t.roomId, t.voterId)
}));

export const blacklist = sqliteTable('blacklist', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  spotifyUri: text('spotify_uri'),
  artistName: text('artist_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const creditsLog = sqliteTable('credits_log', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(), // fingerprint or userId
  usedAt: integer('used_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});
