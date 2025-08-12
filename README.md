
# Lucky Numbers SA — Clickable Prototype (v4: Lobby Draw Reveal)

**What's new**
- Adds a lightweight draw reveal **in the lobby card** for **one test game**: ZA01-TBL (Table Mountain Peak).
- Behavior: when countdown reaches 0 → hide countdown & buttons → numbers appear one-by-one (0.5s) with a small bounce → hold 30s → reset to next countdown.
- i18n supported (中文 / English): badge shows "Drawing" / "Result" (或「開獎中 / 結果」).

**How to update your repo**
Overwrite these files:
- `index.html`
- `assets/styles.css`
- `assets/app.js`
- `data/games.json` (unchanged, included for completeness)

Commit → wait 1–3 minutes for GitHub Pages to redeploy.

**Notes**
- Only the first game tile (ZA01-TBL) has the lobby reveal to keep performance predictable for this test.
- After validation, we can roll it out to all/selected games or add a toggle for "featured draw".
