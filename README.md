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

## Tech

- **Vite** (vanilla JS, no framework)
- **Hash routing** (`#/` home, `#/video/:id` detail)
- **Centralized content**: single `public/content.json`
