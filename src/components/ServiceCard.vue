<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps(['item', 'editMode']);
const emit = defineEmits(['edit', 'delete']);

const handleAction = () => {
  if (props.editMode) return;
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
           bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10
           hover:bg-white/60 dark:hover:bg-white/10
           hover:border-white/40 dark:hover:border-white/30
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
      <div v-if="item.type === 'link' && !editMode" class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
      <Icon v-else-if="!editMode" icon="lucide:copy" class="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- 编辑模式按钮 -->
    <Transition name="fade-fast">
      <div v-if="editMode" class="absolute -top-1.5 -right-1.5 flex items-center gap-0.5">
        <button @click.stop="$emit('edit', item)"
                class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-400 active:scale-90 transition-all">
          <Icon icon="lucide:pencil" class="w-2.5 h-2.5" />
        </button>
        <button @click.stop="$emit('delete', item.id)"
                class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-400 active:scale-90 transition-all">
          <Icon icon="lucide:x" class="w-2.5 h-2.5" />
        </button>
      </div>
    </Transition>

    <!-- 编辑模式下的边框高亮 -->
    <div v-if="editMode"
         class="absolute inset-0 rounded-xl border-2 border-blue-400/40 pointer-events-none animate-pulse"></div>
  </div>
</template>

<style scoped>
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.15s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
