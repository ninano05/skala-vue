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
.dashboard-card {
  width: 100%;
  max-width: 800px;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #e5dfff 0%, #dad2fa 55%, #d4c8ff 100%);
  border: 1px solid #ecdbff;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(139, 92, 246, 0.12);
}

@media (max-width: 600px) {
  .dashboard-card {
    padding: 8px;
    margin-bottom: 14px;
    border-radius: 8px;
  }
}
</style>
