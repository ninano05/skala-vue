<!--2일차 실습 View-->
<script setup>
import ComputedBasic from '../components/practice/composition/ComputedBasic.vue'
import ReactiveRef from '../components/practice/composition/ReactiveRef.vue'
import ReactiveReactive from '@/components/practice/composition/ReactiveReactive.vue'

import LifecycleChild from '../components/practice/component/LifecycleChild.vue'
import LifecycleParent from '../components/practice/component/LifecycleParent.vue'

import WatchersBasic from '@/components/practice/composition/WatchersBasic.vue'
import WatchersDeep from '@/components/practice/composition/WatchersDeep.vue'
import WatchersMulti from '@/components/practice/composition/WatchersMulti.vue'
import WatchersReactive from '@/components/practice/composition/WatchersReactive.vue'
import WatchersReactiveArray from '@/components/practice/composition/WatchersReactiveArray.vue'
import WatchersRefArray from '@/components/practice/composition/WatchersRefArray.vue'
import WatchersWatchEffect from '@/components/practice/composition/WatchersWatchEffect.vue'

import PropsEmitsParent from '@/components/practice/component/PropsEmitsParent.vue'
import SlotDefaultParent from '@/components/practice/component/SlotDefaultParent.vue'
import SlotNamedParent from '@/components/practice/component/SlotNamedParent.vue'
import SlotScopedParent from '@/components/practice/component/SlotScopedParent.vue'
</script>

<template>
  <div class="practice-container">
    <h1>1. Reactive State</h1>
    <hr />
    <ReactiveRef />
    <ReactiveReactive />
    <h1>2. Computed & Watchers</h1>
    <hr />
    <ComputedBasic />
    <WatchersBasic />
    <WatchersMulti />
    <WatchersDeep />
    <WatchersReactive />
    <WatchersRefArray />
    <WatchersReactiveArray />
    <WatchersWatchEffect />
    <h1>3. Component Lifecycle</h1>
    <hr />
    <LifecycleParent />
    <LifecycleChild />
    <h1>4. Props & Emits</h1>
    <hr />
    <PropsEmitsParent />
    <h1>5. Component Slot</h1>
    <hr />
    <SlotDefaultParent />
    <SlotNamedParent />
    <SlotScopedParent />
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/practice.css';
</style>
