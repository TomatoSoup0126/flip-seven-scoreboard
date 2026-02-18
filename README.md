# Flip 7 Scoreboard

An **unofficial** web-based scoreboard application for the **Flip 7** card game, inspired by the [official Score Tracker App](https://flip7-46611.web.app/).

> 非官方的 Flip 7 卡牌遊戲計分板，參考[官方計分 APP](https://flip7-46611.web.app/) 設計。

*This project is not affiliated with or endorsed by The Op Games.*

## Features

- **Dual rule modes** — switch between **Classic** and **VENGEANCE** in Menu  
  (switching mode resets current game scores/rounds, while keeping player setup)
- **Mode-aware card scoring**
  - Classic: number cards `0–12`, modifiers `+2 ~ +10`, `×2`
  - VENGEANCE: number cards `0–13`, modifiers `-2 ~ -10`, `÷2`, with Zero and Lucky 13 support
  - Automatic Flip 7 bonus detection (`+15`)
- **Multi-player support** — add up to 8 players, track scores across unlimited rounds
- **Real-time leaderboard** — players sorted by total score
- **Undo** — revert the last scoring action
- **Winner celebration** — confetti animation when a player reaches 200 points
- **Guided tour mode** — built-in website tour with spotlight/highlight effect for onboarding
- **i18n** — Traditional Chinese (繁體中文) and English, auto-detected from browser locale
- **PWA** — installable on mobile home screens, works offline
- **Responsive design** — optimized for portrait/landscape mobile, tablet, 16:9 desktop, and ultrawide screens

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) — state management with localStorage persistence
- [vue-i18n](https://vue-i18n.intlify.dev/) — internationalization
- [@globalhive/vuejs-tour](https://www.npmjs.com/package/@globalhive/vuejs-tour) — guided onboarding tour
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

This app references the official Flip 7 scoring concepts and currently supports two score modes:

- **Classic mode**
  - Number cards `0–12`
  - Modifiers: `+2, +4, +6, +8, +10`, `×2`
  - Flip 7 bonus: `+15`
- **VENGEANCE mode**
  - Number cards `0–13`
  - Modifiers: `-2, -4, -6, -8, -10`, `÷2` (round down)
  - Zero card effect and Lucky 13 extra-card scoring support
  - Flip 7 bonus: `+15`

Official rules link: <https://theop.games/pages/flip-7>

## Support

If you find this project useful, consider buying me a coffee!

<a href="https://www.buymeacoffee.com/tomatosoup" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" /></a>

## License

MIT
