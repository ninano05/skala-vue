<script setup>
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUmbrella } from '@fortawesome/free-solid-svg-icons'
import { useHomeResetStore } from '@/stores/homeResetStore'

const route = useRoute()
const router = useRouter()

const homeResetStore = useHomeResetStore()

// 어느 페이지에서 누르든 홈의 검색 상태를 비운 뒤 홈으로 이동한다
const goHome = () => {
  homeResetStore.requestReset()

  if (route.name !== 'WeatherHomeView') {
    router.push({ name: 'WeatherHomeView' })
  }
}

const goAbout = () => {
  if (route.name !== 'WeatherAboutView') {
    router.push({ name: 'WeatherAboutView' })
  }
}

const goUmbrella = () => {
  if (route.name !== 'WeatherUmbrellaView') {
    router.push({ name: 'WeatherUmbrellaView' })
  }
}
</script>

<template>
  <nav class="dashboard-nav">
    <button :class="{ active: route.name === 'WeatherHomeView' }" @click="goHome">
      Weather Home
    </button>

    <button :class="{ active: route.name === 'WeatherAboutView' }" @click="goAbout">About</button>

    <button :class="{ active: route.name === 'WeatherUmbrellaView' }" @click="goUmbrella">
      <FontAwesomeIcon :icon="faUmbrella" />
      rain
    </button>
  </nav>
</template>

<style scoped>
.dashboard-nav {
  width: 800px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 0 auto 20px;
}
.dashboard-nav button {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 10px 18px;
  border: 1px solid #c4b5fd;
  border-radius: 10px;
  background: white;
  /* iOS Safari는 color가 없으면 버튼 글자를 시스템 강조색(파랑)으로 그린다 */
  color: black;
  font-family: inherit;
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
  .dashboard-nav {
    width: 100%;
    max-width: 800px;
    margin-bottom: 16px;
  }
}

/* 모바일 */
@media (max-width: 600px) {
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
}
</style>
