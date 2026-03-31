<script setup>
import {ref, onMounted, onUnmounted, computed, watch} from 'vue';
import {isInternal} from '../composables/useNetwork';
import {Icon} from '@iconify/vue';
import {Search, ChevronDown} from 'lucide-vue-next';

const searchQuery = ref('');
const isFocused = ref(false);
const showMenu = ref(false);

const searchInput = ref(null);

const engines = [
  {
    name: 'Google',
    icon: 'logos:google-icon',
    url: 'https://google.com/search?q=',
    placeholder: 'Search with Google...'
  },
  {name: 'Bing', icon: 'logos:bing', url: 'https://www.bing.com/search?q=', placeholder: 'Search with Bing...'},
  {name: 'GitHub', icon: 'mdi:github', url: 'https://github.com/search?q=', placeholder: 'Search GitHub Repos...'},
  {
    name: 'Docker',
    icon: 'logos:docker-icon',
    url: 'https://hub.docker.com/search?q=',
    placeholder: 'Search Docker Hub...'
  },
  {name: 'NPM', icon: 'logos:npm-icon', url: 'https://www.npmjs.com/search?q=', placeholder: 'Search NPM...'},
  {name: 'Maven', icon: 'logos:java', url: 'https://pypi.org/search/?q=', placeholder: 'Search Maven...'}
];

const currentEngine = ref(engines[1]); // 默认 Bing
const suggestions = ref([]);
const selectedIndex = ref(-1);

// 1. 防抖函数
let debounceTimer;
const fetchSuggestions = (query) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    // 二次保险：如果在等待防抖的 200ms 内，用户已经输入成了 URL，则直接退出
    if (isUrlMode.value) return;

    try {
      const res = await fetch(`https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&sugmode=2`);
      const buffer = await res.arrayBuffer();
      const decoder = new TextDecoder('gbk');
      const text = decoder.decode(buffer);

      // 三次保险：解析前再次确认模式
      if (isUrlMode.value) {
        suggestions.value = [];
        return;
      }

      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        suggestions.value = JSON.parse(text.substring(start, end + 1)).slice(0, 8);
      }
    } catch (e) {
      console.error("获取建议失败:", e);
    }
  }, 200);
};

// 监听输入变化
watch(searchQuery, (newVal) => {
  // 核心逻辑：只有当【不是】URL模式 且 【有内容】时才发起请求
  if (!isUrlMode.value && newVal.trim()) {
    fetchSuggestions(newVal);
  } else {
    // 一旦进入 URL 模式或输入清空，立即斩断所有建议
    suggestions.value = [];
    selectedIndex.value = -1;
    // 同时清除可能还在路上的异步请求计时器
    clearTimeout(debounceTimer);
  }
});


// 处理建议词列表的键盘导航
const handleKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    if (suggestions.value.length === 0) return;
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % suggestions.value.length;
  } else if (e.key === 'ArrowUp') {
    if (suggestions.value.length === 0) return;
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
  } else if (e.key === 'Enter') {
    // 阻止默认行为，防止某些浏览器触发两次或表单提交
    e.preventDefault();

    if (selectedIndex.value !== -1 && suggestions.value.length > 0) {
      // 逻辑 A: 如果选中了建议词，搜索建议词
      searchQuery.value = suggestions.value[selectedIndex.value];
    }
    // 逻辑 B: 如果没选中建议词（selectedIndex === -1），直接执行 onSearch 搜索输入框内容

    onSearch();
    suggestions.value = [];
    selectedIndex.value = -1;
  } else if (e.key === 'Escape') {
    suggestions.value = [];
    selectedIndex.value = -1;
  }
};


const selectEngine = (engine) => {
  currentEngine.value = engine;
  showMenu.value = false;
};

const handleGlobalKeyDown = (e) => {
  // 如果当前没在输入，且按下的是 '/' 键
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

const onSearch = () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  // 匹配域名或 IP（包含带端口的情况）
  const urlPattern = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$|^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/.*)?$/;

  if (urlPattern.test(query)) {
    // 逻辑：如果用户输入已经带了 http，就直接用；
    // 如果没带，直接传给 window.open，不加 //
    // 这样浏览器会根据当前页面协议或 HSTS 策略自行决定
    const targetUrl = query.startsWith('http') ? query : 'http://' + query;

    // 注意：对于内网 IP (192.168.x.x)，绝大多数情况是 http。
    // 如果你希望完全交给浏览器（不加任何前缀），可以直接 window.open(query, '_blank')
    // 但这可能导致浏览器将其误认为相对路径，所以建议对于不带协议的输入，默认补 http:// 是最稳妥的。
    window.open(targetUrl, '_blank');
  } else {
    // 正常搜索逻辑
    window.open(currentEngine.value.url + encodeURIComponent(query), '_blank');
  }
};

const closeMenu = (e) => {
  if (!e.target.closest('.engine-selector')) {
    showMenu.value = false;
  }
};

// 根据内网状态自动选择搜索引擎
watch(isInternal, (internal) => {
  currentEngine.value = internal ? engines[0] : engines[1]; // 内网可走代理 → Google，否则 → Bing
}, { immediate: true });

const isUrlMode = computed(() => {
  const urlPattern = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$|^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/.*)?$/;
  return urlPattern.test(searchQuery.value.trim());
});

onMounted(() => {
  window.addEventListener('click', closeMenu);
  setTimeout(() => {
    if (searchInput.value) {
      searchInput.value.focus();
      // 额外保险：如果 focus 失败，尝试再次触发
      if (document.activeElement !== searchInput.value) {
        searchInput.value.focus();
      }
    }
  }, 500);
  window.addEventListener('keydown', handleGlobalKeyDown);
});
onUnmounted(() => {
  window.removeEventListener('click', closeMenu)
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<template>
  <Transition name="search-appear" appear>
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
            <Transition name="icon-fade" mode="out-in">
              <Icon
                  :key="isUrlMode ? 'world' : currentEngine.name"
                  :icon="isUrlMode ? 'lucide:globe' : currentEngine.icon"
                  class="w-5 h-5 transition-colors"
                  :class="isUrlMode ? 'text-blue-500' : ''"
              />
            </Transition>
            <ChevronDown class="w-3 h-3 text-zinc-400"/>
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
                <Icon :icon="engine.icon" class="w-5 h-5 transition-transform group-hover:scale-110"/>
                <span class="font-medium">{{ engine.name }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <input
            ref="searchInput"
            v-model="searchQuery"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @keydown="handleKeydown"
            type="text"
            :placeholder="currentEngine.placeholder"
            class="flex-1 bg-transparent border-none outline-none px-4 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 font-medium text-lg"
        />

        <button
            @click="onSearch"
            class="group relative p-3 bg-zinc-900 dark:bg-white rounded-xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
        >
          <Search class="w-5 h-5 text-white dark:text-zinc-900 z-10 relative"/>
          <div class="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
        <Transition name="dropdown">
          <div
              v-if="suggestions.length > 0 && isFocused"
              class="absolute top-full left-0 right-0 mt-3 p-2 z-[9999] rounded-2xl shadow-2xl border
                     bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
          >
            <button
                v-for="(item, index) in suggestions"
                :key="item"
                @click="searchQuery = item; onSearch()"
                class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all text-left"
                :class="selectedIndex === index ? 'bg-blue-500/10 text-blue-600' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
            >
              <Search class="w-4 h-4 opacity-40"/>
              <span class="font-medium truncate">{{ item }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "tailwindcss";

/* --- 搜索框整体入场动画 --- */
.search-appear-enter-active {
  /* 使用强力的弹性曲线，表现出“从屏幕深处跳出来”的感觉 */
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.search-appear-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  filter: blur(10px); /* 配合背景逻辑，这里保留一点点初始模糊 */
}

/* 动画结束时确保滤镜完全消失，防止文字发虚 */
.search-appear-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

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

/* style 部分 */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(1.2);
}
</style>