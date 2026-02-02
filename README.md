<!--
   feedstack
   README — polished for open source
-->

# FeedStack

Lightweight, opinionated RSS / article feed reader built with Expo + React Native.

[![Expo](https://img.shields.io/badge/Expo-%E2%9C%94-brightgreen)](#)
[![Platform](https://img.shields.io/badge/Platform-Android%20|%20iOS%20|%20Web-blue)](#)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#license)

Table of Contents
- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Install](#install)
   - [Run](#run)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

## About

feedstack is a small, open-source feed reader built with Expo and the new file-based router. It focuses on a clean reading experience, offline caching, and simple bookmark management.

This repository contains the app UI, minimal client-side caching, and integration points for notifications and persistence.

## Features

- Browse curated articles and feeds
- Save/bookmark articles locally
- Offline reading via a simple cache layer
- Lightweight settings and theming
- Web + mobile (Android/iOS) via Expo

## Screenshots

You can find app assets in the `assets/images` folder. Use these when adding screenshots to the store or README.

![App screenshot](assets/images/icon.png)

## Tech stack

- Expo (managed workflow)
- React Native + React 19
- TypeScript
- React Navigation + expo-router
- AsyncStorage for simple local persistence
- Axios for network requests

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Optionally: Android Studio (emulator) or Xcode (iOS simulator)

### Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/0xZayyad/feedstack.git
cd feedstack
npm install
```

### Run

Start the Expo dev server and open on the platform of your choice:

```bash
npm start      # opens Expo dev tools
npm run android
npm run ios
npm run web
```

Useful maintenance commands:

```bash
npm run reset-project   # resets starter template (provided by create-expo-app)
npm run lint            # run linter
```

Notes
- The project uses `expo-router` and the file-based `app/` directory for routing. Edit UI inside `app/` and `components/`.

## Project structure

Key folders/files:

- `app/` — file-based routes and screens
- `components/` — reusable UI components
- `assets/` — images, fonts and other static assets
- `constants/`, `hooks/`, `utils/`, `misc/` — helpers and app-specific utilities
- `package.json` — scripts and dependencies

## Scripts

The most important npm scripts are already defined in `package.json`:

- `npm start` — start Expo dev server
- `npm run android` — open on Android device/emulator
- `npm run ios` — open on iOS simulator
- `npm run web` — run as web app
- `npm run reset-project` — reset starter content (keeps example app in `app-example`)
- `npm run lint` — run ESLint

## Development notes

- Styling and theming live in `components/Themed*` and `hooks/useThemeColor.ts`.
- Local caching lives in `utils/cache.ts` and persistent storage is in `utils/storage.ts`.
- If you integrate an external RSS or API, keep secrets out of the repo and provide them as environment variables or a secrets manager.

## Contributing

Contributions are welcome! A small suggested workflow:

1. Fork the repository.
2. Create a topic branch: `git checkout -b feat/your-feature`.
3. Make changes and add tests where appropriate.
4. Open a pull request describing the change.

Please follow the existing code style. Run `npm run lint` and check the app on at least one platform before opening a PR.

If you'd like to propose larger changes (architecture, feature additions), open an issue first so we can discuss scope.

## Roadmap

- Improve feed discovery and integration UI
- Add user sync (optional) for bookmarks
- Add automated tests and CI

If you want to help, check the `issues` tab and pick a tagged `good first issue`.

## License

This project is open source and available under the MIT License — see the `LICENSE` file for details.

## Contact

Created and maintained by 0xZayyad — feel free to open issues or PRs.

