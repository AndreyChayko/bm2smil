# Lottie & Bodymovin → Pure SVG (SMIL) Converter

Turn Lottie (Bodymovin) JSON animations into pure SVG with SMIL right in your browser. ✨

This repository contains:
- UI (Angular 20+) — modern, fast, and accessible interface
- Server (Node.js + Express) — conversion API powered by bodymovin-to-smil


## 🚀 Quick start (most users)

1) Install Node.js LTS (v18+ recommended v20+): https://nodejs.org

2) Open a terminal and run the following commands step by step:

```bash
# 1. Install server dependencies
cd projects/server
npm install

# 2. Start the server (it will watch for changes)
npm run dev
# Server will listen on http://localhost:5174
```

Open a second terminal:

```bash
# 3. Install UI dependencies
cd projects/ui
npm install

# 4. Start the UI
npm run start
# UI will open on http://localhost:4200
```

That’s it! Visit http://localhost:4200 in your browser. The header shows server status (click it to re-check).


## 💡 One-command start (after first install)
If you already installed dependencies once in both folders (server and ui), you can start both with one command:

```bash
cd projects/ui
npm run dev:all
```

This runs the server and the UI together. The UI will wait for the server health endpoint to become available.


## 🧩 What this converter does
- Converts Lottie (Bodymovin) JSON into pure SVG using SMIL animations (no Canvas, no WebGL)
- Renders a live preview in the browser
- Lets you copy SVG to clipboard or download as a file

It supports basic animations:
- masks (additive and intersect)
- shapes
- solids
- texts
- precomps
- transforms
- opacity


## 🛠️ Tech stack & links
- UI
  - Angular 20+ (standalone components, signals, new control flow)
  - Docs: https://angular.dev
- Server
  - Express — https://expressjs.com
  - bodymovin-to-smil — https://www.npmjs.com/package/bodymovin-to-smil
  - multer (file uploads) — https://github.com/expressjs/multer
  - undici (HTTP client) — https://undici.nodejs.org/


## 📦 Project structure
```
projects/
  server/   # Node.js + Express conversion API (TypeScript)
  ui/       # Angular 20+ web app
```


## 🧭 Using the UI
1. Open http://localhost:4200
2. Check the status badge on the right — it shows if the server is online
3. Choose your method:
   - Convert by URL — paste a direct link to a Lottie JSON file and click “Convert URL”
   - Upload JSON file — click “Choose file” and pick a .json
   - Drag & drop — drop a .json file into the highlighted area
4. Wait for conversion (you’ll see “Converting…”)
5. Preview the SVG and use:
   - “Copy SVG” to clipboard
   - “Download” to save as converted.svg


## 🔌 API (for advanced users)
Server base URL: `http://localhost:5174`

- Health check
  - GET `/api/health`
  - returns `{ ok: true }` when online

- Convert
  - POST `/api/convert`
  - multipart/form-data with one of the following fields:
    - `file`: a JSON file (Content-Type: application/json)
    - `url`: a direct URL to the JSON
    - `json`: plain text containing JSON
  - returns: `image/svg+xml` as text (SVG string)

Example (URL):
```bash
curl -X POST http://localhost:5174/api/convert \
  -F "url=https://example.com/animation.json" \
  -H "Accept: text/plain"
```

Example (file):
```bash
curl -X POST http://localhost:5174/api/convert \
  -F "file=@./my-animation.json;type=application/json" \
  -H "Accept: text/plain"
```


## ❓ Troubleshooting
- Server offline / status is red
  - Make sure you started the server (`cd projects/server && npm run dev`)
  - Check that no other app uses port 5174
  - Try clicking the status badge to re-check
- UI not opening
  - Start it with `cd projects/ui && npm run start` and open http://localhost:4200
- CORS issues
  - The server enables CORS for development; if you modified config, re-enable it
- “Command not found” (e.g., tsx)
  - Run `npm install` in the respective folder
- Corporate proxy/SSL
  - Configure npm proxy: `npm config set proxy http://…` (ask your IT if unsure)


## 🧪 Notes for developers
- Angular app uses:
  - Standalone components (no NgModules)
  - Signals for local state
  - OnPush change detection
  - New template control flow (`@if`, `@for`)
- Styling:
  - Sass with `@use`
  - BEM naming
  - Theme with CSS variables

Useful scripts:
```bash
# Server
cd projects/server
npm run dev      # watch mode
npm run build    # compile to dist
npm start        # run compiled build

# UI
cd projects/ui
npm run start    # dev server
npm run build    # production build
npm run dev:all  # start server + UI (after dependencies are installed)
```


## 📜 License
This project is licensed under the terms of the [LICENSE](./LICENSE) file.


## 🙏 Credits
- Lottie / Bodymovin format — https://airbnb.io/lottie/
- Conversion library: [bodymovin-to-smil](https://www.npmjs.com/package/bodymovin-to-smil)
- Built with ❤️ using Angular 20+ and Express
