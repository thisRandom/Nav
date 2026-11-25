# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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
- `src/composables/useNetwork.js` — detects internal network via probe to `10.1.1.1`

### Key Composables
- `useServices()` — manages service cards: CRUD operations, edit mode toggle, persistence
- `useNetwork()` — sets `isInternal` ref based on network probe result

### Components
- `ServiceCard` — individual service tile, supports edit/delete in edit mode
- `ServiceEditor` — modal form for adding/editing services
- `BookmarkManager` — categorized bookmark grid
- `StatusPanel`, `NetworkMonitor`, `SearchBox` — header and utility components

### Persistence
Services are persisted via Chrome's `chrome.storage.local` with the key `service_customifications`. The format stores `added`, `edited`, and `deleted` arrays as increments over defaults.

### Wallpaper
- Fetches wallpapers from the official Bing API `cn.bing.com/HPImageArchive.aspx` (one request returns the latest 8 daily wallpapers; the client picks one at random) — see `fetchBingWallpaper` in `src/App.vue`
- Dev mode proxies `/bing` → `cn.bing.com` to avoid CORS; the extension build relies on the `cn.bing.com` entry in `host_permissions`
- Falls back to `public/wallpapers/BingWallpaper-1784997955395.jpg` (`DEFAULT_BG`) when the request fails

## Tech Stack

Vue 3 (Composition API) + Vite, Tailwind CSS v4, Iconify (`@iconify/vue`), lucide-vue-next, axios
