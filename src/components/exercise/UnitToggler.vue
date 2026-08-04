<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">온도 단위 변경</span>

    <div class="unit-button-group">
      <button
        type="button"
        class="unit-button"
        :class="{ active: configStore.unit === 'celsius' }"
        @click="configStore.setUnit('celsius')"
      >
        °C
      </button>

      <button
        type="button"
        class="unit-button"
        :class="{ active: configStore.unit === 'fahrenheit' }"
        @click="configStore.setUnit('fahrenheit')"
      >
        °F
      </button>
    </div>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 5px 7px 5px 10px;

  background-color: #f8f5ff;
  border: 1px solid #e9d5ff;
  border-radius: 12px;

  box-shadow: 0 4px 10px rgba(196, 181, 253, 0.2);
}

.unit-label {
  color: #7c6a9f;
  font-size: 12px;
  font-weight: 700;
}

.unit-button-group {
  display: flex;
  align-items: center;
  gap: 3px;
}

.unit-button {
  width: 36px;
  height: 32px;

  border: none;
  border-radius: 8px;

  color: #7c6a9f;
  background-color: transparent;

  font-size: 15px;
  font-weight: 800;
  cursor: pointer;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.unit-button:hover {
  color: #6d4fc2;
  background-color: #ede9fe;
  transform: translateY(-1px);
}

.unit-button.active {
  color: white;
  background: linear-gradient(135deg, #c4b5fd, #a78bfa);
  box-shadow: 0 4px 9px rgba(167, 139, 250, 0.35);
}

.unit-button:active {
  transform: translateY(0);
}
</style>
