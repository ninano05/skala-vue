import { defineStore } from 'pinia'

// 즐겨찾기 도시를 전역으로 보관하는 스토어
export const useFavoriteStore = defineStore('favorite', {
  // state
  state: () => ({
    // 식별 정보(id, name, lat, lon)만 저장 -> 해당 정보를 바탕으로 조회시 api 재조회
    favorites: [],
  }),

  // getters
  // 저장한 정보 조회하기
  getters: {
    // 즐겨찾기 개수
    favoriteCount: (state) => state.favorites.length,

    // 즐겨찾기 존재 여부
    hasFavorite: (state) => state.favorites.length > 0,

    // 특정 도시가 즐겨찾기에 있는지 (인자를 받아야 하므로 함수를 반환하는 getter)
    isFavorite: (state) => {
      return (cityId) => state.favorites.some((item) => item.id === cityId)
    },
  },

  // action
  actions: {
    // 즐겨찾기 추가 (이미 있으면 중복 추가하지 않음)
    addFavorite(city) {
      if (this.isFavorite(city.id)) {
        return
      }

      this.favorites.push({
        id: city.id,
        name: city.name,
        lat: city.lat,
        lon: city.lon,
      })
    },

    // 즐겨찾기 삭제
    removeFavorite(cityId) {
      this.favorites = this.favorites.filter((item) => item.id !== cityId)
    },

    // 즐겨찾기 토글 (카드의 별 버튼에서 사용)
    toggleFavorite(city) {
      if (this.isFavorite(city.id)) {
        this.removeFavorite(city.id)
        return
      }

      this.addFavorite(city)
    },
  },
})
