<!--1일차 실습 바로보기-->
<script setup>
// 컴포넌트 가져오기
import EventBasic from '../components/practice/basic/EventBasic.vue'
import EventModifier from '../components/practice/basic/EventModifier.vue'
import EventObject from '../components/practice/basic/EventObject.vue'

import ModelBasic from '@/components/practice/basic/ModelBasic.vue'
import ModelForm from '@/components/practice/basic/ModelForm.vue'
import ModelModifier from '../components/practice/basic/ModelModifier.vue'

import SampleOne from '../components/practice/basic/SampleOne.vue'
import SampleTwo from '../components/practice/basic/SampleTwo.vue'

import VueBind from '@/components/practice/basic/VueBind.vue'
import VueBindClass from '@/components/practice/basic/VueBindClass.vue'
import VueBindShortedhand from '@/components/practice/basic/VueBindShortedhand.vue'
import VueBindStyle from '@/components/practice/basic/VueBindStyle.vue'
import VueCloak from '@/components/practice/basic/VueCloak.vue'
import VueFor from '@/components/practice/basic/VueFor.vue'

import VueHtml from '../components/practice/basic/VueHtml.vue'
import VueHtmlXss from '@/components/practice/basic/VueHtmlXss.vue'

import VueIf from '@/components/practice/basic/VueIf.vue'
import VueMemo from '@/components/practice/basic/VueMemo.vue'
import VueOnce from '@/components/practice/basic/VueOnce.vue'
import VuePre from '@/components/practice/basic/VuePre.vue'
import VueShow from '@/components/practice/basic/VueShow.vue'
import VueText from '@/components/practice/basic/VueText.vue'
</script>

<template>
  <div class="practice-container">
    <h1>1일차 Vue practice 실습</h1>

    <SampleOne></SampleOne>
    <SampleTwo></SampleTwo>

    <VueHtml></VueHtml>
    <VueHtmlXss></VueHtmlXss>

    <EventBasic></EventBasic>
    <EventObject></EventObject>
    <EventModifier></EventModifier>

    <ModelBasic></ModelBasic>
    <ModelForm></ModelForm>
    <ModelModifier></ModelModifier>

    <VueBind></VueBind>
    <VueBindClass></VueBindClass>
    <VueBindShortedhand></VueBindShortedhand>
    <VueBindStyle></VueBindStyle>
    <VueCloak></VueCloak>
    <VueFor></VueFor>

    <VueIf></VueIf>
    <VueMemo></VueMemo>
    <VueOnce></VueOnce>
    <VuePre></VuePre>
    <VueShow></VueShow>
    <VueText></VueText>
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/practice.css';
</style>
