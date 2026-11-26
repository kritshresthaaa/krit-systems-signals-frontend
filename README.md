# Krit Shrestha — Systems & Signals (React + Vite)

Interactive portfolio built with React, Vite, and `lucide-react`, preserving all standalone interactive campaign apps and Canva poster embeds.

## Folder Structure
- `src/App.jsx` & `src/components/` — Modular React components (`Navbar`, `Hero`, `ProjectGallery`, `LiveStage`, `ArchitectureSketchbook`, `About`, `Contact`, `Footer`, `FullscreenModal`).
- `src/data/projects.json`, `src/data/moduleNotes.js`, `src/data/palettes.js` — Portfolio catalog data, architecture module annotations, and color mood palettes.
- `src/styles/global.css` — Portfolio design system and responsive layout styles.
- `public/projects/` — Standalone interactive HTML campaign apps (`panic-button.html`, `touch-grass.html`, `fridge-friend.html`, `dont-take-the-bait.html`) served directly for the Live Work Stage and standalone tabs.
- `public/data/projects.json` — Clean project catalog JSON (ready to serve from a Cloudflare Worker at `/api/projects`).

## Run Locally
```bash
npm install
npm run dev
```
Then open `http://localhost:5173`.

## Production Build
```bash
npm run build
npm run preview
```
