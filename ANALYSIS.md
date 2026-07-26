# English Learning Game — Requirements Analysis & Research

> Date: July 5, 2026 · Status: analysis phase (updated after Phase 0 with hosting findings)

## 1. Project Summary

| Topic | Decision / Constraint |
|---|---|
| Target user | A single student entering 7th grade (2026-27) who loves Minecraft |
| Goal | Fun-first English learning aligned with the school curriculum |
| Budget | 0 TL — no server costs, no paid services |
| Distribution | Web (free hosting) or iPhone app |
| Commercial goal | None — personal project, will grow based on results |
| Approach | Start small (MVP), iterate on feedback |

---

## 2. Curriculum Analysis (Key Finding)

### The new curriculum reaches 7th grade in 2026-27

The Turkish MoE's **"Türkiye Yüzyılı Maarif Modeli"** rollout: grades 1/5/9 in 2024-25, grades 2/6/10 in 2025-26, **grades 3/7/11 in 2026-27**. So the student will study the **new program** in 7th grade.

### New program: 8 themes (TYMM, 7th-grade English)

1. **School Life & Education**
2. **Classroom Life & Learning**
3. **Personal Life & Well-being**
4. **Family Life & Home**
5. **Life in the Neighbourhood & City and Social Life**
6. **Life in the World & Culture**
7. **Life in Nature**
8. **Life in the Universe & Future**

Source: [TYMM 7th-grade English program (official)](https://tymm.meb.gov.tr/ogretim-programlari/ingilizce-dersi-temel-egitim/8)

### Old program: 10 units (2018 curriculum — still valuable)

Appearance & Personality, Sports, Biographies, Wild Animals, Television, Celebrations, Dreams, Public Buildings, Environment, Planets.

**Why it matters:** nearly all ready-made vocabulary lists, PDFs and exercises online follow the old program. The two programs overlap heavily in themes (e.g. Wild Animals ≈ Life in Nature, Planets ≈ Life in the Universe). Once the school year starts (September 2026), the **student's actual textbook units and word lists** become the authoritative source.

**Design consequence:** game content must not be hard-coded. All words/questions/units live in **JSON data files** — when the curriculum/textbook is finalized, content changes without code changes. Adding a unit = adding a JSON file.

### Level

7th-grade MEB English ≈ **CEFR A1–A2**. Game content stays in this band; difficulty tiers can progress from A1 recognition to A2 production.

---

## 3. Minecraft Theme — Copyright / Trademark

- **Not allowed:** the "Minecraft" name, logo, actual game textures, character models, or one-to-one characters like the Creeper. Microsoft/Mojang usage guidelines forbid these in your own app (App Store review also rejects clones).
- **Allowed:** voxel/blocky visual style, pixel art, mine-collect-craft mechanics, sandbox feel. Game *mechanics* are not copyrightable; style inspiration is fine.
- **Practical route:** blocky assets from Kenney.nl (CC0 — completely free, no attribution needed: "Voxel Pack", pixel platformer sets) and OpenGameArt. Design original "Creeper-like but different" enemies.
- **Name:** BlockWords (chosen) — evokes a blocky world without using "Minecraft".

Risk is low for a personal non-commercial project anyway, but starting clean keeps the App Store option open.

---

## 4. Platform Decision: Web (PWA) Wins Clearly

### iPhone App Store — conflicts with the zero-budget constraint

| Blocker | Detail |
|---|---|
| Apple Developer Program | **$99/year** required — violates the zero-budget constraint |
| Mac requirement | iOS builds need Xcode/macOS; the dev machine is Windows |
| Free-account sideload | Possible but the app **must be reinstalled every 7 days**, and still needs a Mac |
| Review process | Education clones / single-user apps can be rejected |

### Web + PWA — meets the whole goal at 0 cost

- **Free hosting:** GitHub Pages, Cloudflare Pages, Netlify, Vercel — all fully free for static sites, HTTPS included. Alternative: itch.io.
- **App-like on iPhone:** Safari → Share → **"Add to Home Screen"** → opens full-screen with an icon (PWA).
- **Offline:** with a service worker the game runs without internet after first load.
- **Server requirement: zero.** Fully static files.

**iOS caveat:** Safari may evict local data of sites unused for 7 days; **home-screen PWAs are exempt** — hence the "Add to Home Screen" step matters. A progress export/import (JSON download/upload) feature is cheap insurance.

### ⚠️ Hosting finding (July 5, 2026, discovered during Phase 0)

**`*.pages.dev` (Cloudflare Pages) is blocked at ISP level from Türkiye** — DNS resolves but the TLS handshake is cut. Verified against multiple `pages.dev` sites while `cloudflare.com` and `github.io` load fine.

**Revised decision:** primary hosting is **GitHub Pages** (`fethiguney.github.io/blockwords`). The Cloudflare Pages project (`blockwords.pages.dev`) stays as a backup — reachable from abroad and ready if the block is lifted.

**Decision:** start with Web/PWA. If the game succeeds, the same code can later ship to the App Store via Capacitor (revisit the $99 + Mac question then).

---

## 5. Architecture: Fully Serverless

```
Static site (free host)
├── Game engine code (TS/JS)
├── content/           ← one JSON per unit (words, questions, dialogues)
│   ├── theme1-school-life.json
│   └── ...
├── assets/            ← CC0 pixel art, sounds
└── localStorage       ← progress, XP, inventory (stored on device)
```

- Progress in **localStorage**; no accounts/login/database.
- Pronunciation via the **Web Speech API (speechSynthesis)** — built into browsers, free, works on iOS Safari. A "listen" button on word cards comes for free.
- (Speech recognition — listening to the student's pronunciation — has patchy browser support; out of MVP scope, a later-phase candidate.)

---

## 6. Technology Options

| Option | Pros | Cons | Fit |
|---|---|---|---|
| **Phaser 3 + TypeScript + Vite** | Mature 2D game framework, good mobile touch support, huge community | No 3D | ⭐ **Chosen** |
| Kaplay (Kaboom successor) | Very simple API, fast prototyping | Smaller ecosystem | Good plan B |
| Plain JS + Canvas/DOM | Zero dependencies | Everything hand-rolled | Enough only if mini-games stay very simple |
| Three.js voxel 3D | Real "Minecraft feel" | High complexity and iPhone performance risk | Not for MVP; maybe v3 |
| Godot 4 → HTML5 export | Full engine | Heavy web output (~30MB+ wasm), iOS Safari history of issues | Unnecessary here |

**Choice:** Phaser 3 with a **2D blocky/pixel-art** world. The Minecraft feel comes from block aesthetics, mining/crafting mechanics and sound/particle effects — not 3D. Runs smoothly in iPhone Safari, small footprint. (Note: npm installs Phaser 4 by default now; the project pins 3.x.)

---

## 7. Game Design Concept: "Blocky Adventure"

### Frame
A **world map** where each biome = one curriculum theme (8 themes = 8 biomes: school village, family farm, city, forest/nature, space...). Biomes unlock in order; each has 4-6 levels + 1 boss.

### Core mechanics (mini-game loops)
1. **Word Mining:** to break a block, pick the meaning/picture of the English word on it. Correct = block breaks, word enters inventory. (recognition)
2. **Craft Table:** arrange word blocks in the right order to **craft sentences** (word order / grammar). Correct sentence = an item/tool is produced.
3. **Creature Duels:** a Creeper-like enemy asks questions; correct answers deal damage, wrong ones let it approach. (speed + reinforcement)
4. **Boss = unit review:** a big enemy quizzing all words/structures of the theme, mixed.

### Learning mechanics (invisible pedagogy)
- **Inventory = learned words.** Missed words get marked as "cracked blocks" and **come back in later levels** (spaced repetition).
- Every word has a **listen button** (free TTS pronunciation).
- **Difficulty tiers** (3 per level):
  - ⛏️ Stone: recognition — matching, picture-word (A1)
  - ⚒️ Iron: recall — fill-in-the-blank, typing
  - 💎 Diamond: production — sentence building, listen-and-write (A2)

### Motivation loop
XP and levels, emerald economy, unlockable skins/decor bought with emeralds, daily streak. All rewards in-game — no real money.

### Biggest design risk
"**Chocolate-covered broccoli**": a quiz with a Minecraft skin bores a kid in two days. Antidote: answers must *be* the game action (the block breaks, the enemy recoils, the item gets crafted) and progression/collection must feel strong. The child is the best test user — playtesting the MVP with them and observing is the most valuable step of the roadmap.

---

## 8. MVP Scope (Proposed First Release)

- **1 theme** (proposal: *Life in Nature* — animal words are fun and exist in both curricula)
- ~40 words + 8-10 basic pattern sentences (in JSON)
- **2 mechanics:** Word Mining + Creature Duel (Craft Table deferred to v2)
- 5 levels + 1 boss, 3 difficulty tiers
- localStorage progress + TTS listen button
- Published on GitHub Pages, "Add to Home Screen" tested on iPhone

Buildable by a single developer in a few weeks of evening work.

## 9. Roadmap

| Phase | Content | Output |
|---|---|---|
| 0 | Concept approval, asset selection (Kenney), name | Design decisions |
| 1 | **MVP** (scope above) | Playable link |
| 2 | Playtest with the child → feedback; craft mechanic, 2-3 more themes | v2 |
| 3 | September 2026: align content with the actual textbook units | Curriculum sync |
| 4 | (Optional) all 8 themes, listening questions, maybe Capacitor/App Store | v3+ |

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Content production outweighs code (the real work is entering words/questions) | Keep the JSON schema simple; start from old-curriculum word lists, update when the textbook arrives |
| If the game feels boring, the goal collapses | Playtest the MVP early, adapt mechanics to the child's reactions |
| Minecraft IP | Original assets + no "Minecraft" in the name |
| iOS Safari data eviction | Install as home-screen PWA + progress export |
| App Store cost | Defer via Web/PWA; reconsider once if ever needed |

---

## Sources

- [TYMM 7th-grade English program (official)](https://tymm.meb.gov.tr/ogretim-programlari/ingilizce-dersi-temel-egitim/8)
- [TYMM programs home](https://tymm.meb.gov.tr/ogretim-programlari)
- [2026-2027 new curriculum 7th-grade transition](https://kaganakademi.com.tr/blog/yeni-mufredat-7-sinif-konulari)
- [Old (2018) 7th-grade English program PDF (MEB)](https://mufredat.meb.gov.tr/Dosyalar/TTKB/Ortaokul/7/%C4%B0ngilizce/c1_ingilizce_7.pdf)
- [7th-grade unit word lists (old curriculum)](https://www.ingilizcele.com/7-sinif-ingilizce-unite-kelimeleri/)
- [EnglishCentral — 7th-grade units (2026)](https://www.englishcentral.com/blog/7-sinif-ingilizce-uniteleri-ve-konu-anlatimi/)
