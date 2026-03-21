<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 w-full px-2">
    <div v-for="(links, category) in bookmarkData" :key="category" class="flex flex-col items-center">

      <div class="relative w-full aspect-square bg-white/20 backdrop-blur-2xl rounded-[2.2rem] p-3 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ring-white/10 overflow-hidden hover:bg-white/25 transition-all duration-500">

        <div class="grid grid-cols-2 grid-rows-2 gap-2.5 h-full w-full">
          <div v-for="n in 4" :key="n"
               class="relative flex items-center justify-center rounded-[1.1rem] transition-all active:scale-90 group/icon overflow-hidden cursor-pointer"
               @click="handleLinkClick(links[n-1])">

            <template v-if="links[n-1]">
              <div class="absolute inset-0 bg-white/10 border border-white/10 group-hover/icon:bg-white/20 transition-colors"></div>

              <Icon :icon="links[n-1].icon"
                    class="text-[26px] z-10 text-zinc-900/90 drop-shadow-none group-hover/icon:scale-110 transition-transform duration-300" />
            </template>

            <div v-else class="w-full h-full bg-black/5 rounded-[1.1rem]"></div>
          </div>
        </div>
      </div>

      <span class="mt-4 text-[13px] font-bold text-white tracking-wide drop-shadow-lg opacity-90">
        {{ category }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { Icon } from '@iconify/vue';
import { defaultBookmarks } from '../data/bookmarks';

// 为了简化逻辑，确保每个分类最多只有 4 个
const bookmarkData = reactive(defaultBookmarks);

// 核心跳转逻辑
const handleLinkClick = (linkItem) => {
  if (linkItem && linkItem.url) {
    window.open(linkItem.url, '_blank');
  }
};
</script>