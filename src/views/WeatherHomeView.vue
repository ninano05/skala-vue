<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import WeatherAnimation from '../components/exercise/WeatherAnimation.vue'
import { getCurrentWeather, geocodeCity, getCurrentWeatherByCoords } from '@/api/weather'
import { useFavoriteStore } from '@/stores/favoriteStore'

// 라우터 설정
const router = useRouter()
const route = useRoute()

// 반응형 데이터 최상단 부모 소유
const searchKeyword = ref('')
const selectedCity = ref('')
const selectedWeather = ref('')
const isLoading = ref(false)

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
  }
}

onMounted(loadInitialWeather)

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

// WeatherCard의 select-card 이벤트 핸들러 (현재 선택 도시 업데이트)
const selectCity = (city) => {
  selectedCity.value = city.name
  selectedWeather.value = city.status
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
    const data = await getCurrentWeatherByCoords(location.lat, location.lon)
    const newCity = toCityItem(`city_${Date.now()}`, keyword, data)

    weatherList.value = [...weatherList.value, newCity]
    selectedCity.value = newCity.name
    selectedWeather.value = newCity.status
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

  return `${selectedCity.value}이 선택되었습니다.`
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
  <div class="weather-container">
    <!--대시보드 네비게이션 -->
    <nav class="dashboard-nav">
      <button
        :class="{ active: route.name === 'WeatherHomeView' }"
        @click="router.push({ name: 'WeatherHomeView' })"
      >
        Weather Home
      </button>

      <button
        :class="{ active: route.name === 'WeatherAboutView' }"
        @click="router.push({ name: 'WeatherAboutView' })"
      >
        About
      </button>
    </nav>

    <h1>과제4: 라우터 적용</h1>

    <!-- 도시 검색: slot 내부에 있지만 부모 스코프에서 컴파일되므로 직접 바인딩/통신 가능 -->
    <BaseDashboardCard>
      <div class="search-content-container">
        <SearchBar :keyword="searchKeyword" @update-query="updateQuery" @search-city="searchCity" />
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
.weather-container h1 {
  /* width: 800px; */
  text-align: left;
  margin-left: 10px;
  margin-bottom: 5px;
  font-weight: bold;
}
.weather-card-title {
  /* width: 800px; */
  text-align: left;
  margin-left: 10px;
  margin-bottom: 5px;
  font-weight: bold;
}

/* 검색 영역 내부 레이아웃 */
.search-content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 대시보드 CSS */
.dashboard-nav {
  width: 800px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}
.dashboard-nav button {
  padding: 10px 18px;
  border: 1px solid #c4b5fd;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: 0.2s;
}
.dashboard-nav button:hover {
  background: #ede9fe;
}
.dashboard-nav button.active {
  background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
  border-color: #c4b5fd;
  color: #4c1d95;
  font-weight: bold;
  box-shadow: 0 6px 14px rgba(139, 92, 246, 0.25);
}

/* 태블릿 */
@media (max-width: 900px) {
  .weather-container {
    padding: 20px 16px;
  }

  .weather-container h1,
  .weather-card-title,
  .dashboard-nav {
    width: 100%;
    max-width: 800px;
  }

  .dashboard-nav {
    margin-bottom: 16px;
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

  .dashboard-nav {
    width: 100%;
    justify-content: stretch;
    gap: 8px;
    margin-bottom: 16px;
  }

  .dashboard-nav button {
    flex: 1;
    padding: 10px 12px;
    font-size: 14px;
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
