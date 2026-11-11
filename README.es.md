<p align="center"><img src="logo/jukebox_icon.png" alt="Wikebox" width="96"></p>

# Wikebox

*[Read in English](README.md) · [Ler en galego](README.gl.md)*

[![CI](https://github.com/Carlolius/wikebox/actions/workflows/ci.yml/badge.svg)](https://github.com/Carlolius/wikebox/actions/workflows/ci.yml)
[![Licencia: GPL v3](https://img.shields.io/badge/licencia-GPL--3.0-blue)](LICENSE)

**Una gramola colaborativa para Spotify: tus invitados añaden canciones y votan qué suena después.**

El anfitrión abre una sala con su cuenta de Spotify. Los invitados entran desde el móvil con el código de la sala o un código QR, sin registrarse, buscan canciones y votan. La canción más votada es la siguiente en sonar.

## Funciones

- **Salas** con un código corto y un código QR. Los invitados solo necesitan un navegador.
- **Cola por votos:** los votos deciden el orden, y con suficientes votos para saltar se pasa a la siguiente canción.
- **Reproducción** en el navegador del anfitrión o en cualquier dispositivo con Spotify Connect.
- **Vista de pantalla grande** para una tele o un proyector, con la canción que suena y la cola.
- **Controles del anfitrión:** modo DJ, créditos por invitado y hora, filtro de géneros, lista negra de canciones y artistas, y mensaje de bienvenida.
- **Historial y estadísticas**, y la sesión se puede guardar como lista de Spotify.
- **Castellano, gallego e inglés**, modo claro y oscuro.

## Requisitos

- **Spotify Premium** en la cuenta del anfitrión, que Spotify exige para controlar la reproducción.
- **Una app de Spotify** creada en el [panel de desarrolladores](https://developer.spotify.com/dashboard), con la URI de redirección `<PUBLIC_APP_URL>/api/auth/callback/spotify`. Mientras la app esté en modo desarrollo, solo pueden iniciar sesión las cuentas añadidas en el panel. Solo inician sesión los anfitriones, nunca los invitados.

## Ejecutarlo con Docker

```bash
cp .env.example .env    # pon las claves de Spotify y un secreto aleatorio
docker build -t wikebox .
docker run -d -p 3000:3000 --env-file .env -v wikebox_data:/data wikebox
```

Abre http://localhost:3000. La base de datos (SQLite) se guarda en el volumen `wikebox_data`. `docker-compose.yml` es un ejemplo detrás de un proxy inverso [Traefik](https://traefik.io).

## Desarrollo

```bash
cd app
cp .env.example .env
npm install --legacy-peer-deps
node migrate.js    # crea o actualiza la base de datos
npm run dev
```

Hecho con [SvelteKit](https://kit.svelte.dev), [Drizzle ORM](https://orm.drizzle.team) sobre SQLite y [Better Auth](https://www.better-auth.com). Para contribuir, consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## Historia

Wikebox empezó como mi Trabajo de Fin de Grado en la Universidade da Coruña (2020-2022), hecho con Ionic y Django. Esa versión se conserva en [Carlolius/tfg](https://github.com/Carlolius/tfg). En 2026 se reescribió desde cero con SvelteKit.

## Licencia

Copyright (C) 2020-2026 Carlolius. Con licencia [GNU General Public License v3.0](LICENSE).
