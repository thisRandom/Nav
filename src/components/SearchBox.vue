<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { Search, ChevronDown } from 'lucide-vue-next';

const searchQuery = ref('');
const isFocused = ref(false);
const showMenu = ref(false);

const engines = [
  { name: 'Google', icon: 'logos:google-icon', url: 'https://google.com/search?q=', placeholder: 'Search with Google...' },
  { name: 'Bing', icon: 'logos:bing', url: 'https://www.bing.com/search?q=', placeholder: 'Search with Bing...' },
  { name: 'GitHub', icon: 'mdi:github', url: 'https://github.com/search?q=', placeholder: 'Search GitHub Repos...' },
  { name: 'Docker', icon: 'logos:docker-icon', url: 'https://hub.docker.com/search?q=', placeholder: 'Search Docker Hub...' },
  { name: 'NPM', icon: 'logos:npm-icon', url: 'https://www.npmjs.com/search?q=', placeholder: 'Search NPM...' },
  { name: 'Maven', icon: 'logos:java', url: 'https://pypi.org/search/?q=', placeholder: 'Search Maven...' }
];

const currentEngine = ref(engines[0]);

const selectEngine = (engine) => {
  currentEngine.value = engine;
  showMenu.value = false;
};

const onSearch = () => {
  if (searchQuery.value.trim()) {
    window.open(currentEngine.value.url + encodeURIComponent(searchQuery.value), '_blank');
  }
};

const closeMenu = (e) => {
  if (!e.target.closest('.engine-selector')) {
    showMenu.value = false;
  }
};

onMounted(() => window.addEventListener('click', closeMenu));
onUnmounted(() => window.removeEventListener('click', closeMenu));
</script>

<template>
  <div class="relative w-full max-w-2xl mx-auto transition-all duration-500 z-50">
    <div
        class="flex items-center p-1.5 rounded-2xl transition-all border border-white/30 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/70 dark:bg-zinc-900/50 backdrop-blur-[40px]"
        :class="isFocused ? 'ring-2 ring-blue-500/40 border-blue-500/60 scale-[1.01]' : ''"
    >

      <div class="relative engine-selector">
        <button
            @click.stop="showMenu = !showMenu"
            class="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Icon :icon="currentEngine.icon" class="w-5 h-5 transition-transform" />
          <ChevronDown
              class="w-3 h-3 text-zinc-400 transition-transform duration-300"
              :class="showMenu ? 'rotate-180' : ''"
          />
        </button>

        <Transition name="dropdown">
          <div
              v-if="showMenu"
              class="absolute top-full left-0 mt-3 w-48 p-2 z-[9999] rounded-2xl shadow-2xl border
                     bg-white dark:bg-zinc-800
                     border-zinc-200 dark:border-zinc-700"
          >
            <button
                v-for="engine in engines"
                :key="engine.name"
                @click="selectEngine(engine)"
                class="engine-item group w-full"
                :class="{ 'engine-item-active': currentEngine.name === engine.name }"
            >
              <Icon :icon="engine.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
              <span class="font-medium">{{ engine.name }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <input
          v-model="searchQuery"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.enter="onSearch"
          type="text"
          :placeholder="currentEngine.placeholder"
          class="flex-1 bg-transparent border-none outline-none px-4 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 font-medium text-lg"
      />

      <button
          @click="onSearch"
          class="group relative p-3 bg-zinc-900 dark:bg-white rounded-xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
      >
        <Search class="w-5 h-5 text-white dark:text-zinc-900 z-10 relative" />
        <div class="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.engine-item {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative overflow-hidden;
  @apply text-zinc-700 dark:text-zinc-200;
}

/* 悬停效果在实体色背景下会更清晰 */
.engine-item:hover {
  @apply bg-zinc-100 dark:bg-zinc-700/50 text-blue-600 dark:text-blue-400;
  transform: translateX(4px);
}

.engine-item-active::before {
  content: '';
  @apply absolute left-0 w-1 h-4 bg-blue-500 rounded-full;
}

.engine-selector {
  isolation: isolate;
}
</style>