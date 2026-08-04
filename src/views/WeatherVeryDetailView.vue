<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { getCurrentWeatherByCoords } from '@/api/weather'

const route = useRoute()
const router = useRouter()

const configStore = useConfigStore()

const cityName = ref('')
const weatherData = ref(null) // API 원본 응답 (상세 항목을 그대로 활용)
const isLoading = ref(true)

onMounted(async () => {
  const name = route.params.cityName
  const lat = Number(route.query.lat)
  const lon = Number(route.query.lon)

  if (!name || Number.isNaN(lat) || Number.isNaN(lon)) {
    router.replace({ name: 'NotFound' })
    return
  }

  try {
    cityName.value = name
    weatherData.value = await getCurrentWeatherByCoords(lat, lon)
  } catch (error) {
    // 좌표 조회 실패
    router.replace({ name: 'NotFound' })
  } finally {
    isLoading.value = false
  }
})

// 현재 단위 기호
const unitSymbol = computed(() => (configStore.unit === 'fahrenheit' ? '°F' : '°C'))

// API는 항상 섭씨(metric)로 받아오므로, 표시 직전에 현재 단위로 변환한다
const convertTemp = (celsius) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32)
  }

  return Math.round(celsius)
}

// 날씨 상태 (한글 설명)
const description = computed(() => weatherData.value.weather[0].description)

// OpenWeather의 weather.main -> 위젯 배경 연출 종류
const weatherKind = computed(() => {
  const main = weatherData.value.weather[0].main

  if (main === 'Clear') return 'clear'
  if (main === 'Snow') return 'snow'
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return 'rain'
  if (['Mist', 'Fog', 'Haze', 'Smoke', 'Dust', 'Sand'].includes(main)) return 'mist'

  return 'clouds' // Clouds 및 그 외
})

// 아이콘 코드가 n으로 끝나면 밤 (배경 톤을 살짝 낮춘다)
const isNight = computed(() => weatherData.value.weather[0].icon.endsWith('n'))

// 기온 관련
const temp = computed(() => convertTemp(weatherData.value.main.temp))
const feelsLike = computed(() => convertTemp(weatherData.value.main.feels_like))

// 풍향(각도) -> 8방위 한글 표기
const WIND_DIRECTIONS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']

const windDirection = computed(() => {
  const deg = weatherData.value.wind.deg

  return WIND_DIRECTIONS[Math.round(deg / 45) % 8]
})

// 최근 1시간 강수량 (비가 올 때만 응답에 포함됨)
const rainVolume = computed(() => weatherData.value.rain?.['1h'] ?? null)
</script>

<template>
  <div class="detail-container">
    <div v-if="weatherData">
      <h1>{{ cityName }}</h1>

      <!-- 현재 날씨 위젯: 배경 연출이 현재 날씨에 따라 바뀐다 -->
      <div class="weather-widget" :class="[weatherKind, { night: isNight }]">
        <!-- 날씨별 배경 연출 (장식용이라 스크린리더에서는 제외) -->
        <div class="widget-scene" aria-hidden="true">
          <!-- 맑음: 은은한 햇무리 (밤에는 달빛 톤) -->
          <span v-if="weatherKind === 'clear'" class="scene-sun"></span>

          <!-- 구름/비/눈: 흘러가는 구름 -->
          <template v-if="['clouds', 'rain', 'snow'].includes(weatherKind)">
            <span
              v-for="cloud in 3"
              :key="`cloud-${cloud}`"
              class="scene-cloud"
              :class="`cloud-${cloud}`"
            ></span>
          </template>

          <!-- 비: 빗줄기 -->
          <template v-if="weatherKind === 'rain'">
            <span
              v-for="drop in 16"
              :key="`drop-${drop}`"
              class="scene-drop"
              :style="{
                left: `${drop * 6.2}%`,
                animationDelay: `${(drop % 6) * 0.22}s`,
              }"
            ></span>
          </template>

          <!-- 눈: 눈송이 -->
          <template v-if="weatherKind === 'snow'">
            <span
              v-for="flake in 14"
              :key="`snow-${flake}`"
              class="scene-snow"
              :style="{
                left: `${flake * 7}%`,
                animationDelay: `${(flake % 5) * 0.6}s`,
              }"
            ></span>
          </template>

          <!-- 안개: 흐르는 안개층 -->
          <template v-if="weatherKind === 'mist'">
            <span
              v-for="haze in 3"
              :key="`haze-${haze}`"
              class="scene-haze"
              :class="`haze-${haze}`"
            ></span>
          </template>
        </div>

        <div class="widget-body">
          <p class="widget-city">{{ cityName }}</p>

          <p class="widget-temp">
            {{ temp }}<span class="widget-unit">{{ unitSymbol }}</span>
          </p>

          <p class="widget-desc">{{ description }}</p>

          <p class="widget-feels">체감 {{ feelsLike }}{{ unitSymbol }}</p>
        </div>
      </div>

      <!-- 기온 -->
      <h2 class="section-title">기온</h2>
      <div class="weather-detail-card">
        <p><strong>현재 기온</strong> {{ temp }}{{ unitSymbol }}</p>
        <p><strong>체감 온도</strong> {{ feelsLike }}{{ unitSymbol }}</p>
      </div>

      <!-- 대기 상태 -->
      <h2 class="section-title">대기 상태</h2>
      <div class="weather-detail-card">
        <p><strong>습도</strong> {{ weatherData.main.humidity }}%</p>
        <p><strong>구름량</strong> {{ weatherData.clouds.all }}%</p>
        <p v-if="rainVolume !== null"><strong>1시간 강수량</strong> {{ rainVolume }} mm</p>
      </div>

      <!-- 바람 -->
      <h2 class="section-title">바람</h2>
      <div class="weather-detail-card">
        <p><strong>풍속</strong> {{ weatherData.wind.speed }} m/s</p>
        <p><strong>풍향</strong> {{ windDirection }} ({{ weatherData.wind.deg }}°)</p>
        <p v-if="weatherData.wind.gust"><strong>돌풍</strong> {{ weatherData.wind.gust }} m/s</p>
      </div>

      <button type="button" @click="router.back()">이전 페이지</button>
    </div>

    <p v-else-if="isLoading" class="loading-text">날씨 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.detail-container {
  --purple-50: #fcfaff;
  --purple-100: #f7f2ff;
  --purple-200: #f3e8ff;
  --purple-300: #e9d5ff;
  --purple-400: #ddd0f5;
  --purple-500: #c4b5fd;

  --text-main: #5f5968;
  --text-sub: #7b7483;
  --text-soft: #938b9d;

  min-height: 100vh;
  font-family: 'Pretendard', sans-serif;
  padding: 56px 24px 80px;
  box-sizing: border-box;
  color: var(--text-main);
  background:
    radial-gradient(circle at 15% 10%, rgba(233, 213, 255, 0.55), transparent 30%),
    radial-gradient(circle at 85% 20%, rgba(196, 181, 253, 0.3), transparent 28%),
    linear-gradient(135deg, #fcfaff, #f7f2ff);
}

.detail-container > div {
  width: min(860px, 100%);
  margin: 0 auto;
}

h1 {
  margin: 0 0 32px;
  color: black;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -1.2px;
  text-align: center;
}

/* ===========================
   현재 날씨 위젯
=========================== */
.weather-widget {
  position: relative;
  overflow: hidden;

  min-height: 270px;
  padding: 34px 36px;

  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 26px;
  box-sizing: border-box;

  /* 기본값(구름) - 아래 날씨별 클래스가 덮어쓴다 */
  background: linear-gradient(135deg, #e8ebee, #c9d0d6);

  box-shadow:
    0 18px 40px rgba(96, 110, 122, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);

  transition: background 0.6s ease;
}

/* 날씨별 배경 톤 (채도를 낮춘 실제 하늘색 계열) */

/* 맑음: 옅은 하늘색 */
.weather-widget.clear {
  background: linear-gradient(135deg, #d9ecf8, #aed3ea);
}

/* 흐림: 연한 회색 */
.weather-widget.clouds {
  background: linear-gradient(135deg, #e8ebee, #c9d0d6);
}

/* 비: 푸른 기가 도는 회색 */
.weather-widget.rain {
  background: linear-gradient(135deg, #d5dde3, #aebcc7);
}

/* 눈: 아주 옅은 청백색 */
.weather-widget.snow {
  background: linear-gradient(135deg, #f0f5f8, #d5e2ea);
}

/* 안개: 따뜻한 기가 도는 옅은 회색 */
.weather-widget.mist {
  background: linear-gradient(135deg, #e9e9e7, #cdcecb);
}

/* 밤에는 한 톤 낮춰서 표현 */
.weather-widget.night {
  filter: saturate(0.92) brightness(0.95);
}

/* 배경 연출 레이어 */
.widget-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* --- 맑음: 햇무리 --- */
.scene-sun {
  position: absolute;
  top: -45px;
  right: -35px;

  width: 200px;
  height: 200px;

  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 247, 219, 0.55) 42%,
    rgba(255, 247, 219, 0) 70%
  );

  animation: sunGlow 5s ease-in-out infinite alternate;
}

/* 밤이면 달빛처럼 작고 차갑게 */
.weather-widget.night .scene-sun {
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(226, 216, 255, 0.5) 45%,
    rgba(226, 216, 255, 0) 70%
  );
}

@keyframes sunGlow {
  from {
    transform: scale(1);
    opacity: 0.85;
  }
  to {
    transform: scale(1.12);
    opacity: 1;
  }
}

/* --- 구름 --- */
.scene-cloud {
  position: absolute;

  height: 60px;

  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  filter: blur(12px);

  animation-name: cloudDrift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.cloud-1 {
  top: 28px;
  width: 200px;
  animation-duration: 26s;
}

.cloud-2 {
  top: 104px;
  width: 260px;
  opacity: 0.75;
  animation-duration: 34s;
  animation-delay: -12s;
}

.cloud-3 {
  top: 180px;
  width: 170px;
  opacity: 0.6;
  animation-duration: 30s;
  animation-delay: -22s;
}

@keyframes cloudDrift {
  from {
    left: -280px;
  }
  to {
    left: 100%;
  }
}

/* --- 비 --- */
.scene-drop {
  position: absolute;
  top: -16px;

  width: 2px;
  height: 16px;

  border-radius: 999px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8));

  animation: dropFall 1.1s linear infinite;
}

@keyframes dropFall {
  0% {
    transform: translateY(0) rotate(12deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateY(300px) rotate(12deg);
    opacity: 0;
  }
}

/* --- 눈 --- */
.scene-snow {
  position: absolute;
  top: -12px;

  width: 7px;
  height: 7px;

  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);

  animation: snowFall 6s linear infinite;
}

@keyframes snowFall {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    transform: translate(26px, 300px);
    opacity: 0;
  }
}

/* --- 안개 --- */
.scene-haze {
  position: absolute;
  left: -20%;

  width: 140%;
  height: 42px;

  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  filter: blur(10px);

  animation-name: hazeDrift;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.haze-1 {
  top: 62px;
  animation-duration: 9s;
}

.haze-2 {
  top: 130px;
  opacity: 0.8;
  animation-duration: 12s;
  animation-delay: -4s;
}

.haze-3 {
  top: 196px;
  opacity: 0.6;
  animation-duration: 15s;
  animation-delay: -8s;
}

@keyframes hazeDrift {
  from {
    transform: translateX(-24px);
  }
  to {
    transform: translateX(24px);
  }
}

/* 배경 연출 위에 올라가는 실제 내용 */
.widget-body {
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.widget-city {
  margin: 0;
  color: black;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.widget-temp {
  margin: 12px 0 0;

  color: black;
  font-size: clamp(58px, 8vw, 82px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -4px;

  text-shadow: 0 6px 18px rgba(80, 94, 105, 0.16);
}

.widget-unit {
  margin-left: 4px;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 0;
  vertical-align: super;
}

.widget-desc {
  margin: 8px 0 0;
  color: black;
  font-size: 21px;
  font-weight: 700;
}

.widget-feels {
  width: fit-content;
  margin: 18px 0 0;
  padding: 8px 15px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(8px);

  color: black;
  font-size: 14px;
  font-weight: 600;
}

/* 움직임 최소화를 선호하는 사용자는 애니메이션 정지 */
@media (prefers-reduced-motion: reduce) {
  .scene-sun,
  .scene-cloud,
  .scene-drop,
  .scene-snow,
  .scene-haze {
    animation: none;
  }
}

/* 상세 카드 */
.weather-detail-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 24px 28px;
  border: 1px solid rgba(196, 181, 253, 0.45);
  border-radius: 22px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f3e8ff, #d9d0ff);
  box-shadow:
    0 14px 34px rgba(151, 132, 180, 0.1),
    0 4px 12px rgba(151, 132, 180, 0.05);
  backdrop-filter: blur(14px);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.weather-detail-card:hover {
  transform: translateY(-3px);
  border-color: rgba(196, 181, 253, 0.75);
  box-shadow:
    0 18px 40px rgba(151, 132, 180, 0.14),
    0 6px 16px rgba(151, 132, 180, 0.07);
}

.weather-detail-card p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  margin: 0;
  padding: 0 16px;
  border: 1px solid rgba(233, 213, 255, 0.55);
  border-radius: 14px;
  box-sizing: border-box;
  color: black;
  font-size: 16px;
  background-color: white;
}

.weather-detail-card strong {
  color: black;
  font-weight: 700;
}

/* 섹션 제목 */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 36px 0 14px;
  color: black;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.section-title::before {
  width: 7px;
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
  content: '';
}

/* 이전 페이지 버튼 */
button {
  display: block;
  min-width: 150px;
  height: 48px;
  margin: 42px auto 0;
  padding: 0 24px;
  border: 1px solid rgba(196, 181, 253, 0.65);
  border-radius: 14px;
  color: black;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
  box-shadow: 0 10px 24px rgba(151, 132, 180, 0.16);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  filter: brightness(1.03);
  box-shadow: 0 14px 28px rgba(151, 132, 180, 0.22);
}

button:active {
  transform: translateY(0);
}

button:focus-visible {
  outline: 3px solid rgba(196, 181, 253, 0.45);
  outline-offset: 4px;
}

/* 로딩 문구 */
.loading-text {
  width: fit-content;
  margin: 180px auto 0;
  padding: 20px 28px;
  border: 1px solid rgba(196, 181, 253, 0.5);
  border-radius: 16px;
  color: #716779;
  font-size: 16px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 34px rgba(151, 132, 180, 0.12);
}

/* 태블릿 */
@media (max-width: 768px) {
  .detail-container {
    padding: 38px 18px 60px;
  }

  h1 {
    margin-bottom: 24px;
  }

  .weather-widget {
    min-height: 240px;
    padding: 28px 24px;
  }

  .weather-detail-card {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}

/* 모바일 */
@media (max-width: 520px) {
  .detail-container {
    padding: 28px 14px 48px;
  }

  h1 {
    font-size: 26px;
    letter-spacing: -0.8px;
  }

  .weather-widget {
    min-height: 220px;
    padding: 24px 20px;
    border-radius: 22px;
  }

  .widget-city {
    font-size: 18px;
  }

  .widget-desc {
    font-size: 19px;
  }

  .section-title {
    margin-top: 30px;
    font-size: 19px;
  }

  .weather-detail-card {
    padding: 16px;
    border-radius: 18px;
  }

  .weather-detail-card p {
    min-height: 50px;
    padding: 0 13px;
    font-size: 14px;
  }

  button {
    width: 100%;
    margin-top: 34px;
  }
}
</style>
