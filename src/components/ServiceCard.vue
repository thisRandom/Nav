<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps(['item']);

const handleAction = () => {
  if (props.item.type === 'link') {
    window.open(props.item.url, '_blank');
  } else if (props.item.type === 'copy' || props.item.type === 'info') {
    const textToCopy = props.item.value || props.item.url;
    navigator.clipboard.writeText(textToCopy);
  }
};
</script>

<template>
  <div
      @click="handleAction"
      class="group relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 cursor-pointer
           /* 基础样式：固定坐标，不使用 translate */
           bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10
           /* 悬浮反馈：只改变颜色和亮度，不改变位置和模糊强度 */
           hover:bg-white/60 dark:hover:bg-white/10
           hover:border-white/40 dark:hover:border-white/30
           /* 增加内发光感，而不是外阴影（阴影有时也会触发重绘） */
           hover:shadow-[inset_0_0_12px_rgba(255,255,255,0.2)]
           active:scale-95"
  >
    <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/50 dark:bg-black/20 shadow-inner">
      <Icon :icon="item.icon" class="w-6 h-6" />
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
        {{ item.name }}
      </h3>
      <p class="text-[10px] text-zinc-600 dark:text-zinc-300 truncate mt-0.5 font-medium">
        {{ item.type === 'info' || item.type === 'copy' ? item.value : item.desc }}
      </p>
    </div>

    <div class="flex-shrink-0 ml-1">
      <div v-if="item.type === 'link'" class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
      <Icon v-else icon="lucide:copy" class="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </div>
</template>