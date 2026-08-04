<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { getCurrentWeatherByCoords } from '@/api/weather'

const route = useRoute()
const router = useRouter()

const configStore = useConfigStore()

// 선택된 도시 객체
const selectedCity = ref(null)
const isLoading = ref(true)

// OpenWeather의 weather.main(영문)을 화면에서 쓰는 상태 문자열로 매핑
// (WeatherHomeView.vue와 동일한 로직 - 추후 공통 유틸로 분리 권장)
const mapConditionToStatus = (main) => {
  if (main === 'Clear') return '맑음'
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return '비'
  return '구름'
}

onMounted(async () => {
  const cityName = route.params.cityName
  const lat = Number(route.query.lat)
  const lon = Number(route.query.lon)

  if (!cityName || Number.isNaN(lat) || Number.isNaN(lon)) {
    router.replace({ name: 'NotFound' })
    return
  }

  try {
    const data = await getCurrentWeatherByCoords(lat, lon)

    selectedCity.value = {
      name: cityName,
      temp: Math.round(data.main.temp),
      status: mapConditionToStatus(data.weather[0].main),
    }
  } catch (error) {
    // 좌표 조회 실패
    router.replace({ name: 'NotFound' })
  } finally {
    isLoading.value = false
  }
})

// 썹시 화씨로 변환
const displayTemp = computed(() => {
  const rawTemp = selectedCity.value.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})

//현재 단위 기호
const unitSymbol = computed(() => {
  return configStore.unit === 'fahrenheit' ? '°F' : '°C'
})
</script>

<template>
  <div v-if="selectedCity" class="detail-container">
    <div>
      <h1>{{ selectedCity.name }} 상세 기상관측 정보</h1>
      <div class="weather-detail-card">
        <p>
          <strong>현재 날씨</strong>
          {{ selectedCity.status }}
        </p>
        <p>
          <strong>현재 기온</strong>
          {{ displayTemp }}{{ unitSymbol }}
        </p>
      </div>
    </div>
    <button type="button" @click="router.back()">이전 페이지</button>
  </div>
</template>

<style scoped>
.detail-container {
  min-height: 100vh;
  padding: 48px 20px;
  box-sizing: border-box;

  background:
    radial-gradient(circle at 15% 10%, rgba(196, 181, 253, 0.35), transparent 28%),
    linear-gradient(180deg, #f8f7ff 0%, #f3f1fb 100%);

  font-family: 'Pretendard', sans-serif;
  color: #272333;
}

/* 실제 콘텐츠 영역 */
.detail-container > div {
  width: min(800px, 100%);
  margin: 0 auto;
}

/* 페이지 제목 */
h1 {
  margin: 0 0 24px;
  color: #282333;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* 날씨 상세 카드 */
.weather-detail-card {
  padding: 28px;
  margin-bottom: 20px;

  background-color: rgba(255, 255, 255, 0.94);
  border: 1px solid #ddd6fe;
  border-radius: 18px;

  box-shadow:
    0 12px 30px rgba(76, 29, 149, 0.08),
    0 2px 8px rgba(15, 23, 42, 0.05);
}

/* 상세 정보 행 */
.weather-detail-card p {
  display: flex;
  justify-content: space-between;
  align-items: center;

  min-height: 56px;
  margin: 0;
  padding: 0 18px;

  background-color: #faf9ff;
  border: 1px solid #ede9fe;
  border-radius: 12px;

  color: #4b4655;
  font-size: 16px;
}

.weather-detail-card p + p {
  margin-top: 12px;
}

.weather-detail-card strong {
  color: #5b21b6;
  font-weight: 700;
}

/* 이전 페이지 버튼 */
button {
  display: block;
  margin-left: auto;
  padding: 11px 20px;

  border: 1px solid #c4b5fd;
  border-radius: 10px;

  background-color: white;
  color: #6d28d9;

  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.1);

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

button:hover {
  background-color: #f5f3ff;
  border-color: #a78bfa;
  transform: translateY(-1px);
  box-shadow: 0 7px 16px rgba(109, 40, 217, 0.16);
}

button:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .detail-container {
    padding: 30px 16px;
  }

  h1 {
    margin-bottom: 18px;
    font-size: 24px;
  }

  .weather-detail-card {
    padding: 18px;
  }

  .weather-detail-card p {
    min-height: auto;
    padding: 16px;
  }
}
</style>
