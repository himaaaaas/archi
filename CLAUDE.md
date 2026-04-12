# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start frontend (Vite dev server on port 5173)
PATH="/opt/homebrew/bin:$PATH" npm run dev

# Start backend API proxy (Express on port 3001) — required for AI calls locally
/opt/homebrew/bin/node server.js

# Build for production
npm run build
```

Both servers must run simultaneously for local development. The Vite dev server proxies `/api/*` requests to `localhost:3001` (configured in `vite.config.js`).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `ANTHROPIC_API_KEY` — required for all AI palette generation
- Supabase credentials are read from `src/supabase.js` via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Architecture

### API Security Pattern
The Anthropic API key never reaches the browser. All AI requests flow:
```
React (App.jsx) → fetch('/api/chat') → server.js (dev) or api/chat.js (prod) → Anthropic API
```
- **Local dev**: `server.js` (Express, port 3001) handles `/api/chat`
- **Production**: `api/chat.js` (Vercel serverless function) handles `/api/chat`
- Both implementations are functionally identical except `api/chat.js` uses `claude-sonnet-4-20250514` with `web_search` tool enabled and 10,000 max tokens; `server.js` uses `claude-sonnet-4-6` with 8,000 max tokens and no web search

### Auth & Data Flow
- `main.jsx` bootstraps Supabase auth — renders `<Login />` or `<App />` based on `session` + `enterApp` state
- `enterApp` is only set to `true` when the user explicitly clicks "Generate a Palette" / "Begin Your Palette"
- OAuth sign-in from the navbar **does not** auto-enter the app — user stays on the landing page
- OAuth sign-in from the generate modal **does** auto-enter — uses `sessionStorage` key `lp_enter_after_auth` as a flag
- `onGoHome` prop passed to `<App />` resets `enterApp` to `false`, returning to the landing page when LandPal. is clicked
- `src/supabase.js` exports the singleton Supabase client
- `src/palettes.js` contains all DB operations (save/load/delete) against the `palettes` table

### Login.jsx (Landing Page)
- Single-file landing page with all styles inline via `<style>` tag
- **Fonts**: Cormorant Garamond (serif/italic headings) + Plus Jakarta Sans (UI) + Garet (brand/nav/CTAs) via CDNFonts
- **Hero**: local `src/assets/landing_page.jpeg` with three-layer cinematic overlay (filter + tint + gradient)
- **"How it works"** section: cream background, three-column editorial layout with faded step numbers and Garet titles
- **Quote section**: cream background with Cormorant italic quote + CTA button
- **Contact section**: two-column layout (heading + email left, form card right)
- **Sign-in modal**: appears when unauthenticated user clicks "Generate a Palette" or "Begin Your Palette"; has LandPal. wordmark, description, and Google OAuth button; clicking modal button sets `sessionStorage` flag before OAuth redirect
- **Navbar**: LandPal. logo (links to top) + Contact link (scrolls to `#section-contact`) + Sign In button

### App.jsx Structure
`App.jsx` (~1,500 lines) is the entire application in one file. It contains:
1. **Large constant data blocks** at the top: `COUNTRY_GROUPS`, `COUNTRY_SUB_REGIONS`, `REGION_HINTS`, `REGION_AUTO_CONDITIONS`, and all category/style/mood/material arrays for both softscape and hardscape
2. **Multi-step wizard state** — step index, form field state, and generated result state
3. **Prompt builder** — assembles user selections into a structured prompt string sent to `/api/chat`
4. **Result renderer** — parses the Claude response and displays plant tables and hardscape specs
5. **Inline styles throughout** — no CSS files or CSS modules; all styling is inline via a `CSS` constant injected via `<style>` tag

### Wizard Steps & Images
- `paletteType` defaults to `"softscape"`
- Steps vary by palette type: base steps → softscape steps (style, plants, colour, conditions) → hardscape steps (hd-materials, hd-zones) → brief
- **Full-bleed background images** (fixed position, right side, gradient fade left): location step uses `GlobeView` 3D globe; project step uses `project_setup.jpeg`; softscape steps (style, plants, colour, conditions) use local asset images; hardscape steps have no background image
- `STEP_IMAGES` maps step IDs to imported local assets
- Step content is called as `StepContent()` (plain function, not `<StepContent/>` JSX) to prevent React remount on every render — critical for textarea focus

### Local Assets (`src/assets/`)
| File | Used in |
|------|---------|
| `landing_page.jpeg` | Login.jsx hero background |
| `project_setup.jpeg` | Project wizard step background |
| `softscape.jpeg` | Palette type selection card |
| `Hardscape.jpeg` | Palette type selection card |
| `Both.jpeg` | Palette type selection card |
| `panting_style.jpeg` | Style wizard step background |
| `pant_categories.jpeg` | Plants wizard step background |
| `seasonality.jpg` | Colour wizard step background |
| `special conditions.jpg` | Conditions wizard step background |

### GlobeView.jsx
- Uses `react-globe.gl` as a React component
- ResizeObserver measures container for correct globe sizing
- Auto-rotates when no country selected; stops and flies to country on selection
- Two-step fly-to animation: zoom out (800ms) then zoom in (1000ms)
- Custom HTML marker with pulsing ring animation at selected country coordinates
- 100+ country coordinate map built in

### Colour Swatches (softscape & hardscape)
- Both softscape colours and hardscape colour tones use the same `.ctag` component
- Each swatch is a `.ctag-swatch` (full-colour block, 52px tall) + `.ctag-name` label
- Rendered in CSS grid `repeat(auto-fill, minmax(80px, 1fr))`

### Supabase `palettes` Table Schema
Rows contain: `id`, `user_id`, `title`, `params` (JSON of wizard selections), `result` (JSON of generated palette), `created_at`

### Export Modules
- `src/exportPptx.js` — uses PptxGenJS to build multi-slide decks; fetches plant images from Wikipedia API at export time; no emoji fallback (plain green rectangle if no image found)
- `src/exportDxf.js` — generates layered AutoCAD DXF output from hardscape data

## Key Bugs Fixed (do not reintroduce)
- **Textarea focus lost after each keystroke**: caused by calling `<StepContent/>` as JSX inside render — always call `StepContent()` as a plain function
- **ANTHROPIC_API_KEY not loading**: `dotenv.config()` must use `override: true` and resolve path relative to `__dirname` (via `fileURLToPath`)
- **Sign In auto-entering app**: `SIGNED_IN` event in `onAuthStateChange` must only `setEnterApp(true)` when `sessionStorage` flag `lp_enter_after_auth` is present

## Deployment

Deployed on Vercel. The `vercel.json` rewrites all routes to the SPA. Environment variables (`ANTHROPIC_API_KEY`, Supabase keys) must be set in the Vercel project dashboard. After adding env vars, redeploy is required.
