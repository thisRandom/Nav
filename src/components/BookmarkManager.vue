<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 w-full px-2">

    <div v-for="(links, category) in bookmarkData" :key="category" class="flex flex-col items-center">

      <div class="relative w-full aspect-square bg-white/10 backdrop-blur-3xl rounded-[2.2rem] p-3 border border-white/20 shadow-lg ring-1 ring-white/5 overflow-hidden">

        <div class="grid grid-cols-2 grid-rows-2 gap-2.5 h-full w-full">
          <div v-for="n in 4" :key="n"
               class="relative flex items-center justify-center rounded-[1.1rem] transition-all active:scale-90 group/icon overflow-hidden cursor-pointer"
               @click="handleLinkClick(links[n-1])">

            <template v-if="links[n-1]">
              <div class="absolute inset-0 bg-white/5 border border-white/5 group-hover/icon:bg-white/10 transition-colors"></div>

              <Icon :icon="links[n-1].icon"
                    class="text-[26px] z-10 drop-shadow-sm group-hover/icon:scale-110 transition-transform duration-300" />
            </template>

            <div v-else class="w-full h-full bg-white/[0.02] rounded-[1.1rem]"></div>
          </div>
        </div>
      </div>


      <span class="mt-4 text-[13px] font-medium text-white/90 tracking-wide drop-shadow-md">
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