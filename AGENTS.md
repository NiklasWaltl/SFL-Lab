# SFL-Lab – AI Agent Guidelines

Dieses Dokument definiert verbindliche Regeln für alle AI-Agenten (Claude, GPT, Copilot etc.), die an diesem Projekt arbeiten.

---

## Projektübersicht

**SFL-Lab** ist ein Fork von [Sunflower Land](https://github.com/sunflower-land/sunflower-land).

Das Hauptfeature ist ein **Experiment-Modus**: Nutzer können NFTs und Skills simulieren, die sie nicht besitzen, und sehen live wie sich Produktion, Kosten und Gewinn auf ihrer echten Farm verändern.

- Fork-Repo: https://github.com/NiklasWaltl/SFL-Lab
- Stack: React, TypeScript, rsbuild + Vite, Tailwind CSS, Dark Mode
- Eigener Code lebt ausschließlich in: `src/lab/`
- Dev-Einstieg: `vite src/lab/lab.html --port 3001`
- Lokal verifiziert: `yarn dev` läuft auf http://localhost:3000/ (SFL-Original)
- Aktives Testnet: `VITE_NETWORK=mumbai` (Fallback: `amoy` wenn Wallet-Probleme)

---

## Aktueller Implementierungsstand

### ✅ Fertig (V1)

| Bereich     | Dateien                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typen       | `types/index.ts`, `types/player.ts`                                                                                                                                                  |
| Config      | `config/resources.ts`, `config/boosts.ts`                                                                                                                                            |
| Utils       | `utils/calculations.ts`, `utils/format.ts`, `utils/normalizePlayer.ts`, `utils/bumpkinLevel.ts`, `utils/overviewKpis.ts`                                                             |
| Services    | `services/playerApi.ts`                                                                                                                                                              |
| Hooks       | `hooks/useLabState.ts`, `hooks/usePlayerData.ts`                                                                                                                                     |
| Komponenten | `components/GlobalParamsPanel.tsx`, `components/ResourceCard.tsx`, `components/BoostPanel.tsx`, `components/LabTabNav.tsx`, `components/TabPlaceholder.tsx`, `components/overview/*` |
| Seiten      | `pages/LabPage.tsx`, `pages/OverviewTab.tsx`                                                                                                                                         |
| Entry       | `index.tsx`, `styles.css`, `lab.html`                                                                                                                                                |

### 🔲 Noch nicht implementiert (Platzhalter)

| Tab           | Status      |
| ------------- | ----------- |
| Kategorien    | Platzhalter |
| NFT-Simulator | Platzhalter |
| Portfolio     | Platzhalter |
| Szenarien     | Platzhalter |

---

## Verzeichnisstruktur

```
SFL-Lab/
├── src/
│   ├── game/              ❌ SFL-Originalcode – NIEMALS ändern
│   ├── features/          ❌ SFL-Originalcode – NIEMALS ändern
│   ├── components/        ❌ SFL-Originalcode – NIEMALS ändern
│   ├── lib/               ❌ SFL-Originalcode – NIEMALS ändern
│   ├── assets/            ❌ SFL-Originalcode – NIEMALS ändern
│   └── lab/               ✅ EIGENER CODE – nur hier entwickeln
│       ├── components/
│       │   └── overview/  KPI-Karten, Kategorie-Kacheln
│       ├── config/        boosts.ts, resources.ts
│       ├── hooks/         useLabState.ts, usePlayerData.ts
│       ├── pages/         LabPage.tsx, OverviewTab.tsx
│       ├── services/      playerApi.ts
│       ├── types/         index.ts, player.ts
│       ├── utils/         calculations.ts, format.ts, normalizePlayer.ts,
│       │                  bumpkinLevel.ts, overviewKpis.ts
│       ├── index.tsx
│       ├── styles.css
│       └── lab.html       ← Dev-Einstieg
├── .env                   Lokal, nicht in Git
├── .env.portal            Vorlage für .env
├── AGENTS.md              Dieses Dokument
└── .cursor/rules/         Cursor-Regeln (automatisch geladen)
```

---

## Absolute Regeln

### ❌ Verbotene Bereiche – NIEMALS anfassen

| Pfad                 | Grund                               |
| -------------------- | ----------------------------------- |
| `src/game/**`        | Originalcode Sunflower Land         |
| `src/features/**`    | Originalcode Sunflower Land         |
| `src/components/**`  | Originalcode Sunflower Land         |
| `src/lib/**`         | Originalcode Sunflower Land         |
| `src/assets/**`      | Originalcode Sunflower Land         |
| `index.html`         | Nur wenn zwingend nötig + Rückfrage |
| `rsbuild.config.ts`  | Nur wenn zwingend nötig + Rückfrage |
| `vite.config.ts`     | Nur wenn zwingend nötig + Rückfrage |
| `tailwind.config.js` | Nur wenn zwingend nötig + Rückfrage |
| `tsconfig.json`      | Nur wenn zwingend nötig + Rückfrage |

### ✅ Erlaubter Bereich

> Neuer Code kommt **ausnahmslos** in `src/lab/`.

---

## ESLint-Regeln (bekannt, aktiv im Repo)

Diese Regeln sind im SFL-Repo aktiv und müssen in allen Lab-Dateien eingehalten werden:

| Regel                      | Bedeutung                                              | Fix                          |
| -------------------------- | ------------------------------------------------------ | ---------------------------- |
| `react/react-in-jsx-scope` | Jede `.tsx`-Datei braucht `import React from "react";` | Import oben hinzufügen       |
| `react/jsx-no-literals`    | Kein direkter Text in JSX                              | Strings in `{"..."}` wrappen |

**Jede neue Komponente muss diese Regeln einhalten, bevor sie committet wird.**

Verifikation vor Commit:

```bash
npx eslint src/lab/ --ext .ts,.tsx
```

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
- `useLabState` ist Single Source of Truth
- Komponenten sind reine Darstellung – kein State, keine Berechnungen

---

## Datenpipeline

| Schritt | Datei                      | Beschreibung                                  |
| ------- | -------------------------- | --------------------------------------------- |
| 1       | `services/playerApi.ts`    | JWT aus URL lesen, API-Call oder Mock         |
| 2       | `hooks/usePlayerData.ts`   | Loading/Error-State, gibt `PlayerData` zurück |
| 3       | `utils/normalizePlayer.ts` | `PlayerData` → `NormalizedFarm`               |
| 4       | `hooks/useLabState.ts`     | Berechnungen auf Basis Farm + Boosts          |
| 5       | `pages/OverviewTab.tsx`    | Darstellung                                   |

### API-Verhalten

- Ohne JWT: Mock-Farm (`farmId: 7762677082636687`), gelbes Banner
- Mit JWT: `GET {VITE_API_URL}/portal/{VITE_PORTAL_APP}/player`
- API-Fehler: rotes Banner, kein stilles Fallback auf Mock

---

## Env

| Variable               | Wert                                         | Notiz            |
| ---------------------- | -------------------------------------------- | ---------------- |
| `VITE_NETWORK`         | `mumbai`                                     | Fallback: `amoy` |
| `VITE_API_URL`         | `https://api-dev.sunflower-land.com`         |                  |
| `VITE_ROOM_URL`        | `wss://mmo-dev.sunflower-land.com`           |                  |
| `VITE_PORTAL_APP`      | `sfl-lab`                                    |                  |
| `VITE_PORTAL_GAME_URL` | `https://sunflower-land.com/testnet`         |                  |
| `VITE_ANIMATION_URL`   | `https://animations-dev.sunflower-land.com/` |                  |

---

## Bekannte Grenzen (V1)

- Boosts in KPIs zählen Config-`owned`, nicht API-Collectibles
- Bumpkin-Level aus gespiegelter XP-Tabelle in `bumpkinLevel.ts` (bei SFL-Updates nachziehen)
- Experiment-Toggles erscheinen erst wenn `owned: false` Einträge in `boosts.ts` stehen
- Tabs Kategorien / NFT-Simulator / Portfolio / Szenarien sind Platzhalter

---

## Bei Unsicherheit

1. Nicht ändern.
2. Rückfrage stellen.
3. Erst nach expliziter Bestätigung handeln.
