# bm2smil Server (Express + TypeScript)

A REST API for converting Lottie/Bodymovin JSON into animated SVG (SMIL) using the `bodymovin-to-smil` package.

The server is written in TypeScript, built on Express, includes baseline security (helmet, constrained CORS, request/upload size limits), and can serve the built frontend from `dist/` (if present at the repository root).

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [npm scripts](#npm-scripts)
- [Development quick start](#development-quick-start)
- [Configuration](#configuration)
  - [Environment variables](#environment-variables)
  - [Limits and timeouts](#limits-and-timeouts)
- [Static UI hosting](#static-ui-hosting)
- [Security](#security)
- [API](#api)
  - [GET /api/health](#get-apihealth)
  - [POST /api/convert](#post-apiconvert)
    - [Option 1: multipart/form-data (file)](#option-1-multipartform-data-file)
    - [Option 2: application/json|x-www-form-urlencoded (json field)](#option-2-applicationjsonx-www-form-urlencoded-json-field)
    - [Option 3: application/json|x-www-form-urlencoded (url field)](#option-3-applicationjsonx-www-form-urlencoded-url-field)
  - [Error codes](#error-codes)
- [Project structure](#project-structure)
- [Code formatting](#code-formatting)
- [Tips & troubleshooting](#tips--troubleshooting)

---

## Features

- Convert Lottie/Bodymovin JSON → SVG (SMIL)
- Accepts input in three ways: file, JSON string, or URL (http/https)
- Security baseline: security headers (helmet), CORS, size and time limits
- Serves static UI from `dist/` (if present)

## Requirements

- Node.js 20+ (LTS recommended; uses ESM and `undici`)
- npm 9+
- OS: Windows/macOS/Linux (examples include both PowerShell and Bash variants)

## Installation

```bash
# From the repository root
cd projects/server
npm install
```

If you also use the Angular UI from this repo, install its dependencies too (optional):

```bash
cd projects/ui
npm install
```

## npm scripts

Run these from `projects/server`:

- `npm run dev` — start in development mode via `tsx watch` (hot TS re-run).
- `npm run build` — compile TypeScript to `dist/` via `tsc`.
- `npm start` — build and run the compiled code from `dist/`.
- `npm run prettier:check` — verify formatting (ts/js/json/md).
- `npm run prettier:write` — apply formatting to files (ts/js/json/md).

## Development quick start

Option A — server only:

```bash
cd projects/server
npm run dev
# Server starts on http://localhost:5174 (unless PORT is set)
```

Option B — one command: server + Angular UI (if UI is installed):

```bash
cd projects/ui
npm run dev:all
# The script starts the server, waits for /api/health, then starts the UI at http://localhost:4200
```

## Configuration

### Environment variables

- `PORT` — server port. Default is `5174`.

Examples of setting the port:

- PowerShell (Windows):
  ```powershell
  $env:PORT=5175; npm run dev
  ```
- Bash (macOS/Linux):
  ```bash
  PORT=5175 npm run dev
  ```

### Limits and timeouts

Defined in `src/config.ts` (defaults):

- `MAX_BODY_SIZE_BYTES = 10 * 1024 * 1024` (10MB) — for `application/json` and `application/x-www-form-urlencoded`.
- `MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024` (5MB) — for uploads handled by `multer`.
- `MAX_FETCH_SIZE_BYTES = 5 * 1024 * 1024` (5MB) — for downloading remote JSON by URL.
- `FETCH_TIMEOUT_MS = 10_000` (10 seconds) — timeout for remote requests.

These parameters are currently code-driven. To change them, edit `src/config.ts`, then rebuild/restart the server.

## Static UI hosting

If a `dist/` directory is present at the repository root (for example, after building the Angular UI), the server will serve it. There is also a local fallback at `projects/server/dist/`.

Paths are resolved relative to `src/middleware/security.ts`:

- Primary path: `../../../../dist` (repository root)
- Fallback path: `../dist` (local to the server package)

## Security

- `helmet()` — sets common security headers.
- CORS — enabled (no credentials). In development it reflects the origin; in production, restrict the allowed origins.
- Body parsers — enforce size limits.
- File uploads — `multer` with memory storage, size limit, and MIME filter (JSON and octet-stream only).
- External JSON by URL — protocol validation (http/https), timeout, `content-type` check, and size limits.
- Extra response headers: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`.
- No authentication (by project requirements).

## API

### GET /api/health

Simple liveness probe.

- Response: `200 text/plain` — `server is up an running`

Example:

```bash
curl -i http://localhost:5174/api/health
```

### POST /api/convert

Converts Lottie/Bodymovin JSON to SVG (SMIL). Returns `image/svg+xml`.

Three input forms are supported:

1. `multipart/form-data` — field `file` containing a JSON file
2. `application/json` or `application/x-www-form-urlencoded` — string field `json` with serialized JSON
3. `application/json` or `application/x-www-form-urlencoded` — string field `url` with an http/https link to JSON

#### Option 1: multipart/form-data (file)

```bash
curl -X POST "http://localhost:5174/api/convert" \
  -H "Accept: image/svg+xml" \
  -F "file=@./animation.json;type=application/json" \
  -o out.svg
```

#### Option 2: application/json|x-www-form-urlencoded (json field)

Important: the `json` field is a string containing serialized JSON.

- application/json:

```bash
curl -X POST "http://localhost:5174/api/convert" \
  -H "Content-Type: application/json" -H "Accept: image/svg+xml" \
  --data '{"json":"{\\"v\\":\\"5.7.4\\",\\"layers\\":[]}"}' \
  -o out.svg
```

- application/x-www-form-urlencoded:

```bash
curl -X POST "http://localhost:5174/api/convert" \
  -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: image/svg+xml" \
  --data-urlencode "json={\"v\":\"5.7.4\",\"layers\":[]}" \
  -o out.svg
```

#### Option 3: application/json|x-www-form-urlencoded (url field)

The server will download JSON by the link (http/https only), validate content type and size.

- application/json:

```bash
curl -X POST "http://localhost:5174/api/convert" \
  -H "Content-Type: application/json" -H "Accept: image/svg+xml" \
  --data '{"url":"https://example.com/animation.json"}' \
  -o out.svg
```

- application/x-www-form-urlencoded:

```bash
curl -X POST "http://localhost:5174/api/convert" \
  -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: image/svg+xml" \
  --data-urlencode "url=https://example.com/animation.json" \
  -o out.svg
```

##### Response

- Success: `200 image/svg+xml; charset=utf-8` — body contains the SVG.
- Error: `application/json` with the `error` field.

### Error codes

- `400` — missing `file|json|url`, or invalid JSON in `file`/`json`.
- `413` — payload too large (request body, upload file, or remote JSON).
- `415` — unsupported `content-type` for uploaded or fetched resource.
- `422` — failed to parse JSON from the remote resource.
- `502` — error when fetching remote JSON (e.g., `fetch failed`).
- `500` — internal server error.

Example error response:

```json
{ "error": "Uploaded file is not valid JSON" }
```

## Project structure

```
projects/server/
├─ src/
│  ├─ app.ts                  # Express app configuration
│  ├─ main.ts                 # Entry point (starts listening on the port)
│  ├─ config.ts               # Port and limits (code-driven)
│  ├─ middleware/
│  │  └─ security.ts          # helmet, CORS, parsers, static, common headers
│  ├─ routes/
│  │  ├─ health.ts            # GET /api/health
│  │  └─ convert.ts           # POST /api/convert (file|json|url)
│  ├─ utils/
│  │  └─ fetch-json.ts        # Safe JSON fetch by URL with validation
│  └─ types/
│     └─ bodymovin-to-smil.d.ts # Local type declaration for the converter
├─ package.json               # dev/build/start scripts, dependencies
├─ tsconfig.json              # TypeScript settings (ESM, strict)
├─ prettier.config.mjs        # Server Prettier settings
└─ .prettierignore            # Prettier ignore rules
```

## Code formatting

```bash
cd projects/server
npm run prettier:check   # verify formatting
npm run prettier:write   # apply formatting
```

## Tips & troubleshooting

- Server does not start on 5174: check if the port is taken, or provide another via `PORT`.
- CORS errors in browser: ensure the server is running and responding; adjust CORS settings in `src/middleware/security.ts` as needed.
- Large files/JSON rejected: check limits in `src/config.ts` and increase them if necessary.
- Slow responses when using `url`: timeout `FETCH_TIMEOUT_MS` (10 seconds) may be hit, or `MAX_FETCH_SIZE_BYTES` exceeded.
- For production, run `npm start` — TypeScript is built first, then the app runs from `dist/`.

---

If you want to extend the configuration (e.g., move limits to environment variables or a `.env` file), feel free to open a task — the current implementation keeps these parameters centralized in `src/config.ts`.


## License

This repository is licensed under the MIT License. See the LICENSE file at the repository root for full text and terms.

Third-party packages are licensed under their respective licenses. Highlights:
- bodymovin-to-smil: ISC on npm (upstream repo lists MIT)
- TypeScript: Apache-2.0 (dev dependency)
- express, cors, helmet, multer, undici: MIT
