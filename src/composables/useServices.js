import { ref, computed } from 'vue';
import { defaultServices } from '../data/services';

const STORAGE_KEY = 'service_customizations';

// 从 defaultServices 初始化一份深拷贝，避免直接修改源数据
const services = ref(JSON.parse(JSON.stringify(defaultServices)));
const editMode = ref(false);
const editorVisible = ref(false);
const editingService = ref(null); // null = 新增, 非null = 编辑

// 计算自定义数据（增量：新增 + 修改 + 删除）
const deletedIds = ref(new Set());

function generateId() {
  return 'svc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** 从 chrome.storage 加载用户自定义数据并合并 */
export function useServices() {

  async function load() {
    try {
      const raw = await chrome.storage.local.get(STORAGE_KEY);
      const data = raw[STORAGE_KEY];
      if (!data) return;

      // 恢复删除列表
      if (data.deleted) {
        deletedIds.value = new Set(data.deleted);
      }

      // 恢复新增的服务
      if (data.added) {
        services.value = [
          ...services.value,
          ...data.added
        ];
      }

      // 恢复修改的服务（覆盖同 id 的默认项）
      if (data.edited) {
        const editMap = Object.fromEntries(data.edited.map(s => [s.id, s]));
        services.value = services.value.map(s => editMap[s.id] ? { ...s, ...editMap[s.id] } : s);
      }

      // 过滤已删除
      services.value = services.value.filter(s => !deletedIds.value.has(s.id));
    } catch (e) {
      console.error("加载服务自定义数据失败:", e);
    }
  }

  /** 保存当前状态到 chrome.storage */
  async function save() {
    const edited = [];
    const added = [];
    const deleted = [...deletedIds.value];

    // 区分编辑和新增：id 在 defaultServices 中存在的是编辑，否则是新增
    const defaultIdSet = new Set(defaultServices.map(s => s.id));

    for (const svc of services.value) {
      // 跳过已删除的
      if (deletedIds.value.has(svc.id)) continue;

      const original = defaultServices.find(s => s.id === svc.id);
      if (original) {
        // 默认服务：检查是否有修改
        if (JSON.stringify(original) !== JSON.stringify({ ...original, ...pickEditable(svc) })) {
          edited.push(pickEditable(svc));
        }
      } else {
        // 用户新增的服务
        added.push(svc);
      }
    }

    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: { deleted, added, edited: edited.length ? edited : undefined }
      });
    } catch (e) {
      console.error("保存服务自定义数据失败:", e);
    }
  }

  /** 只取可编辑字段 */
  function pickEditable(svc) {
    return { id: svc.id, name: svc.name, icon: svc.icon, url: svc.url, desc: svc.desc, type: svc.type || 'link' };
  }

  /** 删除一个服务 */
  function removeService(id) {
    deletedIds.value.add(id);
    services.value = services.value.filter(s => s.id !== id);
    save();
  }

  /** 新增或更新服务 */
  function upsertService(data) {
    if (data.id) {
      // 编辑已有服务
      const idx = services.value.findIndex(s => s.id === data.id);
      if (idx !== -1) {
        services.value[idx] = { ...services.value[idx], ...data };
      }
    } else {
      // 新增
      const newService = { ...data, id: generateId(), type: 'link' };
      services.value.push(newService);
    }
    save();
  }

  /** 打开编辑器（新增模式） */
  function openAdd() {
    editingService.value = null;
    editorVisible.value = true;
  }

  /** 打开编辑器（编辑模式） */
  function openEdit(service) {
    editingService.value = { ...service };
    editorVisible.value = true;
  }

  /** 关闭编辑器 */
  function closeEditor() {
    editorVisible.value = false;
    editingService.value = null;
  }

  /** 恢复默认（清除所有自定义） */
  async function resetAll() {
    deletedIds.value = new Set();
    services.value = JSON.parse(JSON.stringify(defaultServices));
    await chrome.storage.local.remove(STORAGE_KEY);
  }

  // 初始化加载
  load();

  return {
    services,
    editMode,
    editorVisible,
    editingService,
    openAdd,
    openEdit,
    closeEditor,
    removeService,
    upsertService,
    resetAll,
    load,
  };
}
