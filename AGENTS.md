# SFL-Lab – AI Agent Guidelines

Dieses Dokument definiert verbindliche Regeln für alle AI-Agenten (Claude, GPT, Copilot etc.), die an diesem Projekt arbeiten.

---

## Projektübersicht

**SFL-Lab** ist ein Fork von [Sunflower Land](https://github.com/sunflower-land/sunflower-land).

Das Hauptfeature ist ein **Experiment-Modus**: Nutzer können NFTs und Skills simulieren, die sie nicht besitzen, und sehen live wie sich Produktion, Kosten und Gewinn auf ihrer echten Farm verändern.

- Fork-Repo: https://github.com/NiklasWaltl/SFL-Lab
- Stack: React, TypeScript, rsbuild + Vite, Tailwind CSS, Dark Mode
- Eigener Code lebt ausschließlich in: `src/lab/`
- Lokal verifiziert: `yarn dev` läuft auf http://localhost:3000/
- Aktives Testnet: `VITE_NETWORK=mumbai` (Fallback: `amoy` wenn Wallet-Probleme)

---

## Verzeichnisstruktur

```
SFL-Lab/
├── src/
│   ├── game/          ❌ SFL-Originalcode – NIEMALS ändern
│   ├── features/      ❌ SFL-Originalcode – NIEMALS ändern
│   ├── components/    ❌ SFL-Originalcode – NIEMALS ändern
│   ├── lib/            ❌ SFL-Originalcode – NIEMALS ändern
│   ├── assets/        ❌ SFL-Originalcode – NIEMALS ändern
│   └── lab/            ✅ EIGENER CODE – nur hier entwickeln
│       ├── components/  UI-Komponenten für SFL-Lab
│       ├── config/      NFT/Skill-Daten (boosts.ts, resources.ts)
│       ├── hooks/       Custom React Hooks
│       ├── pages/       Seiten: Ist-Zustand, Experiment-Modus
│       ├── types/       TypeScript-Typen (index.ts)
│       └── utils/       Berechnungslogik (calculations.ts)
├── .env               Lokal, nicht in Git
├── .env.portal        Vorlage für .env
├── AGENTS.md          Dieses Dokument
└── .cursor/rules/     Cursor-Regeln (automatisch geladen)
```

---

## Absolute Regeln

### ❌ Verbotene Bereiche – NIEMALS anfassen

| Pfad | Grund |
|---|---|
| `src/game/**` | Originalcode Sunflower Land |
| `src/features/**` | Originalcode Sunflower Land |
| `src/components/**` | Originalcode Sunflower Land |
| `src/lib/**` | Originalcode Sunflower Land |
| `src/assets/**` | Originalcode Sunflower Land |
| `index.html` | Nur wenn zwingend nötig + Rückfrage |
| `rsbuild.config.ts` | Nur wenn zwingend nötig + Rückfrage |
| `vite.config.ts` | Nur wenn zwingend nötig + Rückfrage |
| `tailwind.config.js` | Nur wenn zwingend nötig + Rückfrage |
| `tsconfig.json` | Nur wenn zwingend nötig + Rückfrage |

### ✅ Erlaubter Bereich

> Neuer Code kommt **ausnahmslos** in `src/lab/`.

---

## Import-Regeln

- Kein Import aus `src/game`, `src/features`, `src/components`, `src/lib`
- SFL-Typen bei Bedarf in `src/lab/types/` spiegeln – nie direkt importieren
- Neue Env-Variablen beginnen mit `VITE_LAB_`
- Externe Libraries nur über `package.json`, nie per CDN

---

## Architekturprinzipien

- Berechnungslogik lebt in `src/lab/utils/` – nie in Komponenten
- NFT/Skill-Effekte sind in `src/lab/config/` konfigurierbar – nie hardcoded
- Einfach und erweiterbar vor komplex und clever
- Modularer Aufbau: erst Holz & Stein, dann Iron, Gold, Crops

---

## Env

| Variable | Wert | Notiz |
|---|---|---|
| `VITE_NETWORK` | `mumbai` | Fallback: `amoy` |
| `VITE_API_URL` | `https://api-dev.sunflower-land.com` | |
| `VITE_ROOM_URL` | `wss://mmo-dev.sunflower-land.com` | |
| `VITE_PORTAL_APP` | `sfl-lab` | |
| `VITE_PORTAL_GAME_URL` | `https://sunflower-land.com/testnet` | |
| `VITE_ANIMATION_URL` | `https://animations-dev.sunflower-land.com/` | |

---

## Bei Unsicherheit

1. Nicht ändern.
2. Rückfrage stellen.
3. Erst nach expliziter Bestätigung handeln.
