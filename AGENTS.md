# AGENTS.md - AI Coding Agent Instructions

## Project Overview

**Lantech Nav** is a Vue 3 Chrome extension that replaces the browser new-tab page with a smart navigation dashboard. It features network-aware intranet detection, dynamic wallpapers, search suggestions, bookmarks, and service cards.

- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Language:** JavaScript (no TypeScript)
- **Platform:** Chrome Extension (Manifest V3)

---

## Build & Dev Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

**No lint, test, or typecheck commands exist.** If you add ESLint or Vitest, update this section. There are no tests in this project currently.

---

## Project Structure

```
src/
├── main.js                 # App entry point
├── App.vue                 # Root component
├── assets/
│   ├── index.css           # Tailwind imports + global CSS
│   └── default-bg.jpg      # Fallback wallpaper
├── components/             # All components (flat, no nesting)
│   ├── SearchBox.vue       # Multi-engine search with suggestions
│   ├── ServiceCard.vue     # Intranet service tile
│   ├── ServiceEditor.vue   # Modal form for add/edit service
│   ├── BookmarkManager.vue # Bookmark categories display
│   ├── NetworkMonitor.vue  # Real-time network speed
│   ├── StatusPanel.vue     # System status bar
│   ├── WeatherPanel.vue    # Weather display
│   └── ImmersionClock.vue  # Full-screen clock mode
├── composables/
│   ├── useNetwork.js       # Global intranet detection (singleton)
│   └── useServices.js      # Service CRUD + chrome.storage persistence
├── data/
│   ├── services.js         # Intranet service links array
│   └── bookmarks.js        # Bookmark category definitions
public/
├── manifest.json           # Chrome extension manifest (MV3)
├── icon.png                # Extension icon
└── wallpapers/             # Optional local wallpapers
```

---

## Code Style Guidelines

### Imports

- Vue APIs: `import { ref, computed, watch, onMounted, onUnmounted } from 'vue'`
- Vue imports use curly braces, no spaces inside: `{ref, computed}`
- Icons: use `lucide-vue-next` for direct icon components, `@iconify/vue` for icon strings
- Data files: import from `./data/services` or `./data/bookmarks`
- Composables: import from `./composables/useNetwork`
- Path alias: `@/*` maps to `./src/*` (configured in `jsconfig.json`)

### Vue Components

- Always use `<script setup>` (Composition API, never Options API)
- Single-file components: `<script setup>` → `<template>` → `<style scoped>`
- Reactive state: `const foo = ref('')` (lowercase camelCase)
- Computed: `const isUrlMode = computed(() => ...)`
- Watch: `watch(searchQuery, (newVal) => { ... })`
- Lifecycle: `onMounted`, `onUnmounted` for setup/cleanup
- Provide/inject for cross-component state: `provide('isInternal', isInternal)`

### Naming Conventions

- **Components:** PascalCase filenames (`SearchBox.vue`, `ServiceCard.vue`)
- **Variables/functions:** camelCase (`isLoadingWallpaper`, `toggleBg`, `checkNetwork`)
- **Constants:** camelCase for module-level (`const LOCAL_API_BASE = '...'`)
- **Event handlers:** `handleKeydown`, `handleGlobalKeyDown`, `onSearch`
- **Refs for DOM elements:** `const searchInput = ref(null)` matching the template `ref="searchInput"`

### Styling

- Use Tailwind utility classes directly in templates
- `@apply` only in `<style scoped>` for repeated patterns (e.g., `.engine-item`)
- CSS variables for theming: `--dot-color`, scoped to `:root` and `.dark`
- Dark mode: use `dark:` Tailwind modifier in templates
- Scoped styles with `<style scoped>` on every component
- Transition classes use descriptive names: `fade-enter-active`, `stagger-enter-from`

### Error Handling

- Async operations: use `try/catch/finally` blocks
- Network probes: use `AbortController` with `setTimeout` for timeout (300-1000ms)
- Fallback strategy: if intranet API fails, fall back to public API
- Console errors: `console.error("描述:", e)` — Chinese descriptions are acceptable
- Silent failures for non-critical features (suggestions, network detection)

### General Patterns

- Debounce user input with manual `setTimeout/clearTimeout` (no external libs)
- Image preloading via hidden `new Image()` before setting as background
- Keyboard shortcuts: `Alt+H` for immersive mode, `/` to focus search
- Chrome APIs guarded: `if (window.chrome && chrome.downloads) { ... }`
- CSS animations prefer `cubic-bezier` easing over simple `ease`

---

## File Conventions

- No TypeScript — all `.js` and `.vue` files
- Comments in Chinese are fine; prefer Chinese for business logic explanations
- Keep components under ~400 lines; split if logic becomes complex
- Data arrays go in `src/data/`, not inline in components
- Export named constants: `export const defaultServices = [...]`

---

## Chrome Extension Notes

- Manifest V3 in `public/manifest.json`
- Content Security Policy restricts inline scripts — no `eval()` or dynamic code
- `host_permissions` required for external API calls (e.g., Baidu suggestions)
- Build output in `dist/` — can be loaded as unpacked extension or bundled to `.crx`
