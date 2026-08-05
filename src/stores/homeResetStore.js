import { defineStore } from 'pinia'

// 홈 밖(상세/About 페이지의 대시보드 내비)에서 홈의 검색 상태 초기화를 요청하기 위한 스토어
// KeepAlive로 홈이 계속 살아있어 라우팅만으로는 초기화되지 않으므로 신호를 보낸다
export const useHomeResetStore = defineStore('homeReset', {
  // state
  state: () => ({
    resetToken: 0, // 값이 바뀌는 것 자체가 초기화 신호
  }),

  // action
  actions: {
    requestReset() {
      this.resetToken += 1
    },
  },
})
