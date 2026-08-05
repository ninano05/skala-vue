<script setup>
import { useRouter } from 'vue-router'
import DashboardNav from '../components/exercise/DashboardNav.vue'

const router = useRouter()

const goDashboard = () => {
  router.push({
    name: 'WeatherHomeView',
  })
}
</script>

<template>
  <main class="about-page">
    <!--대시보드 네비게이션 (홈과 같은 위치/크기로 보이도록 최상단에 배치) -->
    <DashboardNav />

    <section class="hero-section">
      <div class="hero-badge">Weather Dashboard</div>

      <h1>지역별 날씨를 한눈에 확인하세요</h1>

      <p class="hero-description">
        원하는 도시를 검색하고 현재 기온과 날씨 상태를 확인할 수 있는 지역별 날씨 정보 서비스입니다.
      </p>

      <button type="button" class="dashboard-button" @click="goDashboard">
        날씨 대시보드로 이동
      </button>
    </section>

    <section class="content-section">
      <article class="about-card">
        <div class="icon-box">🔍</div>

        <h2>도시 검색</h2>

        <p>도시 이름을 입력하여 원하는 지역의 날씨 정보를 빠르게 검색할 수 있습니다.</p>
      </article>

      <article class="about-card">
        <div class="icon-box">🌤️</div>

        <h2>현재 날씨 확인</h2>

        <p>지역별 현재 기온과 맑음, 비, 구름 등의 날씨 상태를 확인할 수 있습니다.</p>
      </article>

      <article class="about-card">
        <div class="icon-box">📍</div>

        <h2>지역별 상세 정보</h2>

        <p>원하는 도시의 카드를 선택하면 해당 지역의 상세 기상관측 정보를 확인할 수 있습니다.</p>
      </article>
    </section>

    <section class="project-section">
      <div class="project-card">
        <div class="project-content">
          <span class="section-label">ABOUT PROJECT</span>

          <h2>Vue Router 기반 날씨 서비스</h2>

          <p>
            이 프로젝트는 Vue 3와 Vue Router를 활용하여 제작한 날씨 대시보드입니다. 도시 목록, 검색
            기능, 상세 페이지 이동, 현재 위치 기반 강수 확룰 조회 기능을 구현했습니다.
          </p>
        </div>

        <ul class="feature-list">
          <li>도시 검색 및 필터링</li>
          <li>지역별 날씨 카드 조회</li>
          <li>도시 날씨 상세 정보 조회</li>
          <li>현재 위치 기반 강수량 확인</li>
          <li>도시 즐겨찾기 기능</li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  /* 위쪽 여백은 홈(.weather-container)과 맞춰 내비가 같은 높이에 오게 한다 */
  padding: 20px 20px 60px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(221, 214, 254, 0.8), transparent 35%),
    linear-gradient(135deg, #faf7ff, #f3efff);
  font-family: 'Pretendard', sans-serif;
  color: #3f3a4d;
}
.hero-section {
  width: min(900px, 100%);
  margin: 0 auto 50px;
  padding: 60px 40px;
  box-sizing: border-box;
  text-align: center;
  border: 1px solid #ddd6fe;
  border-radius: 28px;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  box-shadow: 0 16px 40px rgba(139, 92, 246, 0.16);
}
.hero-badge {
  display: inline-block;
  padding: 8px 16px;
  margin-bottom: 20px;
  border: 1px solid #c4b5fd;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.75);
  color: #7c3aed;
  font-size: 14px;
  font-weight: 700;
}
.hero-section h1 {
  margin: 0;
  color: #4c1d95;
  font-size: 42px;
  line-height: 1.3;
}
.hero-description {
  max-width: 620px;
  margin: 22px auto 30px;
  color: #6b6478;
  font-size: 17px;
  line-height: 1.8;
  word-break: keep-all;
}
.dashboard-button {
  padding: 13px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(139, 92, 246, 0.28);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.dashboard-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(139, 92, 246, 0.35);
}
.dashboard-button:active {
  transform: translateY(0);
}
.content-section {
  width: min(900px, 100%);
  margin: 0 auto 50px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.about-card {
  padding: 28px 24px;
  border: 1px solid #e9d5ff;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(139, 92, 246, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 30px rgba(139, 92, 246, 0.16);
}
.icon-box {
  width: 52px;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  font-size: 25px;
}
.about-card h2 {
  margin: 0 0 12px;
  color: #5b21b6;
  font-size: 20px;
}
.about-card p {
  margin: 0;
  color: #716a7c;
  line-height: 1.7;
  word-break: keep-all;
}
.project-section {
  width: min(900px, 100%);
  margin: 0 auto;
}
.project-card {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 40px;
  padding: 40px;
  border: 1px solid #d8b4fe;
  border-radius: 24px;
  background: linear-gradient(135deg, #ffffff, #f5f3ff);
  box-shadow: 0 14px 32px rgba(139, 92, 246, 0.13);
}
.section-label {
  color: #8b5cf6;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.project-content h2 {
  margin: 12px 0 18px;
  color: #4c1d95;
  font-size: 28px;
}
.project-content p {
  margin: 0;
  color: #6f687a;
  line-height: 1.8;
  word-break: keep-all;
}
.feature-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 13px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.feature-list li {
  position: relative;
  padding: 13px 16px 13px 42px;
  border: 1px solid #ede9fe;
  border-radius: 12px;
  background-color: #faf7ff;
  color: #5f576d;
  font-weight: 600;
}
.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 16px;
  color: #8b5cf6;
  font-weight: 900;
}

@media (max-width: 768px) {
  .about-page {
    padding: 20px 16px 30px;
  }
  .hero-section {
    padding: 42px 24px;
  }
  .hero-section h1 {
    font-size: 32px;
  }
  .content-section {
    grid-template-columns: 1fr;
  }
  .project-card {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 28px 24px;
  }
}
</style>
