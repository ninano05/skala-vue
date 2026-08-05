<script setup>
defineProps({
  weather: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div
    class="img-container"
    :class="{
      sunny: weather === '맑음',
      rainy: weather === '비',
      cloudy: weather === '구름',
    }"
  >
    <!-- 기본 또는 맑음 -->
    <template v-if="weather === '' || weather === '맑음'">
      <div class="sun">
        <span
          v-for="ray in 8"
          :key="ray"
          class="sun-ray"
          :style="{ transform: `rotate(${ray * 45}deg)` }"
        ></span>
      </div>

      <div class="cloud cloud-small">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </template>

    <!-- 비 -->
    <template v-else-if="weather === '비'">
      <div class="cloud rain-cloud">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div class="rain-container">
        <span
          v-for="drop in 12"
          :key="drop"
          class="rain-drop"
          :style="{
            left: `${drop * 7}%`,
            animationDelay: `${(drop % 5) * 0.15}s`,
          }"
        ></span>
      </div>
    </template>

    <!-- 구름 -->
    <template v-else-if="weather === '구름'">
      <div class="moving-cloud cloud-one">
        <div class="cloud">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="moving-cloud cloud-two">
        <div class="cloud">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="moving-cloud cloud-three">
        <div class="cloud">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ===========================
   컨테이너
=========================== */
.img-container {
  position: relative;
  width: 240px;
  height: 120px;
  flex-shrink: 0; /* flex 컨테이너 안에서 240px를 유지 (남는 폭은 SearchBar가 가져간다) */
  margin: 0 auto;
  align-self: center;
  overflow: hidden;
  border-radius: 10px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #87ceeb, #e8f7ff);
  transition: background 0.4s ease;
}
.img-container.sunny {
  background: linear-gradient(to bottom, #53c3ff, #fff3ad);
}
.img-container.rainy {
  background: linear-gradient(to bottom, #657785, #bcc5cc);
}
.img-container.cloudy {
  background: linear-gradient(to bottom, #aeb8c0, #eceff2);
}

/* ===========================
   해
=========================== */
.sun {
  position: absolute;
  top: 35px;
  left: 28px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ffd93d;
  box-shadow: 0 0 18px #ffd93d;
  animation: sunPulse 2s ease-in-out infinite alternate;
}
.sunny .sun {
  animation:
    sunPulse 1.2s ease-in-out infinite alternate,
    sunRotate 10s linear infinite;
}
.sun-ray {
  position: absolute;

  left: 50%;
  top: 50%;

  width: 3px;
  height: 55px;

  margin-left: -1.5px;
  margin-top: -27px;
}
.sun-ray::before,
.sun-ray::after {
  content: '';

  position: absolute;

  width: 3px;
  height: 8px;

  border-radius: 10px;

  background: #ffd93d;
}
.sun-ray::before {
  top: 0;
}
.sun-ray::after {
  bottom: 0;
}

@keyframes sunPulse {
  from {
    transform: scale(1);
    box-shadow: 0 0 15px #ffd93d;
  }
  to {
    transform: scale(1.1);
    box-shadow: 0 0 28px #ffd93d;
  }
}

@keyframes sunRotate {
  from {
    rotate: 0deg;
  }
  to {
    rotate: 360deg;
  }
}

/* ===========================
   공통 구름
=========================== */
.cloud {
  position: absolute;

  width: 70px;
  height: 22px;

  border-radius: 20px;

  background: white;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.cloud span {
  position: absolute;
  border-radius: 50%;
  background: inherit;
}

.cloud span:nth-child(1) {
  width: 24px;
  height: 24px;
  left: 8px;
  bottom: 4px;
}

.cloud span:nth-child(2) {
  width: 34px;
  height: 34px;
  left: 22px;
  bottom: 7px;
}

.cloud span:nth-child(3) {
  width: 22px;
  height: 22px;
  right: 6px;
  bottom: 3px;
}

/* 기본 구름 */

.cloud-small {
  right: 25px;
  bottom: 28px;

  animation: cloudFloat 3s ease-in-out infinite alternate;
}

@keyframes cloudFloat {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-5px);
  }
}

/* ===========================
   비
=========================== */

.rain-cloud {
  top: 28px;
  left: 50%;

  width: 82px;

  transform: translateX(-50%);

  background: #5d6c78;
}

.rain-cloud span {
  background: #5d6c78;
}

.rain-container {
  position: absolute;

  left: 50%;
  top: 52px;

  width: 90px;
  height: 60px;

  transform: translateX(-50%);
}

.rain-drop {
  position: absolute;

  width: 2px;
  height: 10px;

  border-radius: 5px;

  background: #43a5ff;

  animation: rainFall 0.8s linear infinite;
}

@keyframes rainFall {
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(55px);
    opacity: 0;
  }
}

/* ===========================
   구름 애니메이션
=========================== */

.moving-cloud {
  position: absolute;

  width: 70px;
  height: 40px;
}

.moving-cloud .cloud {
  top: 8px;
  left: 0;

  background: #f5f5f5;
}

.moving-cloud .cloud span {
  background: #f5f5f5;
}

.cloud-one {
  top: 5px;

  animation: moveCloudOne 8s linear infinite;
}

.cloud-two {
  top: 48px;

  transform: scale(0.85);

  animation: moveCloudTwo 10s linear infinite;
  animation-delay: -4s;
}

.cloud-three {
  top: 24px;

  transform: scale(1.05);

  animation: moveCloudThree 12s linear infinite;
  animation-delay: -8s;
}

@keyframes moveCloudOne {
  from {
    left: -80px;
  }

  to {
    left: 250px;
  }
}

@keyframes moveCloudTwo {
  from {
    left: -100px;
  }

  to {
    left: 250px;
  }
}

@keyframes moveCloudThree {
  from {
    left: -120px;
  }

  to {
    left: 250px;
  }
}
</style>
