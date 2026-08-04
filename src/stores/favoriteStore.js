import { defineStore } from 'pinia'

// 즐겨찾기 도시를 전역으로 보관하는 스토어
// state / getters / actions 세 칸을 명시적으로 나누기 위해 Options 스타일로 작성한다
export const useFavoriteStore = defineStore('favorite', {
  // ===== state =====
  state: () => ({
    // 식별 정보(id, name, lat, lon)만 저장한다.
    // 온도/날씨 상태는 시간이 지나면 낡기 때문에, 화면에 뿌릴 때 좌표로 다시 조회한다.
    favorites: [],
  }),

  // ===== getters =====
  getters: {
    // 즐겨찾기 개수
    favoriteCount: (state) => state.favorites.length,

    // 즐겨찾기가 하나라도 있는지
    hasFavorite: (state) => state.favorites.length > 0,

    // 특정 도시가 즐겨찾기에 있는지 (인자를 받아야 하므로 함수를 반환하는 getter)
    isFavorite: (state) => {
      return (cityId) => state.favorites.some((item) => item.id === cityId)
    },
  },

  // ===== actions =====
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
