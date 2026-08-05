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

// 국내 날씨만 다루므로 검색어에 국가 코드(KR)를 붙여 조회한다
// 사용자가 콤마를 입력해도 국가 코드가 겹치지 않도록 앞부분만 사용
const toKoreanQuery = (keyword) => `${keyword.split(',')[0].trim()},KR`

// 지명(한글 포함) -> 위도/경도 변환. 국내 지역만 대상으로 한다
export const geocodeCity = async (cityName) => {
  const response = await axios.get(`${GEO_URL}/direct`, {
    params: {
      q: toKoreanQuery(cityName),
      limit: 5,
      appid: API_KEY,
    },
  })

  const results = response.data.filter((item) => item.country === 'KR')

  if (results.length === 0) {
    throw new Error('해당 도시를 찾을 수 없습니다.')
  }

  return results[0]
}

// 같은 좌표를 반복 조회하지 않도록 캐시 (자동완성은 같은 후보가 자주 다시 나온다)
const regionCache = new Map()

// 좌표 -> 상위 행정구역명. 이름이 같은 지역(예: 대치리)을 구분하기 위해 사용한다
// OpenWeather DB에서 가장 가까운 지명을 돌려주므로 정확한 주소가 아니라 대략적인 위치다
const getRegionName = async (lat, lon) => {
  const key = `${lat}_${lon}`

  if (regionCache.has(key)) {
    return regionCache.get(key)
  }

  try {
    const response = await axios.get(`${GEO_URL}/reverse`, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: API_KEY,
      },
    })

    const place = response.data[0]
    const region = place ? (place.local_names?.ko ?? place.name) : ''

    regionCache.set(key, region)

    return region
  } catch (error) {
    return '' // 실패해도 자동완성은 동작해야 하므로 좌표 표시로 대체된다
  }
}

// 자동완성용: 국내 지명 후보 목록을 화면에서 쓰기 좋은 형태로 변환해서 반환
export const searchCities = async (keyword) => {
  const response = await axios.get(`${GEO_URL}/direct`, {
    params: {
      q: toKoreanQuery(keyword),
      limit: 5,
      appid: API_KEY,
    },
  })

  const candidates = response.data
    .filter((item) => item.country === 'KR') // 혹시 섞여 오면 한 번 더 거른다
    .map((item) => ({
      id: `${item.lat}_${item.lon}`,
      name: item.local_names?.ko ?? item.name, // 한글 지명이 있으면 우선 사용
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }))

  const regions = await Promise.all(candidates.map((city) => getRegionName(city.lat, city.lon)))

  return candidates.map((city, index) => {
    // 상위 지역명이 없거나 도시명과 같으면 state를, 그것도 없으면 좌표를 보여준다
    const detail = regions[index] && regions[index] !== city.name ? regions[index] : city.state
    const coords = `${city.lat.toFixed(3)}, ${city.lon.toFixed(3)}`

    return {
      id: city.id,
      name: city.name,
      region: detail || coords, // 국내만 검색하므로 국가 코드(KR)는 표시하지 않는다
      coords,
      lat: city.lat,
      lon: city.lon,
    }
  })
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
