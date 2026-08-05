<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faTemperatureArrowUp,
  faTemperatureArrowDown,
  faPersonSwimming,
  faPersonSkiing,
  faDroplet,
  faDropletSlash,
  faSun,
  faCloudSun,
  faCloud,
} from '@fortawesome/free-solid-svg-icons'
import DashboardNav from '@/components/exercise/DashboardNav.vue'
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

// ===== 항목별 아이콘 =====
// 판정은 항상 섭씨 원본값으로 한다 (화씨로 표시 중이어도 기준이 흔들리지 않도록)
const HOT_STANDARD = 25 // WeatherCard의 더움/선선함 기준과 동일
const HUMID_STANDARD = 70

const isHot = computed(() => weatherData.value.main.temp >= HOT_STANDARD)
const isFeelsHot = computed(() => weatherData.value.main.feels_like >= HOT_STANDARD)
const isHumid = computed(() => weatherData.value.main.humidity >= HUMID_STANDARD)

// 구름량 -> 맑음 / 구름 조금 / 흐림
const cloudIcon = computed(() => {
  const clouds = weatherData.value.clouds.all

  if (clouds < 20) return { icon: faSun, color: 'rgb(255, 129, 9)' }
  if (clouds < 70) return { icon: faCloudSun, color: 'rgb(247, 181, 56)' }

  return { icon: faCloud, color: 'rgb(129, 139, 165)' }
})

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
    <!--대시보드 네비게이션 (홈/About과 같은 위치/크기로 보이도록 최상단에 배치) -->
    <DashboardNav />

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

      <!-- 상세 항목: 세 영역을 가로 3열로 배치 -->
      <div class="detail-sections">
        <!-- 기온 -->
        <section>
          <h2 class="section-title">기온</h2>
          <div class="weather-detail-card">
            <p>
              <strong>현재 기온</strong>
              <FontAwesomeIcon
                class="item-icon"
                :icon="isHot ? faTemperatureArrowUp : faTemperatureArrowDown"
                :style="{ color: isHot ? 'rgb(225, 51, 51)' : 'rgb(61, 77, 247)' }"
              />
              <span class="item-value">{{ temp }}{{ unitSymbol }}</span>
            </p>

            <p>
              <strong>체감 온도</strong>
              <FontAwesomeIcon
                class="item-icon"
                :icon="isFeelsHot ? faPersonSwimming : faPersonSkiing"
                :style="{ color: isFeelsHot ? 'rgb(225, 51, 51)' : 'rgb(61, 77, 247)' }"
              />
              <span class="item-value">{{ feelsLike }}{{ unitSymbol }}</span>
            </p>
          </div>
        </section>

        <!-- 대기 상태 -->
        <section>
          <h2 class="section-title">대기 상태</h2>
          <div class="weather-detail-card">
            <p>
              <strong>습도</strong>
              <FontAwesomeIcon
                class="item-icon"
                :icon="isHumid ? faDroplet : faDropletSlash"
                :style="{ color: isHumid ? 'rgb(56, 132, 247)' : 'rgb(150, 158, 175)' }"
              />
              <span class="item-value">{{ weatherData.main.humidity }}%</span>
            </p>

            <p>
              <strong>구름량</strong>
              <FontAwesomeIcon
                class="item-icon"
                :icon="cloudIcon.icon"
                :style="{ color: cloudIcon.color }"
              />
              <span class="item-value">{{ weatherData.clouds.all }}%</span>
            </p>

            <p v-if="rainVolume !== null">
              <strong>1시간 강수량</strong>
              <span class="item-value">{{ rainVolume }} mm</span>
            </p>
          </div>
        </section>

        <!-- 바람 (아래 줄 전체를 차지) -->
        <section class="wind-section">
          <h2 class="section-title">바람</h2>
          <div class="weather-detail-card">
            <p><strong>풍속</strong> {{ weatherData.wind.speed }} m/s</p>
            <p><strong>풍향</strong> {{ windDirection }} ({{ weatherData.wind.deg }}°)</p>
            <p v-if="weatherData.wind.gust">
              <strong>돌풍</strong> {{ weatherData.wind.gust }} m/s
            </p>
          </div>
        </section>
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
  /* 위쪽 여백은 홈(.weather-container)과 맞춰 내비가 같은 높이에 오게 한다 */
  padding: 20px 24px 56px;
  box-sizing: border-box;
  color: var(--text-main);
  background:
    radial-gradient(circle at 15% 10%, rgba(233, 213, 255, 0.55), transparent 30%),
    radial-gradient(circle at 85% 20%, rgba(196, 181, 253, 0.3), transparent 28%),
    linear-gradient(135deg, #fcfaff, #f7f2ff);
}

.detail-container > div {
  width: min(800px, 100%);
  margin: 0 auto;
}

h1 {
  margin: 0 0 22px;
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

  min-height: 210px;
  padding: 26px 30px;

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
  top: 22px;
  width: 200px;
  animation-duration: 26s;
}

.cloud-2 {
  top: 84px;
  width: 260px;
  opacity: 0.75;
  animation-duration: 34s;
  animation-delay: -12s;
}

.cloud-3 {
  top: 142px;
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
  top: 48px;
  animation-duration: 9s;
}

.haze-2 {
  top: 100px;
  opacity: 0.8;
  animation-duration: 12s;
  animation-delay: -4s;
}

.haze-3 {
  top: 152px;
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
  margin: 8px 0 0;

  color: black;
  font-size: clamp(48px, 6vw, 66px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -4px;

  text-shadow: 0 6px 18px rgba(80, 94, 105, 0.16);
}

.widget-unit {
  margin-left: 4px;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 0;
  vertical-align: super;
}

.widget-desc {
  margin: 6px 0 0;
  color: black;
  font-size: 19px;
  font-weight: 700;
}

.widget-feels {
  width: fit-content;
  margin: 12px 0 0;
  padding: 6px 13px;

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
/* 기온 / 대기 상태는 2열로 나란히, 바람은 그 아래 한 줄 전체 (카드 높이는 각자 내용만큼) */
.detail-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.wind-section {
  grid-column: 1 / -1;
}

/* 바람은 폭이 넓으므로 항목(2~3개)을 한 줄에 가로로 나열한다 */
.wind-section .weather-detail-card {
  display: flex;
  flex-direction: row;
}

.wind-section .weather-detail-card p {
  flex: 1;
}

/* 카드 안 항목은 가로 2열 (항목 안에서는 라벨과 값이 가로로 마주본다) */
.weather-detail-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
  padding: 15px 15px;
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

/* 항목 안은 라벨 -> 아이콘 -> 값 순으로 세로 배치 */
.weather-detail-card p {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  min-height: 112px;
  margin: 0px;
  padding: 12px 16px;
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

/* 라벨 / 아이콘 / 값 3열 배치 (아이콘이 없는 항목은 라벨과 값이 양 끝으로 간다) */
.item-icon {
  font-size: 28px;
}

.item-value {
  white-space: nowrap;
}

/* 섹션 제목 */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 26px 0 10px;
  color: black;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.section-title::before {
  width: 7px;
  height: 19px;
  border-radius: 999px;
  background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
  content: '';
}

/* 이전 페이지 버튼 */
button {
  display: block;
  min-width: 150px;
  height: 44px;
  margin: 30px auto 0;
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
    padding: 20px 18px 44px;
  }

  h1 {
    margin-bottom: 18px;
  }

  .weather-widget {
    min-height: 190px;
    padding: 22px 20px;
  }

  /* 2열을 유지하기엔 열이 너무 좁아 세로로 쌓는다 */
  .detail-sections {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .weather-detail-card {
    padding: 14px;
  }
}

/* 모바일 */
@media (max-width: 520px) {
  .detail-container {
    padding: 20px 14px 36px;
  }

  h1 {
    font-size: 26px;
    letter-spacing: -0.8px;
  }

  .weather-widget {
    min-height: 180px;
    padding: 20px 18px;
    border-radius: 22px;
  }

  .widget-city {
    font-size: 18px;
  }

  .widget-desc {
    font-size: 18px;
  }

  .section-title {
    margin-top: 22px;
    font-size: 18px;
  }

  /* 폭이 좁아 항목을 한 줄에 두면 글자가 잘리므로 이때만 세로로 쌓는다 */
  .weather-detail-card {
    grid-template-columns: 1fr;
    padding: 12px;
    border-radius: 18px;
  }

  .wind-section .weather-detail-card {
    flex-direction: column;
  }

  .weather-detail-card p {
    min-height: 86px;
    padding: 10px 13px;
    font-size: 14px;
  }

  button {
    width: 100%;
    margin-top: 24px;
  }
}
</style>
