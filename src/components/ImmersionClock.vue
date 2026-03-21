<script setup>
import {ref, onMounted, onUnmounted} from 'vue';

const time = ref('');
const dateStr = ref('');
const weekStr = ref('');

const updateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  dateStr.value = now.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
  weekStr.value = now.toLocaleDateString('en-US', {weekday: 'long'});
};

let timer;
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="relative flex flex-col items-center justify-center text-white select-none
              before:content-[''] before:absolute before:inset-[-10vh] before:bg-black/10 before:blur-[100px] before:rounded-full before:z-[-1]">

    <h1 class="text-8xl md:text-9xl font-medium tracking-tight leading-none mb-6 opacity-95 custom-shadow">
      {{ time }}
    </h1>

    <div class="flex items-center gap-4 text-sm md:text-base font-medium tracking-[0.3em] uppercase opacity-70">
      <span class="drop-shadow-md">{{ dateStr }}</span>
      <div class="w-1.5 h-1.5 rounded-full bg-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
      <span class="drop-shadow-md">{{ weekStr }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 核心：自定义多重阴影，防止浅色背景“吃掉”文字 */
.custom-shadow {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
  0 0 40px rgba(0, 0, 0, 0.1);
}

/* 简单的呼吸感动画 */
@keyframes clock-breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.01);
    opacity: 1;
  }
}

h1 {
  animation: clock-breathe 8s ease-in-out infinite;
}
</style>