import {ref} from 'vue';

const PROBE_URL = 'http://192.168.10.10/';
const PROBE_TIMEOUT = 1500;

const isInternal = ref(false);
let _detecting = null;

/**
 * 探测内网是否可达，结果写入 isInternal
 * 多次调用只执行一次探测，后续调用返回同一个 Promise
 */
export async function detectNetwork() {
    if (_detecting) return _detecting;

    _detecting = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
        try {
            await fetch(PROBE_URL, {method: 'HEAD', mode: 'no-cors', signal: controller.signal});
            isInternal.value = true;
        } catch {
            isInternal.value = false;
        } finally {
            clearTimeout(timeoutId);
        }
    })();

    return _detecting;
}

/** 强制重新探测（清除缓存的 Promise） */
export async function redetectNetwork() {
    _detecting = null;
    return detectNetwork();
}

/** 模块加载时立即探测（不会阻塞模块初始化） */
detectNetwork();

export {isInternal};
