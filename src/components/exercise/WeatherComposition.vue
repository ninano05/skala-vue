<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faMagnifyingGlass,
  faTemperatureArrowUp,
  faTemperatureArrowDown,
  faSun,
  faCloudShowersHeavy,
  faCloud,
} from '@fortawesome/free-solid-svg-icons'
import WeatherAnimation from './WeatherAnimation.vue'

// 사용 변수
const searchKeyword = ref('')
const selectedCity = ref('')
const selectedWeather = ref('')

// 데이터셋
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '부산', temp: 24, status: '비' },
  { id: 'city_03', name: '수원', temp: 26, status: '구름' },
])

// 상세보기 버튼 함수
const detail = (cityName, status) => {
  alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// 현재 선택한 도시 업데이트 하는 함수
const selectCity = (cityName, weather) => {
  selectedCity.value = cityName
  selectedWeather.value = weather
}

// 검색한 키워드와 연관된 도시 필터링하여 리스트로 저장
const filteredWeatherList = computed(() => {
  const keyword = searchKeyword.value // 입력 키워드 받아옴

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// 도시 검색 함수
const searchCity = () => {
  // 입력한 도시가 목록에 있는지 확인
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

// 상태바 문구 변화시 콘솔 찍기
const selectedCityInfo = computed(() => {
  if (selectedCity.value === '') {
    return '카드를 클릭하거나 검색해보세요.'
  }

  return `${selectedCity.value}이 선택되었습니다.`
})
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
    <h1>과제2: 날씨 (Composition)</h1>

    <!--도시 검색창-->
    <div class="search-container">
      <div class="search-content-container">
        <!--검색 input 부분-->
        <div class="serach-input-container">
          <h3 id="search-title">
            <FontAwesomeIcon :icon="faMagnifyingGlass" style="color: rgb(0, 0, 0)" />도시 검색
          </h3>
          <input
            type="text"
            class="search-input"
            v-model="searchKeyword"
            @input="searchKeyword = $event.target.value"
            @change="searchCity"
            placeholder="검색할 도시를 입력해주세요."
          />
          <p id="search-result">
            검색 중인 도시: <strong>{{ searchKeyword }}</strong>
          </p>
        </div>
        <!--도시 날씨에 따른 애니메이션-->
        <WeatherAnimation :weather="selectedWeather" />
      </div>
    </div>

    <!--선택 도시 현황 상태바-->
    <div class="status-bar">
      <p v-if="selectedCity == ''">{{ selectedCityInfo }}</p>
      <p v-else>
        <strong>{{ selectedCity }}</strong
        >이 선택되었습니다.
      </p>
    </div>

    <!--날씨 현황 카드-->
    <h3 class="weather-card-title">지역별 날씨 현황</h3>
    <div class="weatherCard-container">
      <p v-if="filteredWeatherList.length === 0" class="no-result">검색 결과가 없습니다.</p>
      <div
        v-for="(item, index) in filteredWeatherList"
        :key="item.id"
        class="weatherCard"
        :class="{ selected: selectedCity === item.name }"
        @click="selectCity(item.name, item.status)"
      >
        <p class="region-title" v-if="item.status == '맑음'">
          <FontAwesomeIcon :icon="faSun" style="color: rgb(255, 129, 9)" />{{ item.name }} ({{
            item.status
          }})
        </p>
        <p class="region-title" v-else-if="item.status == '비'">
          <FontAwesomeIcon :icon="faCloudShowersHeavy" style="color: rgb(116, 192, 252)" />
          {{ item.name }} ({{ item.status }})
        </p>
        <p class="region-title" v-else-if="item.status == '구름'">
          <FontAwesomeIcon :icon="faCloud" style="color: rgb(129, 139, 165)" />
          {{ item.name }} ({{ item.status }})
        </p>
        <p>현재기온: {{ item.temp }}°C</p>
        <p v-if="item.temp < 25" class="cool-temperature-badge">
          <FontAwesomeIcon
            :icon="faTemperatureArrowDown"
            style="color: rgb(61, 77, 247); margin-right: 5px"
          />선선함(25°C 미만)
        </p>
        <p v-else class="hot-temperature-badge">
          <FontAwesomeIcon
            :icon="faTemperatureArrowUp"
            style="color: rgb(225, 51, 51); margin-right: 5px"
          />더움(25°C 이상)
        </p>
        <button class="detail-btn" @click.stop="detail(item.name, item.status)">상세보기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Pretendard', sans-serif;
}
.weather-container h1 {
  width: 800px;
  text-align: left;
  margin-left: 10px;
  margin-bottom: 5px;
  font-weight: bold;
}
h3 {
  font-weight: bold;
}
.weather-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(245, 245, 255);
}
.search-container {
  width: 800px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid lightgray;
  margin-bottom: 20px;
  background-color: rgba(215, 215, 253);
}
.search-content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-input-container {
}
.weatherCard-container {
  width: 800px;
  padding: 10px;
  background-color: rgba(215, 215, 253);
  border-radius: 10px;
  border: 1px solid lightgray;
  margin-bottom: 20px;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.weatherCard {
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid lightgray;

  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.detail-btn {
  align-self: flex-start;
  width: 100%;
  height: 30px;
  margin-top: 10px;
  border: 1px solid lightgray;
  border-radius: 10px;
  background-color: rgba(215, 215, 253);
  font-weight: bold;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.search-input {
  width: 500px;
  height: 36px;
  padding: 0 10px;
  font-size: 16px;
  box-sizing: border-box;
  border: 1px solid lightgray;
  border-radius: 10px;
}
.status-bar {
  width: 800px;
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(215, 215, 253);
  border-radius: 10px;
  border: 1px solid lightgray;
}
.img-container {
  width: 500px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 20px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);
}
.img-container img {
  width: 130px;
  height: 130px;
  object-fit: contain;
}
.cool-temperature-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;

  width: fit-content;
  padding: 4px 8px;
  margin: 3px 0;

  border-radius: 20px;
  background-color: rgba(206, 229, 255);
  font-size: 14px;
  font-weight: bold;
}
.hot-temperature-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;

  width: fit-content;
  padding: 4px 8px;
  margin: 3px 0;

  border-radius: 20px;
  background-color: rgba(255, 213, 213);
  font-size: 14px;
  font-weight: bold;
}
.region-title {
  font-weight: bold;
  font-size: 18px;
}
.weather-card-title {
  width: 800px;
  text-align: left;
  margin-left: 10px;
  margin-bottom: 5px;
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
#search-title {
  margin-left: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
}
#search-result {
  margin-top: 6px;
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
}
/* 마우스를 날씨 카드에 올렸을 때 */
.weatherCard:hover {
  border-color: rgb(145, 145, 245);
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(80, 80, 150, 0.18);
}
/* 날씨 카드 클릭해서 선택된 카드 */
.weatherCard.selected {
  border: 1px solid;
  border-color: rgb(85, 85, 230);
  box-shadow: 0 0 0 3px rgba(85, 85, 230, 0.15);
}
/* 버튼에 올리면 */
.detail-btn:hover {
  background-color: rgb(180, 180, 245);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(80, 80, 150, 0.2);
}
.detail-btn:active {
  transform: translateY(0);
  box-shadow: none;
}
.search-input:focus {
  outline: 1px solid rgb(85, 85, 230);
}
</style>
