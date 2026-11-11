<p align="center"><img src="logo/jukebox_icon.png" alt="Wikebox" width="96"></p>

# Wikebox

*[Read in English](README.md) · [Leer en castellano](README.es.md)*

[![CI](https://github.com/Carlolius/wikebox/actions/workflows/ci.yml/badge.svg)](https://github.com/Carlolius/wikebox/actions/workflows/ci.yml)
[![Licenza: GPL v3](https://img.shields.io/badge/licenza-GPL--3.0-blue)](LICENSE)

**Unha gramola colaborativa para Spotify: os teus convidados engaden cancións e votan que soa despois.**

O anfitrión abre unha sala coa súa conta de Spotify. Os convidados entran desde o móbil co código da sala ou cun código QR, sen rexistrarse, buscan cancións e votan. A canción máis votada é a seguinte en soar.

## Funcións

- **Salas** cun código curto e un código QR. Os convidados só precisan un navegador.
- **Cola por votos:** os votos deciden a orde, e con abondos votos para saltar pásase á seguinte canción.
- **Reprodución** no navegador do anfitrión ou en calquera dispositivo con Spotify Connect.
- **Vista de pantalla grande** para unha tele ou un proxector, coa canción que soa e a cola.
- **Controis do anfitrión:** modo DJ, créditos por convidado e hora, filtro de xéneros, lista negra de cancións e artistas, e mensaxe de benvida.
- **Historial e estatísticas**, e a sesión pódese gardar como lista de Spotify.
- **Galego, castelán e inglés**, modo claro e escuro.

## Requisitos

- **Spotify Premium** na conta do anfitrión, que Spotify esixe para controlar a reprodución.
- **Unha app de Spotify** creada no [panel de desenvolvedores](https://developer.spotify.com/dashboard), coa URI de redirección `<PUBLIC_APP_URL>/api/auth/callback/spotify`. Mentres a app estea en modo desenvolvemento, só poden iniciar sesión as contas engadidas no panel. Só inician sesión os anfitrións, nunca os convidados.

## Executalo con Docker

```bash
cp .env.example .env    # pon as claves de Spotify e un segredo aleatorio
docker build -t wikebox .
docker run -d -p 3000:3000 --env-file .env -v wikebox_data:/data wikebox
```

Abre http://localhost:3000. A base de datos (SQLite) gárdase no volume `wikebox_data`. `docker-compose.yml` é un exemplo detrás dun proxy inverso [Traefik](https://traefik.io).

## Desenvolvemento

```bash
cd app
cp .env.example .env
npm install --legacy-peer-deps
node migrate.js    # crea ou actualiza a base de datos
npm run dev
```

Feito con [SvelteKit](https://kit.svelte.dev), [Drizzle ORM](https://orm.drizzle.team) sobre SQLite e [Better Auth](https://www.better-auth.com). Para contribuír, consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## Historia

Wikebox comezou como o meu Traballo de Fin de Grao na Universidade da Coruña (2020-2022), feito con Ionic e Django. Esa versión consérvase en [Carlolius/tfg](https://github.com/Carlolius/tfg). En 2026 reescribiuse desde cero con SvelteKit.

## Licenza

Copyright (C) 2020-2026 Carlolius. Con licenza [GNU General Public License v3.0](LICENSE).
