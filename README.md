# Land AI — Landscape Design Tool

AI-powered softscape and hardscape palette generator for landscape architects.

---

## Deploy to Vercel (5 steps)

### Step 1 — Get your Anthropic API key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

---

### Step 2 — Put the project on GitHub
1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository** → name it `landai` → click **Create repository**
3. On your computer, install [Git](https://git-scm.com/downloads) if you haven't
4. Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
cd path/to/this/landai-folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/landai.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project**
3. Find and select your `landai` repository → click **Import**
4. Leave all settings as default (Vercel auto-detects Vite)
5. Click **Deploy** — wait about 1 minute

---

### Step 4 — Add your API key to Vercel
This is the most important step. Your key must be added here — never put it in the code.

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Set:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your key from Step 1
   - **Environments:** check Production, Preview, and Development
4. Click **Save**
5. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

---

### Step 5 — Open your live app
Vercel gives you a URL like `https://landai-abc123.vercel.app` — that's your live app.

To add a custom domain (like `landai.studio`):
- Go to **Settings** → **Domains** → add your domain
- Follow the DNS instructions (takes 5–10 minutes)

---

## Run locally (for development)

```bash
# Install dependencies
npm install

# Create your local environment file
cp .env.example .env.local
# Edit .env.local and paste your Anthropic API key

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> Note: For the API proxy to work locally, you need to install the Vercel CLI:
> ```bash
> npm install -g vercel
> vercel dev
> ```
> This runs the full Vercel environment locally at [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
landai/
├── api/
│   └── chat.js          ← Serverless function (holds API key, never exposed to browser)
├── src/
│   ├── main.jsx          ← React entry point
│   └── App.jsx           ← Full Land AI application
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── vercel.json           ← Vercel routing config
├── package.json
├── .env.example          ← Template — copy to .env.local, never commit .env.local
└── .gitignore
```

---

## How the API key stays secure

The browser calls `/api/chat` (your own server).  
Your server calls Anthropic with the secret key.  
The key never leaves the server — users never see it.

```
Browser → /api/chat (your Vercel function) → Anthropic API
                     ↑ API key lives here only
```
