<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherAnimation from './WeatherAnimation.vue'

// 반응형 데이터 최상단 부모 소유
const searchKeyword = ref('')
const selectedCity = ref('')
const selectedWeather = ref('')

// 데이터셋
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '부산', temp: 24, status: '비' },
  { id: 'city_03', name: '수원', temp: 26, status: '구름' },
])

// SearchBar의 update-query 이벤트 핸들러 (검색어 갱신)
const updateQuery = (keyword) => {
  searchKeyword.value = keyword
}

// WeatherCard의 click-detail 이벤트 핸들러 (상세보기)
const detail = (city) => {
  alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}

// WeatherCard의 select-card 이벤트 핸들러 (현재 선택 도시 업데이트)
const selectCity = (city) => {
  selectedCity.value = city.name
  selectedWeather.value = city.status
}

// 검색한 키워드와 연관된 도시 필터링
const filteredWeatherList = computed(() => {
  const keyword = searchKeyword.value

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// 도시 검색 함수 (SearchBar의 search-city 이벤트로 호출)
const searchCity = () => {
  const keyword = searchKeyword.value

  const foundCity = weatherList.value.find((item) => item.name === keyword)

  if (foundCity) {
    selectedCity.value = foundCity.name
    selectedWeather.value = foundCity.status
  } else {
    alert('해당 도시는 지원하지 않습니다.')
    selectedCity.value = ''
    selectedWeather.value = ''
    searchKeyword.value = ''
  }
}

// 상태 바 문구
const selectedCityInfo = computed(() => {
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
    <h1>과제3: 날씨 (컴포넌트)</h1>

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

    <!-- 날씨 현황 카드 -->
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
  width: 800px;
  text-align: left;
  margin-left: 10px;
  margin-bottom: 5px;
  font-weight: bold;
}
.weather-card-title {
  width: 800px;
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
</style>
