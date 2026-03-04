<script setup>
import { ref, onMounted } from 'vue';
// 导入更丰富的天气图标
import {
  Sun, Cloud, CloudRain, CloudLightning, Snowflake,
  CloudFog, Wind, Droplets, CloudDrizzle, CloudSun
} from 'lucide-vue-next';

const weatherData = ref({ temp: '--', weather: '...', city: '--', humidity: '--' });

const fetchWeather = async () => {
  try {
    const res = await fetch('http://192.168.100.1:5000/api/weather');
    const data = await res.json();
    if (!data.error) {
      weatherData.value = data;
    }
  } catch (e) {
    console.error("天气获取失败");
  }
};

onMounted(() => {
  fetchWeather();
  setInterval(fetchWeather, 1800000);
});
</script>

<template>
  <div class="fixed top-6 right-8 z-10 pointer-events-none">
    <div class="flex items-center gap-3 px-3 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto ring-1 ring-white/5 hover:bg-black/50 transition-all duration-300 group">

      <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/80 group-hover:scale-110 transition-transform duration-500">

        <CloudLightning v-if="weatherData.weather.includes('雷')" class="w-6 h-6 text-purple-400 animate-bounce" />

        <template v-else-if="weatherData.weather.includes('雨')">
          <CloudRain v-if="weatherData.weather.includes('大') || weatherData.weather.includes('暴')" class="w-6 h-6 text-blue-500" />
          <CloudDrizzle v-else class="w-6 h-6 text-blue-300" />
        </template>

        <Snowflake v-else-if="weatherData.weather.includes('雪')" class="w-6 h-6 text-indigo-200 animate-spin-slow" />

        <CloudFog v-else-if="weatherData.weather.includes('雾') || weatherData.weather.includes('霾')" class="w-6 h-6 text-gray-400 animate-pulse" />

        <Wind v-else-if="weatherData.weather.includes('风') || weatherData.weather.includes('尘')" class="w-6 h-6 text-teal-200" />

        <Sun v-else-if="weatherData.weather === '晴'" class="w-6 h-6 text-yellow-400" />

        <CloudSun v-else-if="weatherData.weather.includes('多云')" class="w-6 h-6 text-white/80" />
        <Cloud v-else-if="weatherData.weather.includes('阴')" class="w-6 h-6 text-white/50" />

        <Cloud v-else class="w-6 h-6 text-white/30" />
      </div>

      <div class="flex flex-col justify-center border-l border-white/10 pl-3">
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold text-white tracking-tighter leading-none">{{ weatherData.temp }}°</span>
          <span class="text-[11px] font-bold text-white/80 leading-none">{{ weatherData.weather }}</span>
        </div>

        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">{{ weatherData.city }}</span>
          <div class="w-1 h-1 rounded-full bg-white/10"></div>
          <div class="flex items-center gap-1">
            <Droplets class="w-2.5 h-2.5 text-blue-400/60" />
            <span class="text-[9px] font-bold text-blue-400/60">{{ weatherData.humidity }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-1.5 flex justify-end pr-1 overflow-hidden">
        <span class="text-[8px] text-white/10 uppercase tracking-[0.3em] font-light group-hover:text-green-500/30 transition-colors">
          HP-NODE-01
        </span>
    </div>
  </div>
</template>

<style scoped>
/* 增加一个超慢速旋转，给雪花用 */
.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>