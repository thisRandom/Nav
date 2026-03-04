<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref('');
const currentDate = ref('');
const hitokoto = ref('正在加载...');
const isRefreshing = ref(false);

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
  currentDate.value = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
};

const fetchHitokoto = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    const res = await fetch('http://192.168.100.1:5000/api/hitokoto');
    const data = await res.json();
    hitokoto.value = data.hitokoto;
  } catch (e) {
    hitokoto.value = '欲买桂花同载酒，终不似，少年游。';
  } finally {
    setTimeout(() => { isRefreshing.value = false; }, 500);
  }
};

let timer = null;
onMounted(() => {
  updateTime();
  fetchHitokoto();
  timer = setInterval(updateTime, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="fixed top-6 left-8 z-10 flex flex-col pointer-events-none items-start">

    <div class="flex flex-col drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
      <span class="text-5xl font-bold text-white tracking-tighter leading-none">
        {{ currentTime }}
      </span>
      <div class="flex items-center gap-2 mt-2">
    <span class="text-[10px] font-bold text-white tracking-[0.2em] uppercase
               bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md
               border border-white/10 shadow-lg">
      {{ currentDate }}
    </span>
      </div>
    </div>

    <div
        class="mt-3 group cursor-pointer pointer-events-auto select-none transition-transform active:scale-95"
        @click="fetchHitokoto"
    >
      <div class="inline-flex px-3 py-1.5 bg-black/30 backdrop-blur-md border border-white/5 rounded-xl w-fit min-h-[32px] items-center overflow-hidden transition-all duration-500 ease-in-out hover:bg-black/30 ring-1 ring-white/5">

        <Transition name="quote-fade" mode="out-in">
          <p :key="hitokoto" class="text-[11px] text-white/70 font-medium italic whitespace-nowrap">
            {{ hitokoto }}
          </p>
        </Transition>

      </div>

      <div class="flex items-center gap-1 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="w-1 h-1 rounded-full bg-white/40" :class="{ 'animate-ping': isRefreshing }"></div>
        <span class="text-[8px] text-white/30 uppercase tracking-tighter">
          {{ isRefreshing ? '加载中...' : '更新' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
span {
  font-variant-numeric: tabular-nums;
}

/* 核心动画：背景宽度和高度的变化都会受此影响 */
.inline-flex {
  /* 确保宽度变化平滑 */
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s;
}

.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateX(10px); /* 改为横向浮现配合宽度变化更自然 */
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>