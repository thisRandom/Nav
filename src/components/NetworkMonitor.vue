<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

const googleStatus = ref({ latency: '--', color: 'bg-zinc-500' });
const baiduStatus = ref({ latency: '--', color: 'bg-zinc-500' });

const checkPing = async (url) => {
  const start = Date.now();
  try {
    // 使用 fetch 配合 no-cors 模式，避免跨域拦截
    await fetch(`${url}/favicon.ico?t=${start}`, { mode: 'no-cors', cache: 'no-cache' });
    const latency = Date.now() - start;
    let color = 'bg-green-500 shadow-[0_0_8px_#22c55e]'; // 优秀
    if (latency > 300) color = 'bg-yellow-500 shadow-[0_0_8px_#eab308]'; // 一般
    return { latency: `${latency}ms`, color };
  } catch (e) {
    return { latency: 'Error', color: 'bg-red-500 shadow-[0_0_8px_#ef4444]' }; // 离线
  }
};

const updateStatus = async () => {
  // 同时检测两个地址
  const [google, baidu] = await Promise.all([
    checkPing('https://www.google.com'),
    checkPing('https://www.baidu.com')
  ]);
  googleStatus.value = google;
  baiduStatus.value = baidu;
};

let timer = null;
onMounted(() => {
  updateStatus();
  timer = setInterval(updateStatus, 5000); // 5秒轮询
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2">
      <div :class="['w-1.5 h-1.5 rounded-full transition-all duration-500', baiduStatus.color]"></div>
      <div class="flex flex-col">
        <span class="text-[8px] text-white/30 uppercase font-bold tracking-tight">CN</span>
        <span class="text-[10px] text-white/80 font-mono leading-none">{{ baiduStatus.latency }}</span>
      </div>
    </div>

    <div class="w-[1px] h-4 bg-white/10"></div>

    <div class="flex items-center gap-2">
      <div :class="['w-1.5 h-1.5 rounded-full transition-all duration-500', googleStatus.color]"></div>
      <div class="flex flex-col">
        <span class="text-[8px] text-white/30 uppercase font-bold tracking-tight">INTL</span>
        <span class="text-[10px] text-white/80 font-mono leading-none">{{ googleStatus.latency }}</span>
      </div>
    </div>
  </div>
</template>