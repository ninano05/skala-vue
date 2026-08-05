<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const dummy = ref(0)

const getMethodResult = () => {
  console.log('일반 함수 실행됨!')
  return count.value * 2
}

// 값이 바뀔 때 연산을 수행, 값이 바뀌지 않으면 캐싱된 값을 유지
const doubleCount = computed(() => {
  console.log('computed 연산 실행됨')
  return count.value * 2
})
</script>

<template>
  <div class="practice-section">
    <h2>computed() 캐싱 동작 비교</h2>

    <p>count: {{ count }} | dummy: {{ dummy }}</p>
    <button @click="count++">count 증가 (의존성 변경)</button>
    <button @click="dummy++">dummy 증가 (무관한 변경)</button>

    <!-- 버튼을 누를 때 콘솔 출력 차이를 확인 -->
    <p>일반 함수 결과: {{ getMethodResult() }}</p>
    <p>Computed 결과: {{ doubleCount }}</p>
  </div>
</template>

<style></style>
