
# Lucky Numbers SA — Clickable Prototype

A lightweight HTML/JS prototype for the multi-lottery lobby + single betting panel + bet slip flow. No backend required.

## Run locally
- Open `index.html` in any modern browser.

## Deploy to GitHub Pages
1. Create a public repo (e.g. `lucky-lotto-prototype`) under **Cooperfu615-Desinger**.
2. Upload all files/folders in this ZIP (keep the folder structure).
3. In your repo: Settings → Pages → Build and deployment
   - Source: `Deploy from a branch`
   - Branch: `main` / folder `/ (root)`
4. Wait ~1 minute. Your site will be available at:  
   `https://Cooperfu615-Desinger.github.io/<your-repo-name>/`

## What’s included
- `index.html` — single page app shell
- `assets/styles.css` — minimal UI styles
- `assets/app.js` — vanilla JS SPA with: Lobby, Betting Panel (modal), Bet Slip drawer, Active Bets, Bet History
- `data/games.json` — 24 SA-themed games with mock frequencies
- Countdown timers are **client simulated** for demo only.

## Notes
- This is a UX demo. No real payouts or blockchain logic. Replace with your APIs later.
- The **Bet Slip** stores pending orders. Only after **Submit All Bets** they move to **Active Bets**.
