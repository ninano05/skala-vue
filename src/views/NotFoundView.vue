<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>페이지를 찾을 수 없습니다.</h2>
    <p>입력한 주소가 올바르지 않거나 삭제된 페이지입니다.</p>

    <button @click="router.push('/')">홈으로 이동</button>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  text-align: center;
}

h1 {
  font-size: 80px;
  color: #8b5cf6;
  margin: 0;
}

h2 {
  margin: 0;
}

p {
  color: #666;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #8b5cf6;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #7c3aed;
}
</style>
