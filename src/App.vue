<script setup>
import { ref, onMounted, watch } from 'vue';
import SearchBox from './components/SearchBox.vue';
import { Image as ImageIcon } from 'lucide-vue-next';
import ServiceCard from "./components/ServiceCard.vue";
import BookmarkManager from "./components/BookmarkManager.vue";
import NetworkMonitor from "./components/NetworkMonitor.vue";
import StatusPanel from "./components/StatusPanel.vue";
import WeatherPanel from "./components/WeatherPanel.vue";
import { defaultServices } from './data/services';


// 2. 定义统一的响应式状态
const navData = ref({
  services: [],
  bookmarks: {}
});

onMounted(() => {
  const STORAGE_KEY = 'lantech_nav_storage';
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      // 如果本地有缓存，加载缓存
      navData.value = JSON.parse(saved);
    } catch (e) {
      console.error("缓存解析失败，重置为默认值");
      initDefault();
    }
  } else {
    // 没有任何缓存，加载默认文件里的数据
    initDefault();
  }
});

// 初始化函数
const initDefault = () => {
  navData.value = {
    services: defaultServices,
    bookmarks: defaultBookmarks
  };
};

// 3. 开启持久化监听
watch(navData, (newVal) => {
  localStorage.setItem('lantech_nav_storage', JSON.stringify(newVal));
}, { deep: true });


// 1. 响应式变量
const wallpapers = ref([]); // 初始为空，由后端填充
const currentIndex = ref(0);
const bgImage = ref('');

// 2. 获取壁纸列表函数
const fetchWallpapers = async () => {
  try {
    const res = await fetch('http://192.168.100.1:5000/api/wallpapers');
    const data = await res.json();

    if (data.images && data.images.length > 0) {
      wallpapers.value = data.images;

      // 恢复上次浏览的位置
      const savedIndex = localStorage.getItem('lantech_bg_index');
      if (savedIndex !== null) {
        const index = parseInt(savedIndex);
        // 防御性编程：确保缓存的索引没越界（万一你删了图）
        currentIndex.value = index < wallpapers.value.length ? index : 0;
      }

      // 设置当前背景
      bgImage.value = wallpapers.value[currentIndex.value];
    } else {
      // 如果后端没图，可以给个兜底图
      bgImage.value = '/wallpapers/1.png';
    }
  } catch (e) {
    console.error("无法获取动态壁纸列表:", e);
    bgImage.value = '/wallpapers/1.png'; // 报错时使用本地兜底
  }
};

// 3. 切换背景函数
const toggleBg = async () => {
  if (wallpapers.value.length === 0) return;

  // 1. 立即执行本地切换（无感延迟）
  currentIndex.value = (currentIndex.value + 1) % wallpapers.value.length;
  bgImage.value = wallpapers.value[currentIndex.value];
  localStorage.setItem('lantech_bg_index', currentIndex.value);

  // 2. 后台默默刷新列表（为下一次切换做准备，并更新时间戳）
  try {
    const res = await fetch('http://192.168.100.1:5000/api/wallpapers');
    const data = await res.json();
    if (data.images) wallpapers.value = data.images;
  } catch (e) {
    console.error("后台刷新列表失败");
  }
};

// 初始化
onMounted(() => {
  fetchWallpapers();
});
</script>

<template>
  <div class="relative h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden selection:bg-blue-500/30">

    <StatusPanel />
    <WeatherPanel />

    <div class="fixed inset-0 z-0">
      <Transition name="fade">
        <div :key="bgImage" class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1500ms]" :style="{ backgroundImage: `url(${bgImage})` }"></div>
      </Transition>
      <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
    </div>


    <main class="z-10 w-full max-w-5xl flex flex-col items-center transform-gpu">
      <div class="w-full max-w-2xl mb-10">
        <SearchBox />
      </div>

      <div class="w-full mb-10">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <ServiceCard v-for="service in defaultServices" :key="service.name" :item="service" />
        </div>
      </div>

      <div class="w-full">
        <BookmarkManager />
      </div>
    </main>

    <div class="fixed bottom-8 right-8 z-20 flex items-center gap-5 px-5 py-2.5 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[1.2rem] shadow-2xl hover:bg-white/15 transition-all group">

      <NetworkMonitor />

      <div class="w-[1px] h-6 bg-white/10"></div>

      <button
          @click="toggleBg"
          class="flex items-center gap-2 text-white/60 hover:text-white transition-all active:scale-90"
      >
        <ImageIcon class="w-4 h-4" />
        <span class="text-[10px] font-bold uppercase tracking-[0.2em]">Wall</span>
      </button>

      <div class="absolute -top-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span class="text-[9px] text-white/20 uppercase tracking-[0.4em] font-light">HP 400 G4 Node</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 交叉淡化动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 给背景加一点点缩放呼吸感，配合 transition-transform */
.scale-105 {
  transform: scale(1.05);
}
</style>