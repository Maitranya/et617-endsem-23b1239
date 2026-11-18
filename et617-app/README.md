# 1857 Detectives — ET 617 End-Sem (23B1239)
Card: P3 · P3-T5 · L5 · C4. Plain HTML/CSS/JS + one Vercel serverless function (`api/agents.js`). No UI library or template.

## Run / deploy
- Deployed on Vercel from this repo (Framework preset: **Other**, no build command).
- Env var (Vercel → Settings → Environment Variables): `GEMINI_API_KEY` (optional `GEMINI_MODEL`) **or** `OPENAI_API_KEY` (optional `OPENAI_MODEL`, `OPENAI_BASE_URL`).
- Without a key the app runs with the labelled rule-based fallback.

## Files
- `index.html`, `style.css`, `app.js` – screens, 10-min session bar, autosave/resume
- `content.js` – all learning content, feedback and recorded fallback replies
- `api/agents.js` – chained agent calls (Sana → Meera + Kabir), validation, fallback
- `api/fallback.json` – recorded sample replies used by the server fallback
