<script setup>
import {ref, onMounted, onUnmounted} from 'vue';

const googleStatus = ref({latency: 'Ready', color: 'bg-zinc-500'});
const baiduStatus = ref({latency: 'Ready', color: 'bg-zinc-500'});
const isDetecting = ref(false); // 正在检测的动画状态

const checkPing = async (url) => {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    await fetch(`${url}/favicon.ico?t=${Date.now()}`, { // 带上时间戳防止强缓存干扰准确性
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    clearTimeout(timeout);
    const latency = Date.now() - start;
    let color = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    if (latency > 300) color = 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
    return {latency: `${latency}ms`, color};
  } catch (e) {
    return {latency: 'Offline', color: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'};
  }
};

const updateStatus = async () => {
  if (isDetecting.value) return; // 防止重复点击
  isDetecting.value = true;

  const [google, baidu] = await Promise.all([
    checkPing('https://www.google.com'),
    checkPing('https://www.baidu.com')
  ]);

  googleStatus.value = google;
  baiduStatus.value = baidu;

  // 增加一个微小的延迟感，让用户感觉到“正在检测”
  setTimeout(() => {
    isDetecting.value = false;
  }, 500);
};

let timer = null;
let requestCount = 0;

onMounted(() => {
  // 1. 立即执行第一次
  updateStatus();
  requestCount++;

  // 2. 设置定时器，每 10s 执行一次，执行满 3 次后停止
  timer = setInterval(() => {
    if (requestCount < 3) {
      updateStatus();
      requestCount++;
    } else {
      clearInterval(timer);
      timer = null;
      console.log("Initial 3-times detection complete. Switching to manual mode.");
    }
  }, 10000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div
      @click="updateStatus"
      class="flex items-center gap-4 select-none cursor-pointer hover:opacity-80 active:scale-95 transition-all"
      title="点击重新检测网络状态"
  >
    <div class="flex items-center gap-2 group">
      <div
          :class="['w-1.5 h-1.5 rounded-full transition-all duration-700',
                 isDetecting ? 'bg-blue-400 animate-ping' : baiduStatus.color]"
      ></div>
      <div class="flex flex-col">
        <span class="text-[7px] text-white/20 uppercase font-black tracking-widest">Global</span>
        <span class="text-[10px] text-white/70 font-mono leading-tight tabular-nums">{{ baiduStatus.latency }}</span>
      </div>
    </div>

    <div class="w-[1px] h-4 bg-white/5"></div>

    <div class="flex items-center gap-2 group">
      <div
          :class="['w-1.5 h-1.5 rounded-full transition-all duration-700',
                 isDetecting ? 'bg-blue-400 animate-ping' : googleStatus.color]"
      ></div>
      <div class="flex flex-col">
        <span class="text-[7px] text-white/20 uppercase font-black tracking-widest">Proxy</span>
        <span class="text-[10px] text-white/70 font-mono leading-tight tabular-nums">{{ googleStatus.latency }}</span>
      </div>
    </div>
  </div>
</template>