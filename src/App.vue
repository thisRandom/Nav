<script setup>
import {ref, onMounted, provide} from 'vue';
import {isInternal, detectNetwork} from './composables/useNetwork';
import {useServices} from './composables/useServices';
import SearchBox from './components/SearchBox.vue';
import {Image as ImageIcon} from 'lucide-vue-next';
import ServiceCard from "./components/ServiceCard.vue";
import ServiceEditor from "./components/ServiceEditor.vue";
import BookmarkManager from "./components/BookmarkManager.vue";
import NetworkMonitor from "./components/NetworkMonitor.vue";
import StatusPanel from "./components/StatusPanel.vue";
import {Download as DownloadIcon} from 'lucide-vue-next';
import {Plus, Pencil} from 'lucide-vue-next';

const svc = useServices();
const {
  services, editorVisible, editingService, editMode,
  openAdd, openEdit, closeEditor, removeService, upsertService, resetAll,
} = svc;

const bgImage = ref('');
const isLoadingWallpaper = ref(false);
// 微软官方 Bing 壁纸接口：一次返回最近 8 天的壁纸，前端随机挑一张
// dev 环境走 vite 代理规避 CORS，扩展环境靠 manifest 的 host_permissions
const BING_API = import.meta.env.DEV
    ? '/bing/HPImageArchive.aspx?format=js&n=8&mkt=zh-CN'
    : 'https://cn.bing.com/HPImageArchive.aspx?format=js&n=8&mkt=zh-CN';
// 网络请求失败时的兜底壁纸（public/wallpapers 下）
const DEFAULT_BG = `${import.meta.env.BASE_URL}wallpapers/BingWallpaper-1784997955395.jpg`;
provide('isInternal', isInternal);

const fetchBingWallpaper = async () => {
  const res = await fetch(`${BING_API}&t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const images = (await res.json())?.images;
  if (!images?.length) throw new Error('壁纸接口返回为空');
  const pick = images[Math.floor(Math.random() * images.length)];
  return `https://cn.bing.com${pick.url}`;
};

const toggleBg = async (isInitial = false) => {
  if (isLoadingWallpaper.value) return;
  isLoadingWallpaper.value = true;

  try {
    const url = await fetchBingWallpaper();
    console.log(`[Wallpaper] ${url}`);
    await preloadImage(url);
    bgImage.value = url;
  } catch (e) {
    console.error("壁纸加载失败:", e);
    if (isInitial) {
      bgImage.value = DEFAULT_BG;
    }
  } finally {
    isLoadingWallpaper.value = false;
  }
};

const downloadWallpaper = () => {
  if (!bgImage.value) return;

  // 检查是否在插件环境下
  if (window.chrome && chrome.downloads) {
    chrome.downloads.download({
      url: bgImage.value,
      filename: `BingWallpaper-${Date.now()}.jpg`,
      saveAs: true // 弹出“另存为”窗口
    });
  } else {
    // 网页版预览环境的回退方案（可能仍受跨域限制）
    const link = document.createElement('a');
    link.href = bgImage.value;
    link.target = '_blank'; // 这种方式通常会在新标签页打开图片，用户需手动右键另存为
    link.download = 'wallpaper.jpg';
    link.click();
  }
};

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image(); // 创建一个不在 DOM 中的 Image 对象
    img.src = url;
    img.onload = () => resolve(url); // 图片下载完成，触发 resolve
    img.onerror = (e) => reject(e);     // 下载失败
  });
};

onMounted(async () => {
  await detectNetwork();
  toggleBg(true);
});
</script>

<template>
  <div
      class="relative h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden select-none">

    <div class="fixed top-0 left-0 w-full z-20">
      <StatusPanel/>
    </div>

    <div class="fixed inset-0 z-0">
      <Transition name="fade">
        <div :key="bgImage"
             class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1800ms]"
             :style="{ backgroundImage: `url(${bgImage})` }"></div>
      </Transition>
      <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
    </div>

    <main class="z-10 w-full max-w-5xl flex flex-col items-center transform-gpu">

      <div class="w-full max-w-2xl mb-10">
        <SearchBox/>
      </div>

      <div class="w-full mb-10 min-h-[100px]">
        <TransitionGroup name="stagger" tag="div"
                         class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <template v-if="isInternal">
            <ServiceCard v-for="(service, index) in services" :key="service.id" :item="service"
                         :editMode="editMode" @edit="openEdit" @delete="removeService"
                         :style="{ '--delay': `${index * 50}ms` }"/>
            <!-- 编辑模式下的添加按钮 -->
            <Transition name="stagger">
              <div v-if="editMode" key="add-btn"
                   @click="openAdd"
                   class="flex items-center justify-center gap-2 p-2.5 rounded-xl cursor-pointer
                          bg-white/20 dark:bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/30 dark:border-white/10
                          hover:bg-white/30 dark:hover:bg-white/10 hover:border-blue-400/50
                          transition-all duration-300 active:scale-95">
                <Plus class="w-5 h-5 text-white/60"/>
                <span class="text-xs font-bold text-white/60">添加服务</span>
              </div>
            </Transition>
          </template>
        </TransitionGroup>
      </div>

      <div class="w-full">
        <Transition name="slide-up" appear>
          <BookmarkManager/>
        </Transition>
      </div>
    </main>

    <div
        class="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md bg-zinc-900/70 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border">
      <div class="w-40 flex justify-center">
        <NetworkMonitor/>
      </div>

      <div class="w-[1px] h-4 bg-white/5"></div>

      <button @click="toggleBg" :disabled="isLoadingWallpaper"
              class="flex items-center justify-center gap-2 w-[100px] h-8 text-white/40 hover:text-white transition-all active:scale-95 disabled:opacity-50">
        <span class="w-4 h-4 flex items-center justify-center">
          <span v-if="isLoadingWallpaper"
                class="w-full h-full rounded-full border-2 border-white/10 border-t-white animate-spin"></span>
          <ImageIcon v-else class="w-full h-full"/>
        </span>
        <span class="text-[10px] font-bold uppercase tracking-[0.1em]">Next</span>
      </button>

      <button @click="downloadWallpaper"
              class="flex items-center justify-center w-10 h-8 text-white/40 hover:text-white transition-all"
              title="Download Wallpaper">
        <DownloadIcon class="w-4 h-4"/>
      </button>

      <div class="w-[1px] h-4 bg-white/5"></div>

      <button @click="editMode = !editMode"
              class="flex items-center justify-center w-10 h-8 transition-all active:scale-90"
              :class="editMode ? 'text-blue-400 hover:text-blue-300' : 'text-white/40 hover:text-white'"
              title="编辑服务">
        <Pencil class="w-4 h-4"/>
      </button>
    </div>

    <ServiceEditor
        :visible="editorVisible"
        :service="editingService"
        @close="closeEditor"
        @save="(data) => { upsertService(data); closeEditor(); }"
    />
  </div>
</template>

<style scoped>
/* 优化后的交叉淡化动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s ease-in-out, filter 1.2s ease-in-out;
}

/* 修改后 */
.fade-enter-from {
  opacity: 0;
  transform: scale(1.05) translateY(10px);
  filter: blur(20px);
}

.fade-leave-to {
  opacity: 0;
  filter: blur(10px); /* 旧图离开时轻微模糊 */
}

/* 2. 磁贴列表交错动画 */
.stagger-enter-active {
  transition: all 0.4s cubic-bezier(0.17, 0.88, 0.32, 1.28);
}

.stagger-leave-active,
.stagger-move {
  transition: all 0.4s ease;
  transition-delay: 0ms !important;
}

.stagger-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9); /* 减小位移距离，让入场更迅速 */
}

.stagger-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
  filter: blur(10px);
}

/* 3. 让磁贴在移动时平滑（补位动画） */
.stagger-move {
  transition: transform 0.5s ease;
}

.slide-up-enter-active {
  /* 时长从 1s 压缩到 0.6s，延迟从 0.3s 缩短到 0.15s */
  transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1),
  transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);

  transition-delay: 0.1s;
  will-change: opacity, transform;
}

.slide-up-enter-from {
  opacity: 0;
  /* 1. 初始位置下移 30px */
  transform: translateY(20px) scale(0.99);
}

/* 动画结束状态（Vue默认会移除enter-from，这里显式写出为了清晰） */
.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 统一背景呼吸感动画 */
.bg-zoom {
  animation: bg-pulse 20s ease-in-out infinite;
}

@keyframes bg-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 简单的 CSS loading 旋转 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* 按钮悬停时的文字渐亮 */
button span {
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

button:hover span {
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

/* 修改背景图样式 */
.absolute.inset-0 {
  transition: opacity 1.2s ease, filter 1.2s ease, transform 1.2s ease;
}
</style>