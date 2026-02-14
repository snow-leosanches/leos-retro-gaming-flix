# Leo's Retro Gaming Flix

A Netflix-style web app for curated retro gaming videos from YouTube and Vimeo. Works in the browser and on smart TVs.

## Features

- **Home**: Featured carousel and “All content” carousel
- **Detail**: Video description and Play button
- **Playback**: Fullscreen YouTube/Vimeo embed

## Content (JSON)

Edit `public/content.json` to add or change videos.

**Schema:**

- `youtube`: array of YouTube videos
- `vimeo`: array of Vimeo videos

Videos with `featured: true` appear in the “Featured” carousel; all videos appear in “All content”.

**Each video:**

| Field         | Required | Description                                                |
|---------------|----------|------------------------------------------------------------|
| `id`          | Yes      | Unique string (e.g. `avgn-mario-3`)                        |
| `title`       | Yes      | Display title                                              |
| `description` | Yes      | Short description (detail page)                            |
| `videoId`     | Yes      | YouTube video ID or Vimeo video ID                        |
| `featured`    | No       | When `true`, shown in the Featured carousel (default: false) |
| `thumbnail`   | No       | Image URL (optional; app shows a title placeholder if needed) |
| `duration`    | No       | e.g. `"~20 min"`                                           |
| `year`        | No       | e.g. `"2007"`                                              |

You can omit `provider` in the JSON; the app sets it from the array (`youtube` or `vimeo`).

## Analytics (Snowplow)

The app can send events to [Snowplow](https://snowplow.io/) using the JavaScript tracker with **YouTube** and **Vimeo** media plugins. Events are compatible with the [Snowplow Media Player dbt package](https://docs.snowplow.io/docs/modeling-your-data/modeling-your-data-with-dbt/dbt-models/dbt-media-player-data-model/) (media base, plays, stats, etc.).

**Tracked:**

- Page views (including hash route changes)
- Activity (heartbeat)
- Media: play, pause, seek, progress, volume, quality, errors, etc. (per YouTube/Vimeo embed)

**Setup:**

1. Copy `.env.example` to `.env`.
2. Set `VITE_SNOWPLOW_COLLECTOR_URL` to your Snowplow collector URL (e.g. `https://your-collector.snowplow.io`).
3. If the variable is unset, the app runs normally with no tracking.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve that folder (e.g. with `npm run preview` to test).

## Deploy on Vercel

The project is configured for [Vercel](https://vercel.com):

1. Push your repo to GitHub/GitLab/Bitbucket and [import it in Vercel](https://vercel.com/new).
2. Vercel will detect the Vite app and use the build/output settings from `vercel.json`.
3. **Optional (analytics):** In the Vercel project **Settings → Environment Variables**, add `VITE_SNOWPLOW_COLLECTOR_URL` with your Snowplow collector URL for production (and Preview if needed).
4. Deploy; the site will be served from `dist/` with cache headers for assets.

## Tech

- **Vite** (vanilla TS, no framework)
- **Hash routing** (`#/` home, `#/video/:id` detail)
- **Centralized content**: single `public/content.json`
- **Snowplow**: `@snowplow/browser-tracker` with YouTube and Vimeo media plugins
