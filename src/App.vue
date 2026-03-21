<script setup>
import {ref, onMounted, provide, onUnmounted} from 'vue';
import SearchBox from './components/SearchBox.vue';
import {Image as ImageIcon} from 'lucide-vue-next';
import ServiceCard from "./components/ServiceCard.vue";
import BookmarkManager from "./components/BookmarkManager.vue";
import NetworkMonitor from "./components/NetworkMonitor.vue";
import StatusPanel from "./components/StatusPanel.vue";
import WeatherPanel from "./components/WeatherPanel.vue";
import {defaultServices} from './data/services';
import {Download as DownloadIcon} from 'lucide-vue-next'; // 记得导入图标
import {Eye, EyeOff} from 'lucide-vue-next';
import ImmersionClock from './components/ImmersionClock.vue';

// 1. 响应式变量：默认不再需要 isInternal 状态分发
const bgImage = ref('');
const isLoadingWallpaper = ref(false);
const LOCAL_API_BASE = 'http://192.168.100.1:5000/api/random-wallpaper';
const PUBLIC_API_BASE = 'https://bing.img.run/rand.php';
const isImmersive = ref(false); // 沉浸模式状态

const isInternal = ref(false); // 默认不显示内网服务，待探测成功后再切入
provide('isInternal', isInternal);

// 1. 极速探测函数
const checkNetwork = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300); // 300ms 快速失败

  try {
    // 探测你最常开启的那个内网 IP 端口
    const res = await fetch('http://192.168.100.1:8897', {
      method: 'HEAD',
      mode: 'no-cors', // 插件环境下 no-cors 也能判断通不通
      signal: controller.signal
    });
    // 只要没进 catch，说明 IP 是通的
    isInternal.value = true;
  } catch (e) {
    isInternal.value = false;
  } finally {
    clearTimeout(timeoutId);
  }
};

const toggleBg = async (isInitial = false) => {
  if (isLoadingWallpaper.value) return;
  isLoadingWallpaper.value = true;

  const timestamp = `?t=${Date.now()}`;

  // 核心逻辑：直接根据 App.vue 探测到的 isInternal 决定请求目标
  // 这样如果 checkNetwork 探测失败，这里会秒切公网，不浪费 1 毫秒
  const targetApi = isInternal.value ? LOCAL_API_BASE : PUBLIC_API_BASE;
  const finalUrl = `${targetApi}${timestamp}`;

  console.log(`[Wallpaper] 探测结果: ${isInternal.value ? '内网' : '公网'}, 正在请求: ${finalUrl}`);

  try {
    // 依然使用静默预加载，保证切换时的丝滑感
    await preloadImage(finalUrl);
    bgImage.value = finalUrl;
  } catch (e) {
    console.error("壁纸加载失败:", e);

    // 容错：如果内网 API 报错（比如 Python 后端挂了），尝试切回公网作为备选
    if (isInternal.value) {
      try {
        const fallbackUrl = `${PUBLIC_API_BASE}${timestamp}`;
        await preloadImage(fallbackUrl);
        bgImage.value = fallbackUrl;
      } catch (err) {
        if (isInitial) bgImage.value = DEFAULT_BG;
      }
    } else if (isInitial) {
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
const toggleImmersive = () => {
  isImmersive.value = !isImmersive.value;
};
// 快捷键处理函数
const handleKeyDown = (e) => {
  // 逻辑判断：
  // 1. 必须按下 Alt 键
  // 2. 键位必须是 'h' 或 'H'
  // 3. 目标元素不能是输入框 (input, textarea, 或开启了 contenteditable 的元素)
  const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;

  if (e.altKey && e.key.toLowerCase() === 'h' && !isInput) {
    e.preventDefault(); // 阻止某些浏览器默认的 Alt 行为
    toggleImmersive();
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  // 1. 先进行网络探测 (checkNetwork 是 async 的)
  // 虽然它有 300ms 超时，但通常局域网内几毫秒就出结果了
  await checkNetwork();

  // 2. 探测结束后，isInternal 已经有了准确的值
  // 此时再触发 toggleBg，它会直接走向正确的接口
  toggleBg(true);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div
      class="relative h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden selection:bg-blue-500/30">

    <Transition name="clock-fade">
      <div v-if="isImmersive" class="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
        <ImmersionClock/>
      </div>
    </Transition>

    <div class="fixed top-0 left-0 w-full z-20 transition-all duration-700 ease-in-out"
         :class="{ 'opacity-0 -translate-y-10 pointer-events-none': isImmersive }">
      <StatusPanel/>
      <WeatherPanel/>
    </div>

    <div class="fixed inset-0 z-0">
      <Transition name="fade">
        <div :key="bgImage"
             class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1800ms]"
             :style="{ backgroundImage: `url(${bgImage})` }"></div>
      </Transition>
      <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
    </div>

    <main class="z-10 w-full max-w-5xl flex flex-col items-center transform-gpu transition-all duration-700 ease-in-out"
          :class="{ 'opacity-0 scale-95 translate-y-12 pointer-events-none': isImmersive }">

      <div class="w-full max-w-2xl mb-10">
        <SearchBox/>
      </div>

      <div class="w-full mb-10 min-h-[100px]">
        <TransitionGroup name="stagger" tag="div"
                         class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <template v-if="isInternal">
            <ServiceCard v-for="(service, index) in defaultServices" :key="service.id" :item="service"
                         :style="{ '--delay': `${index * 50}ms` }"/>
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
        class="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-3 py-2 transition-all duration-700 ease-in-out"
        :class="[
      isImmersive
        ? 'bg-zinc-900/20 border-transparent backdrop-blur-sm'
        : 'bg-zinc-900/80 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border'
    ]"
        style="border-radius: 1rem;"
    >
      <button @click="toggleImmersive"
              class="flex items-center justify-center w-10 h-8 transition-all active:scale-90"
              :class="isImmersive ? 'text-white/80 hover:text-white' : 'text-white/40 hover:text-white'">
        <EyeOff v-if="isImmersive" class="w-4 h-4"/>
        <Eye v-else class="w-4 h-4"/>
      </button>

      <Transition name="slide-fade">
        <div v-if="!isImmersive" class="flex items-center gap-2">
          <div class="w-[1px] h-4 bg-white/5"></div>

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
        </div>
      </Transition>
    </div>
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

/* 给右下角控制台增加一个微妙的内发光 */
.fixed.bottom-8 {
  /* 显式声明高度，防止内容垂直抖动 */
  height: 48px;
  /* 只允许背景和边框过渡，不允许 width 过渡（如果子元素定宽，width 就不动了） */
  transition: background-color 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5),
  inset 0 0 0 1px rgba(255, 255, 255, 0.05);
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


/* 沉浸模式下的背景微调 */
.is-immersive-bg {
  filter: blur(2px) brightness(1.1); /* 轻微模糊并提亮，增加梦幻感 */
}

.clock-fade-enter-active, .clock-fade-leave-active {
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.clock-fade-enter-from, .clock-fade-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
  filter: blur(10px);
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>