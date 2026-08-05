<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import {
  faTemperatureArrowUp,
  faTemperatureArrowDown,
  faSun,
  faCloudShowersHeavy,
  faCloud,
  faStar,
} from '@fortawesome/free-solid-svg-icons'

// city       : 표시할 도시 객체 { id, name, temp, status }
// isSelected : 현재 선택된 카드인지 여부 (선택 상태는 부모가 관리)
const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

// select-card  : 카드 클릭 → 부모에게 선택된 도시 객체 전달
// click-detail : 상세보기 버튼 클릭 → 부모에게 도시 객체 전달
const emit = defineEmits(['select-card', 'click-detail'])

const onSelect = () => {
  emit('select-card', props.city)
}

const onDetail = () => {
  emit('click-detail', props.city)
}

const configStore = useConfigStore()

// 즐겨찾기는 전역 상태라 부모를 거치지 않고 스토어를 직접 사용한다 (configStore와 동일한 방식)
const favoriteStore = useFavoriteStore()

const isFavorite = computed(() => favoriteStore.isFavorite(props.city.id))

const onToggleFavorite = () => {
  favoriteStore.toggleFavorite(props.city)
}

// 썹시 화씨로 변환
const displayTemp = computed(() => {
  const rawTemp = props.city.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})

//현재 단위 기호
const unitSymbol = computed(() => {
  return configStore.unit === 'fahrenheit' ? '°F' : '°C'
})

// 기준 온도 25°C를 현재 단위로 변환(더움 기준 표시 온도 변화하기 위해)
const standardTemp = computed(() => {
  if (configStore.unit === 'fahrenheit') {
    return 80
  }
  return 28
})
</script>

<template>
  <div class="weatherCard" :class="{ selected: isSelected }" @click="onSelect">
    <!-- .stop : 별 클릭이 카드 선택(select-card)까지 전파되지 않도록 차단 -->
    <button
      type="button"
      class="favorite-btn"
      :class="{ active: isFavorite }"
      :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
      @click.stop="onToggleFavorite"
    >
      <FontAwesomeIcon :icon="faStar" />
    </button>

    <p class="region-title" v-if="city.status === '맑음'">
      <FontAwesomeIcon :icon="faSun" style="color: rgb(255, 129, 9)" />
      {{ city.name }} ({{ city.status }})
    </p>
    <p class="region-title" v-else-if="city.status === '비'">
      <FontAwesomeIcon :icon="faCloudShowersHeavy" style="color: rgb(116, 192, 252)" />
      {{ city.name }} ({{ city.status }})
    </p>
    <p class="region-title" v-else-if="city.status === '구름'">
      <FontAwesomeIcon :icon="faCloud" style="color: rgb(129, 139, 165)" />
      {{ city.name }} ({{ city.status }})
    </p>

    <p>현재기온: {{ displayTemp }}{{ unitSymbol }}</p>

    <p v-if="city.temp < 28" class="cool-temperature-badge">
      <FontAwesomeIcon
        :icon="faTemperatureArrowDown"
        style="color: rgb(61, 77, 247); margin-right: 5px"
      />선선함({{ standardTemp }}{{ unitSymbol }} 미만)
    </p>
    <p v-else class="hot-temperature-badge">
      <FontAwesomeIcon
        :icon="faTemperatureArrowUp"
        style="color: rgb(225, 51, 51); margin-right: 5px"
      />더움({{ standardTemp }}{{ unitSymbol }} 이상)
    </p>

    <!-- .stop : 버튼 클릭이 카드 선택(select-card)까지 전파되지 않도록 차단 -->
    <button class="detail-btn" @click.stop="onDetail">상세보기</button>
  </div>
</template>

<style scoped>
.weatherCard {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: white;
  order: 1px solid #c4b5fd;
  border-radius: 10px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
/* 마우스를 날씨 카드에 올렸을 때 */
.weatherCard:hover {
  border-color: rgb(145, 145, 245);
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(80, 80, 150, 0.18);
}
/* 선택된 카드 */
.weatherCard.selected {
  border: 1px solid;
  border-color: rgb(85, 85, 230);
  box-shadow: 0 0 0 3px rgba(85, 85, 230, 0.15);
}
.region-title {
  padding-right: 28px; /* 우측 상단 별 버튼과 글자가 겹치지 않도록 */
  font-weight: bold;
  font-size: 18px;
}

/* 즐겨찾기 별 버튼 */
.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;

  width: 28px;
  height: 28px;

  border: none;
  border-radius: 50%;
  background-color: transparent;

  color: #d8d4e4;
  font-size: 16px;
  cursor: pointer;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.favorite-btn:hover {
  background-color: #f3effe;
  transform: scale(1.15);
}

.favorite-btn.active {
  color: #f5b301;
}
.cool-temperature-badge,
.hot-temperature-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;

  width: fit-content;
  padding: 4px 8px;
  margin: 3px 0;

  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}
.cool-temperature-badge {
  background-color: rgb(206, 229, 255);
}
.hot-temperature-badge {
  background-color: rgb(255, 213, 213);
}
.detail-btn {
  align-self: flex-start;
  width: 100%;
  height: 30px;
  margin-top: 10px;

  border: 1px solid #e7cdfc;
  border-radius: 10px;
  background: linear-gradient(135deg, #efe1ff, #ddd6ff);
  /* background-color: rgb(215, 215, 253); */
  font-weight: bold;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.detail-btn:hover {
  border: 1px solid #d5c1e5;
  /* background-color: rgb(180, 180, 245); */
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(80, 80, 150, 0.2);
}
.detail-btn:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
