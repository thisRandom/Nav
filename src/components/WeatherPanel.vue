<script setup>
import { ref, onMounted } from 'vue';
import { CloudFog, Sun, Cloud, CloudRain, Droplets } from 'lucide-vue-next';

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
        <CloudFog v-if="weatherData.weather.includes('雾')" class="w-6 h-6 animate-pulse" />
        <Sun v-else-if="weatherData.weather.includes('晴')" class="w-6 h-6 text-yellow-400" />
        <CloudRain v-else-if="weatherData.weather.includes('雨')" class="w-6 h-6 text-blue-400" />
        <Cloud v-else class="w-6 h-6 text-white/60" />
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