<!--2일차 실습 View-->
<script setup>
import ComputedBasic from '../components/practice/composition/ComputedBasic.vue'
import ReactiveRef from '../components/practice/composition/ReactiveRef.vue'

import LifecycleChild from '../components/practice/component/LifecycleChild.vue'
import LifecycleParent from '../components/practice/component/LifecycleParent.vue'
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
