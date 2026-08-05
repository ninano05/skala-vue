<script setup>
import StoreCounter from '../components/practice/library/StoreCounter.vue'
import AxiosWeather from '../components/practice/library/AxiosWeather.vue'
import AxiosJson from '../components/practice/library/AxiosJson.vue'
import ElementPlus from '../components/practice/library/ElementPlus.vue'
import EcmaScript from '../components/practice/library/EcmaScript.vue'
</script>

<template>
  <div class="practice-container">
    <br />
    <p>실습 코드를 확인하기 위한 페이지로 반응형이 아닙니다.</p>
    <p>(모바일 접근x)</p>
    <h1>1. Store</h1>
    <StoreCounter />
    <h1>2. Axios</h1>
    <AxiosWeather />
    <AxiosJson />
    <h1>3. Element Plus</h1>
    <ElementPlus />
    <h1>4. Modern JavaScript</h1>
    <EcmaScript />
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/practice.css';
</style>
