<p align="center"><img src="logo/jukebox_icon.png" alt="Wikebox" width="96"></p>

# Wikebox

*[Leer en castellano](README.es.md) · [Ler en galego](README.gl.md)*

[![CI](https://github.com/Carlolius/wikebox/actions/workflows/ci.yml/badge.svg)](https://github.com/Carlolius/wikebox/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

**A collaborative jukebox for Spotify: your guests add songs and vote on what plays next.**

The host opens a room with their Spotify account. Guests join from their phone with the room code or a QR code, without signing up, search for songs and vote. The most voted song plays next.

## Features

- **Rooms** with a short code and a QR code. Guests only need a browser.
- **Voting queue:** votes decide the order, and enough skip votes jump to the next song.
- **Playback** in the host's browser or on any Spotify Connect device.
- **Big screen view** for a TV or projector, with the current song and the queue.
- **Host controls:** DJ mode, credits per guest and hour, genre filter, blacklist of songs and artists, and a welcome message.
- **History and statistics**, and the session can be saved as a Spotify playlist.
- **Spanish, Galician and English**, light and dark mode.

## Requirements

- **Spotify Premium** on the host's account, which Spotify requires to control playback.
- **A Spotify app** created in the [developer dashboard](https://developer.spotify.com/dashboard), with the redirect URI `<PUBLIC_APP_URL>/api/auth/callback/spotify`. While the app is in development mode, only the accounts added in the dashboard can sign in. Only hosts sign in, guests never do.

## Run it with Docker

```bash
cp .env.example .env    # fill in the Spotify keys and a random secret
docker build -t wikebox .
docker run -d -p 3000:3000 --env-file .env -v wikebox_data:/data wikebox
```

Open http://localhost:3000. The database (SQLite) lives in the `wikebox_data` volume. `docker-compose.yml` is an example behind a [Traefik](https://traefik.io) reverse proxy.

## Development

```bash
cd app
cp .env.example .env
npm install --legacy-peer-deps
node migrate.js    # create or update the database
npm run dev
```

Built with [SvelteKit](https://kit.svelte.dev), [Drizzle ORM](https://orm.drizzle.team) on SQLite and [Better Auth](https://www.better-auth.com). See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute.

## History

Wikebox began as my Bachelor's thesis at the University of A Coruña (2020-2022), built with Ionic and Django. That version is kept in [Carlolius/tfg](https://github.com/Carlolius/tfg). In 2026 it was rewritten from scratch with SvelteKit.

## License

Copyright (C) 2020-2026 Carlolius. Licensed under the [GNU General Public License v3.0](LICENSE).
