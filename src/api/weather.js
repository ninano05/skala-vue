import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
// 한글 검색을 위한 api
const GEO_URL = 'https://api.openweathermap.org/geo/1.0'

// 영문으로 도시 검색해서 데이터 받아오기
export const getCurrentWeather = async (city) => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: city,
      appid: API_KEY,
      units: 'metric', // 섭씨
      lang: 'kr',      // 한글
    },
  })

  return response.data
}

// 지명(한글 포함) -> 위도/경도 변환. 동명 지역이 여러 나라에 있을 수 있어 한국(KR)을 우선 선택
export const geocodeCity = async (cityName) => {
  const response = await axios.get(`${GEO_URL}/direct`, {
    params: {
      q: cityName,
      limit: 5,
      appid: API_KEY,
    },
  })

  const results = response.data

  if (results.length === 0) {
    throw new Error('해당 도시를 찾을 수 없습니다.')
  }

  return results.find((item) => item.country === 'KR') ?? results[0]
}

// 위도/경도로 현재 날씨 조회 (한글 지명처럼 q 파라미터로 못 찾는 경우 사용)
export const getCurrentWeatherByCoords = async (lat, lon) => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  return response.data
}
