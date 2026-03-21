<script setup>
// JS 逻辑保持不变...
import {ref, onMounted, onUnmounted} from 'vue';

const currentTime = ref('');
const currentDate = ref('');
const hitokoto = ref('');
const isRefreshing = ref(false);

const localQuotes = [
  // --- 计算机与极客哲学 ---
  "世界是复杂的，代码应该是简单的。",
  "程序会过时，思维不会。",
  "写代码，也是在写自己。",
  "每一次重构，都是一次进化。",
  "Bug 是程序在向你提问。",
  "代码之外，才是真正的世界。",
  "在逻辑里迷路，在现实中醒来。",
  "程序员的浪漫，是让复杂变简单。",
  "世界运行在规则之上。",
  "有些问题，只能用代码回答。",

  // --- 人生、自由与远方 ---
  "风会记得每一个出发的人。",
  "人间烟火，最抚凡人心。",
  "路很长，天总会亮。",
  "向前走，别回头看风。",
  "世界很大，别困在原地。",
  "山高路远，来日方长。",
  "把日子过成诗。",
  "慢一点，也没关系。",
  "时间会奖励坚持的人。",
  "远方，总比想象更辽阔。",

  // --- 极客感英文 ---
  "Code the world you want.",
  "Dream in binary.",
  "Think deeper, build simpler.",
  "Everything begins with zero.",
  "Make it work, make it better.",
  "Stay curious.",
  "Build, break, rebuild.",
  "Think different, code different.",

  // --- 极简哲学 ---
  "简单，是最高级的复杂。",
  "万物自有节奏。",
  "慢慢走，也会到达。",
  "留白，是另一种表达。",
  "安静，是一种力量。",
  "复杂终将归于简单。",
  "时间，会解释一切。"
];

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', {hour12: false, hour: '2-digit', minute: '2-digit'});
  currentDate.value = now.toLocaleDateString('zh-CN', {month: 'long', day: 'numeric', weekday: 'short'});
};

const fetchHitokoto = () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  let nextQuote = "";
  do {
    nextQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
  } while (nextQuote === hitokoto.value);

  hitokoto.value = nextQuote;
  setTimeout(() => {
    isRefreshing.value = false;
  }, 400);
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
      <span class="text-5xl font-bold text-white tracking-tighter leading-none">{{ currentTime }}</span>
      <div class="flex items-center gap-2 mt-2">
        <span
            class="text-[10px] font-bold text-white tracking-[0.2em] uppercase bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 shadow-lg">
          {{ currentDate }}
        </span>
      </div>
    </div>

    <div
        class="mt-3 group cursor-pointer pointer-events-auto select-none transition-transform active:scale-95"
        @click="fetchHitokoto"
    >
      <div
          class="quote-container inline-flex px-4 py-2 bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl w-fit min-h-[36px] items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/40 ring-1 ring-white/5">
        <Transition name="quote-slide" mode="out-in">
          <p :key="hitokoto" class="text-[12px] text-white/80 font-medium italic whitespace-nowrap tracking-wide">
            {{ hitokoto }}
          </p>
        </Transition>
      </div>

      <div
          class="flex items-center gap-1.5 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
        <div class="w-1.5 h-1.5 rounded-full bg-white/20" :class="{ 'animate-pulse bg-green-400': isRefreshing }"></div>
        <span class="text-[8px] text-white/40 uppercase tracking-[0.3em] font-black">
          {{ isRefreshing ? 'Generating' : 'Next Quote' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 强制数字等宽，防止时钟抖动 */
span {
  font-variant-numeric: tabular-nums;
}

/* 1. 文字切换动画：滑入滑出效果 */
.quote-slide-enter-active,
.quote-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.quote-slide-enter-from {
  opacity: 0;
  transform: translateY(8px); /* 从下方滑入 */
  filter: blur(4px);
}

.quote-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px); /* 向上方滑出 */
  filter: blur(4px);
}

/* 2. 背景板宽度动画逻辑 */
.quote-container {
  /* 这里的 transition-all 会捕获由文字长度改变引起的 width 变化 */
  will-change: width;
}
</style>