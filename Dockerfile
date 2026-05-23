FROM node:22-alpine AS builder
WORKDIR /app

# Native build tools needed for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY app/package*.json ./
RUN npm install --legacy-peer-deps

COPY app/ .

# Build SvelteKit app — BETTER_AUTH_SECRET must be present during SSR init
# Use a placeholder; actual secret comes from docker-compose .env at runtime
ARG BETTER_AUTH_SECRET=build-time-placeholder-secret-wikebox-x
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV SPOTIFY_CLIENT_ID=build-placeholder
ENV SPOTIFY_CLIENT_SECRET=build-placeholder
RUN npm run build

# Remove dev dependencies
RUN npm prune --production --legacy-peer-deps

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# libstdc++ is needed to run better-sqlite3 native addon
RUN apk add --no-cache libstdc++

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/migrate.js .

ENV NODE_ENV=production
ENV DATABASE_URL=/data/wikebox.db
EXPOSE 3000
VOLUME ["/data"]

# Run DB migrations then start the app
CMD ["sh", "-c", "node migrate.js && node build"]
