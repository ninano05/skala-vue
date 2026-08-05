<script setup>
import { computed, onMounted, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUmbrella, faLocationDot, faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import DashboardNav from '@/components/exercise/DashboardNav.vue'
import { getForecastByCoords } from '@/api/weather'

// 위치를 못 얻었을 때 사용할 기본 좌표
const DEFAULT_LOCATION = { lat: 37.5666791, lon: 126.9782914 }

const status = ref('loading') // loading | ready | error
const locationName = ref('')
const fallbackReason = ref('') // 현재 위치 대신 기본 위치를 쓰게 된 이유
const isNextRange = ref(false) // 오늘 남은 예보가 없어 앞으로 12시간을 보여주는 경우
const slots = ref([])

// 브라우저 위치 조회를 Promise로 감싼다 (실패 시 사유를 문구로 바꿔 전달)
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저가 위치 정보를 지원하지 않아'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('위치 권한이 거부되어'))
          return
        }

        if (error.code === error.TIMEOUT) {
          reject(new Error('위치 확인이 지연되어'))
          return
        }

        reject(new Error('위치를 확인할 수 없어'))
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  })
}

// 예보 응답 -> 화면에서 쓰는 슬롯 목록 (시각은 그 지역 현지 시각으로 변환)
const toLocalSlots = (data) => {
  const offset = data.city.timezone

  return data.list.map((item) => {
    // 유닉스 시각에 지역 오프셋을 더한 뒤 UTC 게터로 읽으면 현지 시각이 된다
    const local = new Date((item.dt + offset) * 1000)

    return {
      key: item.dt,
      dateKey: `${local.getUTCFullYear()}-${local.getUTCMonth()}-${local.getUTCDate()}`,
      hour: local.getUTCHours(),
      pop: Math.round((item.pop ?? 0) * 100),
      rain: item.rain?.['3h'] ?? 0,
      description: item.weather[0].description,
    }
  })
}

const load = async () => {
  status.value = 'loading'
  fallbackReason.value = ''
  isNextRange.value = false

  let coords = DEFAULT_LOCATION

  try {
    coords = await getCurrentPosition()
  } catch (error) {
    fallbackReason.value = error.message
  }

  try {
    const data = await getForecastByCoords(coords.lat, coords.lon)
    const localSlots = toLocalSlots(data)

    // 예보 목록에는 미래 시각만 들어있으므로, 오늘 날짜만 고르면 '오늘 남은 시간'이 된다
    const nowLocal = new Date(Date.now() + data.city.timezone * 1000)
    const todayKey = `${nowLocal.getUTCFullYear()}-${nowLocal.getUTCMonth()}-${nowLocal.getUTCDate()}`
    const today = localSlots.filter((slot) => slot.dateKey === todayKey)

    // 늦은 밤이라 오늘 남은 예보가 없으면 앞으로 12시간(3시간 x 4)으로 대체한다
    isNextRange.value = today.length === 0
    slots.value = today.length > 0 ? today : localSlots.slice(0, 4)

    locationName.value = data.city.name
    status.value = 'ready'
  } catch (error) {
    console.error('[예보 조회 실패]', error)
    status.value = 'error'
  }
}

onMounted(load)

// 구간 중 가장 높은 강수 확률을 대표값으로 쓴다
// 평균을 쓰면 '저녁에만 강하게 온다' 같은 신호가 묻힌다
const chance = computed(() => {
  if (slots.value.length === 0) return 0

  return Math.max(...slots.value.map((slot) => slot.pop))
})

// 예상 강수량 합계 (소수 첫째 자리까지)
const totalRain = computed(() => {
  const sum = slots.value.reduce((acc, slot) => acc + slot.rain, 0)

  return Math.round(sum * 10) / 10
})

const advice = computed(() => {
  if (chance.value >= 70) {
    return { level: 'high', title: '우산 꼭 챙기세요', desc: '비가 올 가능성이 높습니다.' }
  }

  if (chance.value >= 40) {
    return { level: 'medium', title: '챙기는 게 좋아요', desc: '비가 올 수도 있습니다.' }
  }

  if (chance.value >= 20) {
    return { level: 'low', title: '접이식이면 충분해요', desc: '약하게 지나갈 수 있습니다.' }
  }

  return { level: 'none', title: '우산 없어도 돼요', desc: '비 소식이 거의 없습니다.' }
})

const rangeLabel = computed(() => (isNextRange.value ? '앞으로 12시간' : '오늘 남은 시간'))
</script>

<template>
  <div class="umbrella-container">
    <DashboardNav />

    <div class="umbrella-content">
      <h1>오늘 우산 챙길까?</h1>

      <p v-if="status === 'loading'" class="loading-text">강수 확률을 확인하는 중입니다...</p>

      <template v-else-if="status === 'ready'">
        <!-- 대표 확률 -->
        <div class="chance-card" :class="advice.level">
          <FontAwesomeIcon :icon="faUmbrella" class="chance-icon" />

          <p class="chance-value">{{ chance }}<span class="chance-unit">%</span></p>

          <p class="chance-title">{{ advice.title }}</p>
          <p class="chance-desc">{{ advice.desc }}</p>

          <p class="chance-meta">
            <FontAwesomeIcon :icon="faLocationDot" />
            {{ locationName }} · {{ rangeLabel }} 기준
          </p>
        </div>

        <!-- 위치를 못 얻어 기본 위치를 쓴 경우 안내 -->
        <p v-if="fallbackReason" class="fallback-text">
          {{ fallbackReason }} 서울 기준으로 보여드립니다.
        </p>

        <!-- 시간대별 확률 -->
        <h2 class="section-title">시간대별 강수 확률</h2>
        <ul class="slot-list">
          <li v-for="slot in slots" :key="slot.key" class="slot-item">
            <span class="slot-hour">{{ slot.hour }}시</span>

            <span class="slot-bar">
              <span class="slot-bar-fill" :style="{ width: `${slot.pop}%` }"></span>
            </span>

            <span class="slot-pop">{{ slot.pop }}%</span>
          </li>
        </ul>

        <p class="rain-total">
          예상 강수량 합계 <strong>{{ totalRain }} mm</strong>
        </p>

        <button type="button" class="retry-btn" @click="load">
          <FontAwesomeIcon :icon="faArrowsRotate" />
          다시 확인
        </button>
      </template>

      <template v-else>
        <p class="loading-text">예보를 불러오지 못했습니다.</p>

        <button type="button" class="retry-btn" @click="load">
          <FontAwesomeIcon :icon="faArrowsRotate" />
          다시 시도
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.umbrella-container {
  min-height: 100vh;
  padding: 20px 24px 56px;
  box-sizing: border-box;
  font-family: 'Pretendard', sans-serif;
  color: #5f5968;
  background:
    radial-gradient(circle at 15% 10%, rgba(233, 213, 255, 0.55), transparent 30%),
    radial-gradient(circle at 85% 20%, rgba(196, 181, 253, 0.3), transparent 28%),
    linear-gradient(135deg, #fcfaff, #f7f2ff);
}

.umbrella-content {
  width: min(800px, 100%);
  margin: 30px auto;
}

h1 {
  margin: 0 0 22px;
  color: black;
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 800;
  letter-spacing: -1px;
  text-align: center;
}

/* 대표 확률 카드 */
.chance-card {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 32px 24px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 26px;
  box-sizing: border-box;

  background: linear-gradient(135deg, #eef2f6, #dfe6ec);
  box-shadow:
    0 18px 40px rgba(96, 110, 122, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.chance-card.high {
  background: linear-gradient(135deg, #cfdce6, #a9bccb);
}
.chance-card.medium {
  background: linear-gradient(135deg, #dce7f0, #c2d3e0);
}
.chance-card.low {
  background: linear-gradient(135deg, #e6eef4, #d3e0e9);
}
.chance-card.none {
  background: linear-gradient(135deg, #dfeefa, #b9dcf1);
}

.chance-icon {
  font-size: 34px;
  color: rgba(60, 70, 80, 0.55);
}

.chance-card.high .chance-icon {
  color: #3f6fa3;
}

.chance-value {
  margin: 10px 0 0;
  color: black;
  font-size: clamp(52px, 8vw, 72px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -3px;
}

.chance-unit {
  margin-left: 2px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0;
  vertical-align: super;
}

.chance-title {
  margin: 12px 0 0;
  color: black;
  font-size: 21px;
  font-weight: 800;
}

.chance-desc {
  margin: 6px 0 0;
  color: #4b4855;
  font-size: 15px;
}

.chance-meta {
  display: flex;
  align-items: center;
  gap: 6px;

  width: fit-content;
  margin: 16px 0 0;
  padding: 7px 14px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);

  color: black;
  font-size: 13px;
  font-weight: 600;
}

.fallback-text {
  margin: 12px 0 0;
  color: #7b7483;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
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

/* 시간대별 목록 */
.slot-list {
  margin: 0;
  padding: 18px 20px;
  list-style: none;

  border: 1px solid rgba(196, 181, 253, 0.45);
  border-radius: 15px;
  background: linear-gradient(135deg, #f3e8ff, #d9d0ff);
  box-shadow: 0 14px 34px rgba(151, 132, 180, 0.1);
}

.slot-item {
  display: flex;
  align-items: center;
  gap: 12px;

  min-height: 44px;
  padding: 0 14px;
  margin-bottom: 10px;

  border: 1px solid rgba(233, 213, 255, 0.55);
  border-radius: 10px;
  background-color: white;
  color: black;
  font-size: 15px;
}

.slot-item:last-child {
  margin-bottom: 0;
}

.slot-hour {
  width: 48px;
  font-weight: 700;
}

.slot-bar {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background-color: #eee9f8;
  overflow: hidden;
}

.slot-bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #a9c8e8, #6f9ec9);
  transition: width 0.3s ease;
}

.slot-pop {
  width: 46px;
  font-weight: 700;
  text-align: right;
}

.rain-total {
  margin: 14px 0 0;
  color: #5f5968;
  font-size: 14px;
  text-align: right;
}

.rain-total strong {
  color: black;
  font-weight: 700;
}

/* 다시 확인 버튼 */
.retry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-width: 150px;
  height: 44px;
  margin: 26px auto 0;
  padding: 0 24px;

  border: 1px solid rgba(196, 181, 253, 0.65);
  border-radius: 14px;
  background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
  box-shadow: 0 10px 24px rgba(151, 132, 180, 0.16);

  color: black;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(151, 132, 180, 0.22);
}

.retry-btn:active {
  transform: translateY(0);
}

/* 로딩 / 실패 문구 */
.loading-text {
  width: fit-content;
  margin: 120px auto 0;
  padding: 20px 28px;
  border: 1px solid rgba(196, 181, 253, 0.5);
  border-radius: 16px;
  color: #716779;
  font-size: 16px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 34px rgba(151, 132, 180, 0.12);
}

@media (max-width: 520px) {
  .umbrella-container {
    padding: 20px 14px 36px;
  }

  .chance-card {
    padding: 26px 18px;
  }

  .slot-list {
    padding: 14px;
  }

  .slot-item {
    gap: 8px;
    padding: 0 12px;
    font-size: 14px;
  }

  .retry-btn {
    width: 100%;
  }
}
</style>
