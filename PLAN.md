# MVP Development Plan — "Blocky Adventure" (game name: **BlockWords**)

> Date: July 5, 2026 · Based on: [ANALYSIS.md](ANALYSIS.md) · Goal: playable MVP before school starts in September 2026

## 0. Locked Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Platform | Web / PWA | 0 cost, app-like via "Add to Home Screen" on iPhone |
| Stack | **Phaser 3 + TypeScript + Vite** | Mature 2D engine, mobile touch, fast builds (Phaser pinned to 3.x — npm defaults to v4) |
| Hosting | **GitHub Pages** → `fethiguney.github.io/blockwords` (`npm run deploy`) | `pages.dev` turned out ISP-blocked from Türkiye (found July 5, 2026); `blockwords.pages.dev` remains as backup (`npm run deploy:cf`) |
| Assets | **Kenney.nl** CC0 packs (pixel/voxel) + own drawings | Clean licensing, free |
| Content | JSON files (separate from code) | Curriculum/textbook changes don't touch code |
| Saves | localStorage (+ JSON export/import) | Serverless |
| MVP theme | **Life in Nature** (animals/nature, ~40 words) | Exists in both curricula, visually rich |
| MVP mechanics | Word Mining + Creature Duel (+ boss) | Craft Table deferred to v2 |
| Language | UI in Turkish, learning content in English | Target user is a Turkish 7th grader |

## 1. Project Skeleton

```
insructGame/
├── index.html
├── vite.config.ts
├── package.json
├── public/
│   ├── manifest.webmanifest      # PWA: name, icons, fullscreen (Sprint 4)
│   ├── icons/                    # 192px, 512px app icons (Sprint 4)
│   ├── favicon.svg
│   └── content/
│       └── nature.json           # MVP theme data
├── src/
│   ├── main.ts                   # Phaser config + scene registry
│   ├── config.ts                 # shared constants (game size)
│   ├── scenes/
│   │   ├── BootScene.ts          # asset preload + save load
│   │   ├── MenuScene.ts          # title, "Play", settings
│   │   ├── MapScene.ts           # level map (5 levels + boss)
│   │   ├── MiningScene.ts        # Mechanic 1: Word Mining
│   │   ├── DuelScene.ts          # Mechanic 2: Creature Duel (incl. boss)
│   │   └── ResultScene.ts        # level end: XP, emeralds, new words
│   ├── systems/
│   │   ├── SaveManager.ts        # localStorage read/write, export/import
│   │   ├── ContentLoader.ts      # JSON loading + validation
│   │   ├── WordScheduler.ts      # question picking + retry queue for misses
│   │   ├── Speech.ts             # Web Speech API TTS wrapper
│   │   └── Audio.ts              # sound effects
│   └── ui/                       # button, panel, hearts/XP bar components
└── .github/workflows/deploy.yml  # manual-only (Actions locked on the account)
```

## 2. Content Data Schema (nature.json)

```json
{
  "themeId": "nature",
  "title": { "en": "Life in Nature", "tr": "Doğada Yaşam" },
  "words": [
    {
      "id": "eagle",
      "en": "eagle",
      "tr": "kartal",
      "image": "animals/eagle.png",
      "sample": { "en": "An eagle can fly very high.", "tr": "Kartal çok yükseğe uçabilir." }
    }
  ],
  "sentences": [
    {
      "id": "s1",
      "en": "Elephants are bigger than lions.",
      "tr": "Filler aslanlardan büyüktür.",
      "distractors": ["big", "than lion"]
    }
  ],
  "levels": [
    { "id": 1, "name": "Orman Girişi", "wordIds": ["eagle", "..."], "tier": "stone" },
    { "id": 6, "name": "BOSS: Orman Bekçisi", "wordIds": ["*"], "tier": "boss" }
  ]
}
```

Rules:
- Word selection starts from old-curriculum "Wild Animals/Environment" lists; revised against the textbook in September (JSON-only change).
- `distractors` (wrong options) are hand-written — randomly generated wrong options can mislead.
- Images from Kenney packs; simple pixel art or emoji fallback for missing animals.

## 3. Save Schema (localStorage)

```json
{
  "version": 1,
  "xp": 0, "emeralds": 0,
  "unlockedLevel": 1,
  "wordStats": { "eagle": { "seen": 3, "correct": 2, "wrong": 1, "cracked": true } },
  "settings": { "sound": true, "tts": true }
}
```

Words with `cracked: true` are prioritized by the WordScheduler in later levels (spaced repetition). Settings screen offers single-file JSON export/import.

## 4. Mechanic Specs

### 4.1 Word Mining (MiningScene)
- A 4×4 wall of blocks; each block shows an English word (or picture).
- Tap a block → 3 options below (TR meaning or EN word, depending on tier).
- **Correct:** break animation + particles + "cling" sound, word joins inventory, +XP.
- **Wrong:** block cracks (doesn't break), word enters the retry queue; the correct answer is shown + read aloud by TTS.
- Level goal: clear the wall. NO time pressure (avoid anxiety), but finishing fast earns bonus emeralds.
- Tiers: Stone = picture→word matching; Iron = TR→EN typing (on-screen letter blocks); Diamond = listen→write.

### 4.2 Creature Duel (DuelScene)
- An original Creeper-like enemy on the right, player on the left; turn-based.
- A question card appears (word, or a blank in a sample sentence). 3 options.
- **Correct:** player strikes, enemy loses 1 HP, hit animation.
- **Wrong:** enemy steps closer / player loses a heart (3 hearts).
- Regular enemy: 5 HP. **Boss:** 10 HP + mixed words from all levels + 2 tiers of mixed question types.
- Running out of hearts restarts the level — no penalty, a positive "try again" message.

### 4.3 Level Map (MapScene)
- 6 nodes on a vertical path (5 levels + boss). Locked/open/completed states, 1-3 star display.
- Level = Mining section + Duel section back to back (boss: duel only).

## 5. Sprint Plan

Assumed pace: hobby time on evenings/weekends. Each sprint ~1 week.

### Phase 0 — Setup (1-2 evenings) ✅ DONE (July 5, 2026)
- [x] Finalize name + GitHub repo + address availability check
- [x] Vite + Phaser 3 + TS skeleton; interactive scene
- [x] Deploy pipeline live from day one (walking skeleton) — `npm run deploy` → GitHub Pages
- [ ] Download Kenney packs, pick sprites (moved to Sprint 2 — placeholder textures are generated in code for now)
- **Done means:** an empty scene that opens in iPhone Safari and reacts to touch. ✅

### Sprint 1 — Core infrastructure
- [ ] Scene flow: Boot → Menu → Map → (Mining/Duel) → Result
- [ ] `nature.json` v1: 40 words + 10 sample sentences + 6 level definitions (the most labor-intensive item — start early)
- [ ] ContentLoader + SaveManager + basic UI kit (button, panel, hearts/XP bar)
- [ ] Speech.ts: TTS "listen" function (remember iOS Safari needs an unlock on first touch)
- **Done means:** you can enter and leave an empty level from the map; progress saves and loads.

### Sprint 2 — Word Mining
- [ ] Block wall + option panel + correct/wrong flow (spec 4.1)
- [ ] Break/crack animations, particles, sounds
- [ ] WordScheduler v1: prioritize cracked words
- [ ] Stone tier complete; Iron tier (typing) basic version
- **Done means:** level 1 playable start to finish with XP/emeralds on the Result screen.

### Sprint 3 — Creature Duel + Boss
- [ ] Turn-based duel flow (spec 4.2), heart system, hit animations
- [ ] Boss variant (10 HP, mixed pool)
- [ ] Level = Mining + Duel chain; all 6 levels wired to data
- **Done means:** the theme can be finished end to end, boss included.

### Sprint 4 — Meta, PWA and iPhone
- [ ] Star system, level locks, emerald counter, a simple reward (menu skin)
- [ ] PWA: manifest + icons + service worker (offline play)
- [ ] Real-device iPhone test: touch target sizes (min 44px), safe-area, sound/TTS, "Add to Home Screen" flow
- [ ] Settings: sound on/off, progress export/import, reset progress
- **Done means:** launches from the home-screen icon and plays in airplane mode.

### Sprint 5 — Polish + Playtest 🎯
- [ ] "Juice": screen shake, combo sounds, level-end celebration
- [ ] Onboarding: 3-step visual intro on first launch (not text-heavy)
- [ ] **Session with the child: observe silently** — where do they get bored, laugh, ask questions → take notes
- [ ] Quick fixes based on observation
- **Done means:** does the child open it again on their own? (That's the real success metric.)

## 6. Test Checklist (end of every sprint)

- iPhone Safari (real device) + desktop Chrome
- First load < 5 MB, startup < 3 s
- TTS works after first touch
- localStorage save survives close-and-reopen
- Wrong answers never feel punishing (retry, not punishment)

## 7. Deliberately Out of MVP (v2 parking lot)

Craft Table (sentence building) · themes 2-8 · speech recognition · daily streak/notifications · multiple profiles · App Store (Capacitor) · leaderboards (needs a server — there is none)

## 8. Plan-Specific Risks

| Risk | Mitigation |
|---|---|
| Content entry gets tedious, project stalls | Finish nature.json in Sprint 1; convert word lists from existing PDFs |
| Scope creep ("let me just add...") | New ideas go to the §7 parking lot; the MVP definition doesn't change |
| iOS sound/TTS surprises | Early device test in Sprint 1, don't leave it to the end |
| The child doesn't like it | Not a failure — data. Change mechanics based on observation (that's what Sprint 5 is for) |

## 9. Operational Notes (learned during Phase 0)

- **Deploy:** `npm run deploy` publishes the working tree — commit first, then deploy.
- **`pages.dev` is ISP-blocked from Türkiye**; Cloudflare stays as backup (`npm run deploy:cf`, wrangler OAuth already set up).
- **GitHub Actions is locked on this account (billing)** — `.github/workflows/deploy.yml` is manual-trigger only; local deploy is the norm.
- **Phaser must stay pinned to 3.x** — plain `npm install phaser` brings v4.
