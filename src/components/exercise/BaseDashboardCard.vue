<script setup>
// 순수 레이아웃용 컴포넌트 (props / emits 없음)
// 공통 배경 박스만 제공하고, 실제 내용물은 부모가 <slot>으로 주입한다.
</script>

<template>
  <div class="dashboard-card">
    <slot></slot>
  </div>
</template>

<style scoped>
/* 검색 영역 / 상태 바 / 카드 목록이 공통으로 쓰던 배경 박스 스타일 */
.dashboard-card {
  width: 800px;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;

  background-color: rgb(215, 215, 253);
  border: 1px solid lightgray;
  border-radius: 10px;
}
</style>
