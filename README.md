# Quantora

Institutional quantitative trading terminal — Monte Carlo, backtester, market intelligence. Vite + React 18 + TypeScript.

## Live demo

After deploy: `https://bachhhhhhhhhhhhhh.github.io/-quantora-/`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173/

Or double-click `start.bat` (Windows).

## Deploy to GitHub Pages

### 1. Create repository on GitHub

- Go to https://github.com/new
- Name: `quantora` (or any name — update `base` in `vite.config.ts` if different)
- Public repository
- Do **not** add README (already exists locally)

### 2. Push code

```bash
cd quantora
git init
git add .
git commit -m "Initial commit: Quantora v5.0"
git branch -M main
git remote add origin https://github.com/Bachhhhhhhhhhhhhh/-quantora-.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **`gh-pages`** → folder **`/ (root)`** → Save
4. Tab **Actions** → đợi workflow **Deploy to GitHub Pages** chạy xong (1–2 phút)
5. Site live at `https://bachhhhhhhhhhhhhh.github.io/-quantora-/`

> **Quan trọng:** Phải chọn branch `gh-pages`, KHÔNG chọn `main` (main là source code, không chạy được).

## Tech stack

- Vite 8 · React 18 · TypeScript · Tailwind CSS 4
- Recharts · Framer Motion · Yahoo Finance (client-side)
- 174 VN stocks · Quant Screener · Sentiment · Peer ranking

## Author

Truong The Bach