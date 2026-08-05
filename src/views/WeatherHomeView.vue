<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import DashboardNav from '../components/exercise/DashboardNav.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import WeatherAnimation from '../components/exercise/WeatherAnimation.vue'
import {
  getCurrentWeather,
  geocodeCity,
  getCurrentWeatherByCoords,
  searchCities,
} from '@/api/weather'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useHomeResetStore } from '@/stores/homeResetStore'

// 라우터 설정
const router = useRouter()

// 반응형 데이터 최상단 부모 소유
const searchKeyword = ref('')
const selectedCity = ref('')
const selectedWeather = ref('')
const isLoading = ref(false)
// 최초 진입 로딩 (검색용 isLoading과 분리 - 검색 중에는 화면을 통째로 가리지 않는다)
const isInitialLoading = ref(true)

// 초기 화면에 보여줄 기본 도시 (query: OpenWeather 조회용, name: 화면 표시용)
const DEFAULT_CITIES = [
  { id: 'city_01', query: 'Seoul,KR', name: '서울' },
  { id: 'city_02', query: 'Busan,KR', name: '부산' },
  { id: 'city_03', query: 'Suwon,KR', name: '수원' },
  { id: 'city_04', query: 'Incheon,KR', name: '인천' },
  { id: 'city_05', query: 'Daejeon,KR', name: '대전' },
  { id: 'city_06', query: 'Daegu,KR', name: '대구' },
  { id: 'city_07', query: 'Gwangju,KR', name: '광주' },
  { id: 'city_08', query: 'Ulsan,KR', name: '울산' },
  { id: 'city_09', query: 'Jeju,KR', name: '제주' },
]

// OpenWeather의 weather.main(영문)을 화면에서 쓰는 상태 문자열로 매핑
const mapConditionToStatus = (main) => {
  if (main === 'Clear') return '맑음'
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return '비'
  return '구름' // Clouds, Snow, Mist, Fog 등은 구름으로 통일 표시
}

// OpenWeather 응답 -> 화면에서 쓰는 도시 객체로 변환
// lat/lon은 응답(data.coord)에서 그대로 뽑아써서, 이름 조회든 좌표 조회든 상세 페이지 재조회 방식을 통일한다
const toCityItem = (id, name, data) => ({
  id,
  name,
  lat: data.coord.lat,
  lon: data.coord.lon,
  temp: Math.round(data.main.temp),
  status: mapConditionToStatus(data.weather[0].main),
})

// 데이터셋 (OpenWeatherAPI에서 받아온 데이터로 채워짐)
const weatherList = ref([])

// 초기 진입 시 기본 도시들의 날씨를 API로 불러오기
const loadInitialWeather = async () => {
  isLoading.value = true
  try {
    const results = await Promise.all(DEFAULT_CITIES.map((city) => getCurrentWeather(city.query)))

    weatherList.value = results.map((data, index) =>
      toCityItem(DEFAULT_CITIES[index].id, DEFAULT_CITIES[index].name, data),
    )
  } catch (error) {
    console.error('[초기 날씨 조회 실패]', error)
  } finally {
    isLoading.value = false
    isInitialLoading.value = false
    lastLoadedAt = Date.now()
  }
}

onMounted(loadInitialWeather)

// ===== 오래된 날씨 갱신 =====
// KeepAlive로 홈이 계속 살아있어 화면을 오래 켜두면 데이터가 낡는다
const REFRESH_INTERVAL = 60 * 60 * 1000 // 1시간이 지나면 다시 조회
const STALE_CHECK_INTERVAL = 5 * 60 * 1000 // 5분마다 경과 시간만 확인

let lastLoadedAt = 0
let staleCheckTimer = null

// 검색으로 추가한 도시까지 포함해 현재 목록 그대로 다시 조회한다 (기본 9개로 되돌리지 않도록)
const refreshWeatherList = async () => {
  const cities = weatherList.value

  if (cities.length === 0) return

  try {
    const results = await Promise.all(
      cities.map((city) => getCurrentWeatherByCoords(city.lat, city.lon)),
    )

    weatherList.value = results.map((data, index) =>
      toCityItem(cities[index].id, cities[index].name, data),
    )

    lastLoadedAt = Date.now()
  } catch (error) {
    // 실패하면 기존 값을 그대로 유지하고 다음 확인 때 다시 시도한다
    console.error('[날씨 갱신 실패]', error)
  }
}

const refreshIfStale = () => {
  if (isInitialLoading.value) return
  if (document.visibilityState !== 'visible') return // 안 보이는 탭에서는 호출하지 않는다
  if (Date.now() - lastLoadedAt < REFRESH_INTERVAL) return

  refreshWeatherList()
  loadFavoriteWeather()
}

onMounted(() => {
  document.addEventListener('visibilitychange', refreshIfStale)
  staleCheckTimer = setInterval(refreshIfStale, STALE_CHECK_INTERVAL)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', refreshIfStale)
  clearInterval(staleCheckTimer)
})

// 상세보기 등에서 돌아왔을 때도 확인한다 (KeepAlive라 재마운트되지 않는다)
onActivated(refreshIfStale)

// 즐겨찾기
const favoriteStore = useFavoriteStore()

// 스토어에는 식별 정보만 저장해둠 -> 화면에 뿌릴 정보는 다시 조회해서 채움
const favoriteWeatherList = ref([])
const isFavoriteLoading = ref(false)

const loadFavoriteWeather = async () => {
  const favorites = favoriteStore.favorites

  if (favorites.length === 0) {
    favoriteWeatherList.value = []
    return
  }

  isFavoriteLoading.value = true
  try {
    const results = await Promise.all(
      favorites.map((city) => getCurrentWeatherByCoords(city.lat, city.lon)),
    )

    favoriteWeatherList.value = results.map((data, index) =>
      toCityItem(favorites[index].id, favorites[index].name, data),
    )
  } catch (error) {
    console.error('[즐겨찾기 날씨 조회 실패]', error)
  } finally {
    isFavoriteLoading.value = false
  }
}

// 즐겨찾기가 추가/삭제될 때, 그리고 화면에 처음 진입할 때(immediate) 날씨를 다시 불러온다
// 상세보기에서 돌아오면 이 컴포넌트가 새로 마운트되어 favoriteWeatherList가 비므로 immediate가 필요하다
watch(() => favoriteStore.favorites, loadFavoriteWeather, { deep: true, immediate: true })

// SearchBar의 update-query 이벤트 핸들러 (검색어 갱신)
const updateQuery = (keyword) => {
  searchKeyword.value = keyword
}

// 대시보드의 Weather Home 버튼: 검색 상태를 비워 홈 전체 화면으로 되돌린다 (라우팅은 DashboardNav가 담당)
const resetHome = () => {
  searchKeyword.value = ''
  suggestions.value = []
  selectedCity.value = ''
  selectedWeather.value = ''
}

// 상세/About 페이지에서 눌러도 초기화되도록, 스토어의 신호를 받아 처리한다
// (KeepAlive로 홈이 살아있어 라우팅만으로는 초기화되지 않는다)
const homeResetStore = useHomeResetStore()

watch(() => homeResetStore.resetToken, resetHome)

// WeatherCard의 click-detail 이벤트 핸들러 -> detailView로 라우팅 (상세보기 버튼)
const detail = (city) => {
  router.push({
    name: 'WeatherVeryDetailView',
    params: {
      cityName: city.name,
    },
    query: {
      lat: city.lat,
      lon: city.lon,
    },
  })
}

// 스크롤 목적지를 계산하기 위한 화면 최상단 컨테이너
const containerRef = ref(null)

// WeatherCard의 select-card 이벤트 핸들러 (현재 선택 도시 업데이트)
// 선택하면 SearchBar 옆 애니메이션이 바뀌므로, 그 변화가 보이도록 화면을 위로 올린다
const selectCity = (city) => {
  selectedCity.value = city.name
  selectedWeather.value = city.status

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 헤더가 세로로 길어지는 폭(850px 이하)에서는 헤더까지 올리면 화면을 많이 낭비하므로
  // 헤더 바로 아래(내용 시작점)까지만 올린다
  const isCompactHeader = window.matchMedia('(max-width: 850px)').matches
  const top =
    isCompactHeader && containerRef.value
      ? containerRef.value.getBoundingClientRect().top + window.scrollY
      : 0

  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

// ===== 검색어 자동완성 =====
const suggestions = ref([])
const isSuggestLoading = ref(false)

let debounceTimer = null
let requestId = 0 // 늦게 도착한 이전 응답이 최신 결과를 덮어쓰지 않도록 구분
let skipSuggestFetch = false // 후보 선택으로 검색어가 바뀐 경우를 구분

watch(searchKeyword, (keyword) => {
  clearTimeout(debounceTimer)

  // 후보를 골라서 검색어가 바뀐 경우엔 조회하지 않는다 (이미 고른 도시라 목록이 필요 없음)
  if (skipSuggestFetch) {
    skipSuggestFetch = false
    requestId += 1 // 진행 중이던 조회 결과가 뒤늦게 목록을 되살리지 않도록 무효화
    suggestions.value = []
    isSuggestLoading.value = false
    return
  }

  const trimmed = keyword.trim()

  if (trimmed === '') {
    suggestions.value = []
    isSuggestLoading.value = false
    return
  }

  isSuggestLoading.value = true

  // 타이핑할 때마다 API를 호출하지 않도록 입력이 멈춘 뒤에 조회한다
  debounceTimer = setTimeout(async () => {
    const currentId = ++requestId

    try {
      const results = await searchCities(trimmed)

      if (currentId === requestId) {
        suggestions.value = results
      }
    } catch (error) {
      console.error('[도시 자동완성 조회 실패]', error)

      if (currentId === requestId) {
        suggestions.value = []
      }
    } finally {
      if (currentId === requestId) {
        isSuggestLoading.value = false
      }
    }
  }, 300)
})

onUnmounted(() => clearTimeout(debounceTimer))

// SearchBar의 select-suggestion 이벤트 핸들러 (자동완성 후보 선택)
const selectSuggestion = async (city) => {
  suggestions.value = []

  // 선택한 도시명을 검색어로 남겨, 직접 입력 후 Enter를 눌렀을 때와 같이 해당 도시만 보이게 한다
  if (searchKeyword.value !== city.name) {
    skipSuggestFetch = true
    searchKeyword.value = city.name
  }

  // 이미 목록에 있는 도시면 API 재호출 없이 바로 선택
  const foundCity = weatherList.value.find((item) => item.name === city.name)

  if (foundCity) {
    selectedCity.value = foundCity.name
    selectedWeather.value = foundCity.status
    return
  }

  isLoading.value = true
  try {
    const data = await getCurrentWeatherByCoords(city.lat, city.lon)
    const newCity = toCityItem(city.id, city.name, data)

    weatherList.value = [...weatherList.value, newCity]
    selectedCity.value = newCity.name
    selectedWeather.value = newCity.status
  } catch (error) {
    console.error('[선택 도시 날씨 조회 실패]', error)
    alert('해당 도시의 날씨를 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 검색어가 입력된 상태인지 (검색 중에는 즐겨찾기 섹션을 숨겨 검색 결과에 집중시킨다)
const isSearching = computed(() => searchKeyword.value.trim() !== '')

// 검색한 키워드와 연관된 도시 필터링
const filteredWeatherList = computed(() => {
  const keyword = searchKeyword.value

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// 도시 검색 함수 (SearchBar의 search-city 이벤트로 호출)
// 서울(시) 강남(구) 대치(동) 이런 단위의 검색만 가능
const searchCity = async () => {
  const keyword = searchKeyword.value.trim()

  if (keyword === '') {
    return
  }

  // 이미 목록에 있는 도시면 API 재호출 없이 바로 선택
  const foundCity = weatherList.value.find((item) => item.name === keyword)

  if (foundCity) {
    selectedCity.value = foundCity.name
    selectedWeather.value = foundCity.status
    return
  }

  // 목록에 없는 도시면 Geocoding으로 위도/경도를 구한 뒤 그 좌표로 날씨 조회
  isLoading.value = true
  try {
    const location = await geocodeCity(keyword)

    // 카드에는 입력값이 아니라 API가 돌려준 정식 지명을 쓴다
    // (지오코딩이 특수문자를 무시하고 매칭하므로 입력값을 그대로 쓰면 '부산광역시!@#'처럼 남는다)
    const cityName = location.local_names?.ko ?? location.name

    // 정식 지명 기준으로 이미 목록에 있으면 재조회 없이 선택만 한다
    const existingCity = weatherList.value.find((item) => item.name === cityName)

    if (existingCity) {
      selectedCity.value = existingCity.name
      selectedWeather.value = existingCity.status
    } else {
      const data = await getCurrentWeatherByCoords(location.lat, location.lon)
      const newCity = toCityItem(`city_${Date.now()}`, cityName, data)

      weatherList.value = [...weatherList.value, newCity]
      selectedCity.value = newCity.name
      selectedWeather.value = newCity.status
    }

    // 카드 필터(item.name.includes(keyword))가 맞아떨어지도록 검색어도 정식 지명으로 맞춘다
    if (searchKeyword.value !== cityName) {
      skipSuggestFetch = true
      searchKeyword.value = cityName
    }
  } catch (error) {
    alert('해당 도시는 지원하지 않습니다.')
    selectedCity.value = ''
    selectedWeather.value = ''
    searchKeyword.value = ''
  } finally {
    isLoading.value = false
  }
}

// 상태 바 문구
const selectedCityInfo = computed(() => {
  if (isLoading.value) {
    return '날씨 정보를 불러오는 중입니다...'
  }

  if (selectedCity.value === '') {
    return '카드를 클릭하거나 검색해보세요.'
  }

  return `${selectedCity.value}이(가) 선택되었습니다.`
})

// 상태바 문구 변화시 콘솔 찍기
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[Watch 감지] 상태 바 문구가 업데이트 되었습니다 -> ${newValue}`)
})

// 검색어 타이핑 콘솔 찍기
watchEffect(() => {
  console.log(
    "[watchEffect 자동 호출] 현재 검색어 '",
    searchKeyword.value,
    "'에 매칭되는 API 데이터를 필터링합니다.",
  )
})
</script>

<template>
  <div ref="containerRef" class="weather-container">
    <!-- 최초 진입 로딩 중에는 화면 전체를 로딩 문구로 대체한다 -->
    <p v-if="isInitialLoading" class="loading-text">날씨 정보를 불러오는 중입니다...</p>

    <template v-else>
      <!--대시보드 네비게이션 -->
      <DashboardNav />

      <h1>한국 지역별 날씨 검색</h1>

      <!-- 도시 검색: slot 내부에 있지만 부모 스코프에서 컴파일되므로 직접 바인딩/통신 가능 -->
      <BaseDashboardCard>
        <div class="search-content-container">
          <SearchBar
            :keyword="searchKeyword"
            :suggestions="suggestions"
            :is-suggest-loading="isSuggestLoading"
            @update-query="updateQuery"
            @search-city="searchCity"
            @select-suggestion="selectSuggestion"
          />
          <WeatherAnimation :weather="selectedWeather" />
        </div>
      </BaseDashboardCard>

      <!-- 선택 도시 현황 상태 바 -->
      <BaseDashboardCard>
        <div class="status-bar">
          <p>{{ selectedCityInfo }}</p>
        </div>
      </BaseDashboardCard>

      <!-- 즐겨찾기 도시 (전역 스토어에서 가져옴) / 검색 중에는 감춰서 검색 결과에 집중시킨다 -->
      <template v-if="!isSearching">
        <h3 class="weather-card-title">즐겨찾기 ({{ favoriteStore.favoriteCount }})</h3>
        <BaseDashboardCard>
          <div class="weatherCard-container">
            <p v-if="!favoriteStore.hasFavorite" class="no-result">
              카드 우측 상단의 별을 눌러 즐겨찾기에 추가해보세요.
            </p>
            <p v-else-if="isFavoriteLoading && favoriteWeatherList.length === 0" class="no-result">
              즐겨찾기 날씨를 불러오는 중입니다...
            </p>
            <WeatherCard
              v-for="item in favoriteWeatherList"
              :key="item.id"
              :city="item"
              :is-selected="selectedCity === item.name"
              @select-card="selectCity"
              @click-detail="detail"
            />
          </div>
        </BaseDashboardCard>
      </template>

      <!-- 기본 날씨 현황 카드 -->
      <h3 class="weather-card-title">지역별 날씨 현황</h3>
      <BaseDashboardCard>
        <div class="weatherCard-container">
          <p v-if="filteredWeatherList.length === 0" class="no-result">검색 결과가 없습니다.</p>
          <WeatherCard
            v-for="item in filteredWeatherList"
            :key="item.id"
            :city="item"
            :is-selected="selectedCity === item.name"
            @select-card="selectCity"
            @click-detail="detail"
          />
        </div>
      </BaseDashboardCard>
    </template>
  </div>
</template>

<style scoped>
body {
  margin: 0;
}
.weather-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;

  background-color: rgb(245, 245, 255);
  font-family: 'Pretendard', sans-serif;
}
/* 카드와 같은 폭을 줘야 가운데로 몰리지 않고 카드 왼쪽 끝에 맞춰진다 */
/* 글자 시작점은 padding으로 카드 안쪽 여백(10px)과 맞춘다 */
.weather-container h1 {
  width: min(800px, 100%);
  padding-left: 10px;
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}
.weather-card-title {
  width: min(800px, 100%);
  padding-left: 10px;
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}

/* 검색 영역 내부 레이아웃 */
.search-content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 5px;
}

/* 상태 바 내부 레이아웃 */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

/* 카드 목록 내부 레이아웃 */
.weatherCard-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.no-result {
  grid-column: 1 / -1;

  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 150px;
  margin: 0;
  font-weight: bold;
}

/* 로딩 문구 (WeatherVeryDetailView와 동일한 스타일) */
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

/* 대시보드 내비게이션 스타일은 DashboardNav 컴포넌트가 가지고 있다 */

/* 태블릿 */
@media (max-width: 900px) {
  .weather-container {
    padding: 20px 16px;
  }

  .weather-container h1,
  .weather-card-title {
    width: 100%;
    max-width: 800px;
  }

  .weatherCard-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 모바일 */
@media (max-width: 600px) {
  .weather-container {
    align-items: stretch;
    padding: 16px 12px;
  }

  .weather-container h1 {
    width: 100%;
    margin: 0 0 14px;
    font-size: 25px;
  }

  .weather-card-title {
    width: 100%;
    margin: 4px 0 10px;
    font-size: 18px;
  }

  .search-content-container {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .status-bar {
    min-height: 40px;
    height: auto;
    padding: 6px 10px;
    text-align: center;
  }

  .status-bar p {
    margin: 0;
    line-height: 1.5;
  }

  .weatherCard-container {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .no-result {
    min-height: 120px;
  }
}
</style>
