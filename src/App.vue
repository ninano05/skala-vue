<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-container">
    <header class="header">
      <div class="logo-area">
        <div>
          <h1>Vue Practice</h1>
          <p>실습 페이지 모음</p>
        </div>
        <UnitToggler />
      </div>
      

      <nav class="navigation">
        <RouterLink to="/" class="nav-link">
          <span class="nav-number">00</span>
          <span>날씨Home</span>
        </RouterLink>

        <RouterLink to="/day1" class="nav-link">
          <span class="nav-number">01</span>
          <span>1일차 실습</span>
        </RouterLink>

        <RouterLink to="/day2" class="nav-link">
          <span class="nav-number">02</span>
          <span>2일차 실습</span>
        </RouterLink>

        <RouterLink to="/day3" class="nav-link">
          <span class="nav-number">03</span>
          <span>3일차 실습</span>
        </RouterLink>

        <RouterLink to="/day4" class="nav-link">
          <span class="nav-number">04</span>
          <span>4일차 실습</span>
        </RouterLink>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: #f5f7fb;
  color: #2d3748;
}
.app-container {
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;

  width: 100%;
  padding: 20px 40px;

  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.logo-area h1 {
  margin: 0;
  font-size: 21px;
}
.logo-area p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 13px;
}
.navigation {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 12px 17px;

  color: #64748b;
  background-color: #f8fafc;
  border: 1px solid transparent;
  border-radius: 12px;

  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.nav-link:hover {
  color: #5e4ba7;
  background-color: #f6eeff;
  border-color: #e9d5ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(196, 181, 253, 0.4);
}
.nav-link.router-link-active {
  color: white;
  background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
  border-color: #c4b5fd;
  box-shadow: 0 6px 14px rgba(196, 181, 253, 0.4);
}
.nav-number {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 26px;
  height: 26px;

  background-color: rgba(148, 163, 184, 0.13);
  border-radius: 8px;

  font-size: 11px;
  font-weight: 800;
}
.router-link-active .nav-number {
  background-color: rgba(255, 255, 255, 0.2);
}
.main-content {
  width: 100%;
  padding: 0px;
}

@media (max-width: 850px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 20px;
  }

  .navigation {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .nav-link {
    flex-shrink: 0;
  }

  .main-content {
    padding: 0px;
  }
}
</style>
