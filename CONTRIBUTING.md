# Contributing to Wikebox

Thanks for your interest. Wikebox is a hobby project maintained in spare time, so replies may take a while. Issues and pull requests are welcome, in English.

## Reporting a bug

[Open an issue](https://github.com/Carlolius/wikebox/issues) with what you did, what happened, your browser, and whether playback was in the browser or on a Spotify Connect device.

> [!CAUTION]
> Never paste your `.env`, Spotify keys or tokens into an issue.

## Pull requests

For anything beyond a small fix, open an issue first so we can agree on the approach.

```bash
cd app
npm install --legacy-peer-deps
npx svelte-kit sync && npx svelte-check --threshold error
npm run build
```

- `svelte-check` and the build must pass. CI runs both.
- Database changes go through Drizzle migrations: change `src/lib/db/schema.ts`, run `npm run db:generate` and commit the new file in `drizzle/`.
- The guest pages are translated into Spanish, Galician and English: when you add or change a text there, update the three.
- Code, comments and commit messages are in English.

By contributing, you agree that your contributions are licensed under the [GNU General Public License v3.0](LICENSE), like the rest of the project.
