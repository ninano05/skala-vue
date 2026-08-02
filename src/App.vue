<script setup>
// 컴포넌트 가져오기

import EventBasic from './components/practice/basic/EventBasic.vue'
import EventModifier from './components/practice/basic/EventModifier.vue'
import EventObject from './components/practice/basic/EventObject.vue'
import ModelModifier from './components/practice/basic/ModelModifier.vue'
import SampleOne from './components/practice/basic/SampleOne.vue'
import SampleTwo from './components/practice/basic/SampleTwo.vue'
import VueHtml from './components/practice/basic/VueHtml.vue'

//날씨
import WeatherCard from './components/exercise/weatherCard.vue'
</script>

<template>
  <!-- <div class="practice-container">
    <h1>Hello Skala-Vue</h1>

    <SampleOne></SampleOne>

    <SampleTwo></SampleTwo>

    <VueHtml></VueHtml>

    <EventBasic></EventBasic>

    <EventObject></EventObject>

    <EventModifier></EventModifier>

    <ModelModifier></ModelModifier>
  </div> -->
  <div>
    <WeatherCard></WeatherCard>
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/practice.css';
</style>
