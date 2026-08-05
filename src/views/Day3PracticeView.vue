<script setup>
import StoreCounter from '../components/practice/library/StoreCounter.vue'
import AxiosWeather from '../components/practice/library/AxiosWeather.vue'
import AxiosJson from '../components/practice/library/AxiosJson.vue'
import ElementPlus from '../components/practice/library/ElementPlus.vue'
import EcmaScript from '../components/practice/library/EcmaScript.vue'
</script>

<template>
  <div class="practice-container">
    <h1>1. Store</h1>
    <hr />
    <StoreCounter />
    <h1>2. Axios</h1>
    <hr />
    <AxiosWeather />
    <AxiosJson />
    <h1>3. Element Plus</h1>
    <hr />
    <ElementPlus />
    <h1>4. Modern JavaScript</h1>
    <hr />
    <EcmaScript />
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/practice.css';
</style>
