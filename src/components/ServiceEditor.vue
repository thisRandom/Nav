<script setup>
import { ref, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  visible: Boolean,
  service: Object, // null = 新增, 有值 = 编辑
});
const emit = defineEmits(['close', 'save']);

const form = ref({ name: '', icon: '', url: '', desc: '' });
const iconInput = ref(null);
const iconPreviewError = ref(false);

// 弹窗打开时初始化表单
watch(() => props.visible, (val) => {
  if (val) {
    if (props.service) {
      form.value = { name: props.service.name, icon: props.service.icon, url: props.service.url, desc: props.service.desc || '' };
    } else {
      form.value = { name: '', icon: '', url: '', desc: '' };
    }
    iconPreviewError.value = false;
    nextTick(() => iconInput.value?.focus());
  }
});

function handleSave() {
  if (!form.value.name.trim() || !form.value.url.trim()) return;
  emit('save', {
    ...(props.service ? { id: props.service.id } : {}),
    name: form.value.name.trim(),
    icon: form.value.icon.trim() || 'lucide:globe',
    url: form.value.url.trim(),
    desc: form.value.desc.trim(),
    type: 'link',
  });
}

function handleBackdrop(e) {
  if (e.target === e.currentTarget) emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible"
           class="fixed inset-0 z-[999] flex items-center justify-center p-4"
           @click="handleBackdrop">
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- 弹窗主体 -->
        <div class="relative w-full max-w-sm bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
          <h2 class="text-sm font-bold text-white mb-5">
            {{ service ? '编辑服务' : '新增服务' }}
          </h2>

          <div class="space-y-4">
            <!-- 名称 -->
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">名称</label>
              <input v-model="form.name" type="text" placeholder="例：NAS"
                     class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-colors" />
            </div>

            <!-- URL -->
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">URL</label>
              <input v-model="form.url" type="text" placeholder="http://192.168.10.10"
                     class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-colors" />
            </div>

            <!-- 图标 -->
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                图标 <span class="text-zinc-600">(Iconify 名称)</span>
              </label>
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <Icon v-if="form.icon && !iconPreviewError" :icon="form.icon" class="w-5 h-5 text-white" @error="iconPreviewError = true" />
                  <Icon v-else icon="lucide:globe" class="w-5 h-5 text-zinc-500" />
                </div>
                <input ref="iconInput" v-model="form.icon" type="text" placeholder="lucide:server"
                       @input="iconPreviewError = false"
                       class="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <p class="text-[9px] text-zinc-600 mt-1">例: lucide:server, mdi:nas, simple-icons:synology</p>
            </div>

            <!-- 描述 -->
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">描述</label>
              <input v-model="form.desc" type="text" placeholder="简短描述（可选）"
                     class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex items-center gap-3 mt-6">
            <button @click="$emit('close')"
                    class="flex-1 py-2 rounded-lg text-sm font-medium text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors">
              取消
            </button>
            <button @click="handleSave"
                    :disabled="!form.name.trim() || !form.url.trim()"
                    class="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {{ service ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
