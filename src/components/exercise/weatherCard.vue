<script setup>
import { ref, computed } from 'vue'

const happyCat = 'https://cdn.pixabay.com/photo/2025/09/04/15/13/cute-cartoon-cat-9815896_1280.png'
const sadCat = 'https://cdn.pixabay.com/photo/2025/12/08/20/24/animation-10002813_1280.png'

const searchKeyword = ref('')
const selectedCity = ref('')
const selectedWeather = ref('')

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '부산', temp: 24, status: '비' },
  { id: 'city_03', name: '수원', temp: 26, status: '구름' },
])

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

// 이미지 관리
import sunnyBg from '../../assets/sunny.png'
import rainyBg from '../../assets/rain.png'
import cloudyBg from '../../assets/cloud.png'

const backgroundImage = computed(() => {
  switch (selectedWeather.value) {
    case '맑음':
      return sunnyBg
    case '비':
      return rainyBg
    case '구름':
      return cloudyBg
    default:
      return ''
  }
})
</script>

<template>
  <div class="weather-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <h1>과제1: 날씨 (Mockup)</h1>

    <!--도시 검색창-->
    <div class="search-container">
      <div class="search-img-container">
        <h3>도시 검색</h3>
        <input
          type="text"
          class="search-input"
          v-model.lazy="searchKeyword"
          @change="searchCity"
          placeholder="검색할 도시를 입력해주세요."
        />
        <p>
          검색 중인 도시: <strong>{{ searchKeyword }}</strong>
        </p>
        <!--선택한 도시에 대한 무언가-->
        <div class="img-container">
          <img v-if="selectedWeather == '맑음'" :src="happyCat" alt="날씨가 좋아서 행복한 고양이" />
          <img v-else-if="selectedWeather == '비'" :src="sadCat" alt="비 와서 슬픈 고양이" />
        </div>
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
    <div class="weatherCard-container">
      <h3>지역별 날씨 현황</h3>
      <div
        v-for="(item, index) in weatherList"
        :key="item.id"
        class="weatherCard"
        @click="selectCity(item.name, item.status)"
      >
        <p>{{ item.name }} ({{ item.status }})</p>
        <p>현재기온: {{ item.temp }}°C</p>
        <button class="detail-btn" @click="detail(item.name, item.status)">상세보기</button>
        <p v-if="item.temp < 25">선선함(25°C 미만)</p>
        <p v-else>더움(25°C 이상)</p>
      </div>
    </div>
  </div>
</template>

<style>
h1 {
}
.weather-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}
.search-container {
  width: 800px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid lightgray;
  margin-bottom: 20px;
  background-color: lightyellow;
}
.weatherCard-container {
  width: 800px;
  padding: 10px;
  background-color: antiquewhite;
  border-radius: 10px;
  border: 1px solid lightgray;
  margin-bottom: 20px;
}
.weatherCard {
  background-color: white;
  display: flex;
  flex-direction: column;
  background-color: white;
  margin: 20px;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid lightgray;
}
.detail-btn {
  align-self: flex-end;
}
.search-input {
  width: 300px;
  height: 36px;
  padding: 0 10px;
  font-size: 16px;
  box-sizing: border-box;
}
.status-bar {
  width: 800px;
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: beige;
  border-radius: 10px;
  border: 1px solid lightgray;
}
.img-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: auto;
  padding: 20px;
  box-sizing: border-box;
}
.img-container img {
  width: 250px;
  height: 250px;
  object-fit: contain;
}
</style>
