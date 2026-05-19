# SFL-Lab – AI Agent Guidelines

Dieses Dokument definiert verbindliche Regeln für alle AI-Agenten (Claude, GPT, Copilot etc.), die an diesem Projekt arbeiten.

---

## Projektübersicht

**SFL-Lab** ist ein Fork von [Sunflower Land](https://github.com/sunflower-land/sunflower-land).

Das Hauptfeature ist ein **Experiment-Modus**: Nutzer können NFTs und Skills simulieren, die sie nicht besitzen, und sehen live wie sich Produktion, Kosten und Gewinn auf ihrer echten Farm verändern.

- Fork-Repo: https://github.com/NiklasWaltl/SFL-Lab
- Stack: React, TypeScript, rsbuild, Tailwind CSS, Dark Mode
- Eigener Code lebt ausschließlich in: `src/lab/`

---

## Absolute Regeln

### ❌ Verbotene Bereiche – NIEMALS anfassen

| Pfad | Grund |
|---|---|
| `src/game/` | Originalcode Sunflower Land |
| `src/features/` | Originalcode Sunflower Land |
| `src/components/` | Originalcode Sunflower Land |
| `src/lib/` | Originalcode Sunflower Land |
| `src/assets/` | Originalcode Sunflower Land |
| `index.html` | Nur anfassen wenn zwingend nötig für Setup |
| `rsbuild.config.ts` | Nur anfassen wenn zwingend nötig für Setup |
| `vite.config.ts` | Nur anfassen wenn zwingend nötig für Setup |
| `tailwind.config.js` | Nur anfassen wenn zwingend nötig für Setup |
| `tsconfig.json` | Nur anfassen wenn zwingend nötig für Setup |

> Kein SFL-Originalcode wird verändert, verschoben, umbenannt oder gelöscht. Keine Ausnahmen.

---

### ✅ Erlaubter Bereich – Ausschließlich hier entwickeln

```
src/lab/
├── components/     # UI-Komponenten für SFL-Lab
├── config/         # NFT- und Skill-Datendefinitionen (JSON/TS)
├── hooks/          # Custom React Hooks
├── pages/          # Seiten/Views (Ist-Zustand, Experiment-Modus)
├── types/          # TypeScript-Typen
└── utils/          # Berechnungslogik (reine Funktionen, kein UI)
```

> Neuer Code kommt **ausnahmslos** in `src/lab/`. Keine Datei außerhalb dieses Ordners wird neu erstellt, außer Konfigurationsdateien im Root die explizit besprochen wurden.

---

## Import-Regeln

- Imports aus SFL-Originalcode (`src/game`, `src/features`, etc.) sind **verboten**, außer sie sind explizit als öffentliche API dokumentiert.
- Wenn SFL-Typen benötigt werden, werden sie in `src/lab/types/` gespiegelt – kein direkter Import.
- Externe Libraries werden nur über `package.json` hinzugefügt, nie per CDN oder direktem Script-Tag.

---

## Architekturprinzipien

- **Berechnungslogik ist von UI getrennt.** Alle Formeln leben in `src/lab/utils/`, nicht in Komponenten.
- **Daten sind konfigurierbar.** NFTs, Skills und deren Effekte leben in `src/lab/config/` als TypeScript-Objekte, nicht hardcoded in Komponenten.
- **Kein Over-Engineering.** Lieber einfach und erweiterbar als komplex und starr.
- **Modular aufbauen.** Erst Holz & Stein, dann Iron, Gold, Crops etc. – jede Ressource ist ein eigenes Modul.

---

## Env-Regeln

- Die `.env` Datei basiert auf `.env.portal` aus dem Repo-Root.
- `.env` wird **nicht** in Git committed (steht in `.gitignore`).
- Neue Env-Variablen für SFL-Lab beginnen mit `VITE_LAB_` um sie klar von SFL-Originalvariablen zu trennen.

---

## Bei Unsicherheit

Wenn unklar ist ob eine Änderung SFL-Originalcode betrifft:
1. Nicht ändern.
2. Rückfrage stellen.
3. Erst nach expliziter Bestätigung handeln.
