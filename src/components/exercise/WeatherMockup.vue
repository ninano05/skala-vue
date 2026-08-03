<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faMagnifyingGlass,
  faTemperatureArrowUp,
  faTemperatureArrowDown,
  faSun,
  faCloudShowersHeavy,
  faCloud,
} from '@fortawesome/free-solid-svg-icons'

// 고양이 이미지
// const happyCat = 'https://cdn.pixabay.com/photo/2025/09/04/15/13/cute-cartoon-cat-9815896_1280.png'
// const sadCat = 'https://cdn.pixabay.com/photo/2025/12/08/20/24/animation-10002813_1280.png'

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

const selectCity = (cityName, weather) => {
  selectedCity.value = cityName
  selectedWeather.value = weather
}

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
</script>

<template>
  <div class="weather-container">
    <h1>과제1: 날씨 (Mockup)</h1>

    <!--도시 검색창-->
    <div class="search-container">
      <div class="search-content-container">
        <!--검색 input 부분-->
        <div class="serach-input-container">
          <h3>
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
          <p>
            검색 중인 도시: <strong>{{ searchKeyword }}</strong>
          </p>
        </div>
        <!--도시 날씨에 따른 고양이 상태-->
        <!-- <div class="img-container">
          <img v-if="selectedWeather == '맑음'" :src="happyCat" alt="날씨가 좋아서 행복한 고양이" />
          <img v-else-if="selectedWeather == '비'" :src="sadCat" alt="비 와서 슬픈 고양이" />
        </div> -->
      </div>
    </div>

    <!--선택 도시 현황 상태바-->
    <div class="status-bar">
      <p v-if="selectedCity == ''">카드를 클릭하거나 검색해보세요.</p>
      <p v-else>
        <strong>{{ selectedCity }}</strong
        >이 선택되었습니다.
      </p>
    </div>

    <!--날씨 현황 카드-->
    <h3 class="weather-card-title">지역별 날씨 현황</h3>
    <div class="weatherCard-container">
      <div
        v-for="(item, index) in weatherList"
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
  width: 100%;
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
/* 마우스를 날씨 카드에 올렸을 때 */
.weatherCard:hover {
  border-color: rgb(145, 145, 245);
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(80, 80, 150, 0.18);
}
/* 날씨 카드 클릭해서 선택된 카드 */
.weatherCard.selected {
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
</style>
