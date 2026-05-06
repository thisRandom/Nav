# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 navigation homepage (nas.nav) with dynamic Bing wallpapers, service shortcuts, and bookmark management. Designed for Chrome/Chromium browser use with local network detection.

## Commands

```sh
npm install      # Install dependencies
npm run dev      # Start dev server with hot reload
npm run build     # Build for production
npm run preview  # Preview production build
```

## Architecture

### Data Flow
- `src/data/services.js` and `src/data/bookmarks.js` — default service/bookmark definitions
- `src/composables/useServices.js` — service state management, persists to `chrome.storage.local`
- `src/composables/useNetwork.js` — detects internal network via probe to `192.168.100.1:8897`

### Key Composables
- `useServices()` — manages service cards: CRUD operations, edit mode toggle, persistence
- `useNetwork()` — sets `isInternal` ref based on network probe result

### Components
- `ServiceCard` — individual service tile, supports edit/delete in edit mode
- `ServiceEditor` — modal form for adding/editing services
- `BookmarkManager` — categorized bookmark grid
- `ImmersionClock` — fullscreen clock overlay (toggled with Alt+H)
- `StatusPanel`, `NetworkMonitor`, `SearchBox` — header and utility components

### Persistence
Services are persisted via Chrome's `chrome.storage.local` with the key `service_customifications`. The format stores `added`, `edited`, and `deleted` arrays as increments over defaults.

### Wallpaper
- Internal network: fetches from `http://192.168.100.1:5000/api/random-wallpaper`
- External: falls back to `https://bing.img.run/rand.php`

## Tech Stack

Vue 3 (Composition API) + Vite, Tailwind CSS v4, Iconify (`@iconify/vue`), lucide-vue-next, axios
