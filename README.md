# Flip 7 Scoreboard

An **unofficial** web-based scoreboard application for the **Flip 7** card game, inspired by the [official Score Tracker App](https://flip7-46611.web.app/).

> 非官方的 Flip 7 卡牌遊戲計分板，參考[官方計分 APP](https://flip7-46611.web.app/) 設計。

*This project is not affiliated with or endorsed by The Op Games.*

## Features

- **Card-based scoring** — select number cards (0–12), modifier cards (+2 to +10, ×2), with automatic Flip 7 bonus detection
- **Multi-player support** — add up to 8 players, track scores across unlimited rounds
- **Real-time leaderboard** — players sorted by total score
- **Undo** — revert the last scoring action
- **Winner celebration** — confetti animation when a player reaches 200 points
- **i18n** — Traditional Chinese (繁體中文) and English, auto-detected from browser locale
- **PWA** — installable on mobile home screens, works offline
- **Responsive design** — optimized for mobile, tablet, and desktop

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) — state management with localStorage persistence
- [vue-i18n](https://vue-i18n.intlify.dev/) — internationalization
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — winner celebration effects
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — PWA support

## Getting Started

### Prerequisites

- Node.js >= 18 (recommended: 22)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Game Rules Reference

Based on the official Flip 7 rules:
- Each round, players flip cards and try to get as close to 7 cards as possible without going over
- Exactly 7 cards grants a **Flip 7 bonus** (+15 points)
- Flipping an 8th card is a **Bust** (0 points for the round)
- First player to reach **200 points** wins

## Support

If you find this project useful, consider buying me a coffee!

<a href="https://www.buymeacoffee.com/tomatosoup" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" /></a>

## License

MIT
