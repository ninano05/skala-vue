<script setup>
import { ref, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

// 부모(WeatherParent)로부터 검색어와 자동완성 후보를 전달받아 표시만 한다 (단방향 데이터 흐름)
const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  isSuggestLoading: {
    type: Boolean,
    default: false,
  },
})

// update-query      : 타이핑할 때마다 검색어를 부모에게 전달
// search-city       : 입력 확정(Enter) 시 부모에게 검색 실행을 요청
// select-suggestion : 자동완성 후보를 고르면 해당 도시 정보를 부모에게 전달
const emit = defineEmits(['update-query', 'search-city', 'select-suggestion'])

// 자동완성 목록 열림 여부와 키보드로 선택 중인 항목 (-1이면 선택 없음)
const isOpen = ref(false)
const activeIndex = ref(-1)
const listRef = ref(null)

// 방향키로 이동한 항목이 목록 밖으로 벗어나면 목록만 스크롤한다 (페이지는 움직이지 않게)
const scrollActiveIntoView = async () => {
  await nextTick()

  const list = listRef.value
  const item = list?.querySelectorAll('.suggestion-item')[activeIndex.value]

  if (!item) return

  if (item.offsetTop < list.scrollTop) {
    list.scrollTop = item.offsetTop
    return
  }

  const itemBottom = item.offsetTop + item.offsetHeight

  if (itemBottom > list.scrollTop + list.clientHeight) {
    list.scrollTop = itemBottom - list.clientHeight
  }
}

const closeList = () => {
  isOpen.value = false
  activeIndex.value = -1
}

const select = (city) => {
  closeList()
  emit('select-suggestion', city)
}

const onInput = (event) => {
  isOpen.value = true
  activeIndex.value = -1
  emit('update-query', event.target.value)
}

const onFocus = () => {
  isOpen.value = true
}

// 목록 위에서 누른 경우엔 mousedown.prevent 덕분에 blur가 발생하지 않으므로 여기서 닫아도 안전하다
const onBlur = () => {
  closeList()
}

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    closeList()
    return
  }

  // 목록이 닫혀 있거나 후보가 없으면 기존 Enter 검색 동작을 그대로 사용한다
  if (!isOpen.value || props.suggestions.length === 0) {
    if (event.key === 'Enter') {
      emit('search-city')
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % props.suggestions.length
    scrollActiveIntoView()
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value =
      activeIndex.value <= 0 ? props.suggestions.length - 1 : activeIndex.value - 1
    scrollActiveIntoView()
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()

    if (activeIndex.value >= 0) {
      select(props.suggestions[activeIndex.value])
      return
    }

    closeList()
    emit('search-city')
  }
}
</script>

<template>
  <div class="search-input-container">
    <h3 id="search-title">
      <FontAwesomeIcon :icon="faMagnifyingGlass" style="color: rgb(0, 0, 0)" />도시 검색
    </h3>
    <!-- 지오코딩이 접두어 검색을 지원하지 않아, 동·리는 전체 이름을 입력해야 한다 -->
    <p id="search-guide">
      도시명을 입력하면 아래 목록에서 고를 수 있습니다. (동·리는 '역삼동'처럼 전체 이름을
      입력해주세요)
    </p>

    <!-- props는 직접 수정하지 않고 :value 로 표시 + @input 으로 이벤트만 올려보낸다 -->
    <div class="search-input-wrapper">
      <input
        type="text"
        class="search-input"
        :value="keyword"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        placeholder="검색할 도시를 입력해주세요."
      />

      <!-- 자동완성 목록 (input 아래에 겹쳐서 표시 - 아래 내용을 밀어내지 않는다) -->
      <!-- 목록 전체에 mousedown.prevent를 걸어, 어디를 누르든 input이 blur되어 목록이 닫히지 않게 한다 -->
      <ul
        v-if="isOpen && keyword.trim() !== ''"
        ref="listRef"
        class="suggestion-list"
        @mousedown.prevent
      >
        <li v-if="suggestions.length === 0 && isSuggestLoading" class="suggestion-status">
          도시를 찾는 중입니다...
        </li>

        <li v-else-if="suggestions.length === 0" class="suggestion-status">
          검색 결과가 없습니다.
        </li>

        <!-- 재조회 중에도 이전 결과를 그대로 둔다 (클릭 직전에 항목이 사라져 클릭이 유실되는 것을 방지) -->
        <template v-else>
          <li
            v-for="(city, index) in suggestions"
            :key="city.id"
            class="suggestion-item"
            :class="{ active: index === activeIndex }"
            :title="city.coords"
            @click="select(city)"
            @mouseenter="activeIndex = index"
          >
            <span class="suggestion-name">{{ city.name }}</span>
            <span class="suggestion-region">{{ city.region }}</span>
          </li>

          <li v-if="isSuggestLoading" class="suggestion-status">갱신 중...</li>
        </template>
      </ul>
    </div>

    <p id="search-result">
      검색 중인 도시: <strong>{{ keyword }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-input-container {
  width: 100%;
  min-width: 0;
}
h3 {
  font-weight: bold;
}
.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
}
.search-input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  box-sizing: border-box;
  border: 1px solid #c4b5fd;
  border-radius: 10px;
  font-size: 16px;
}
.search-input:focus {
  outline: 1px solid rgb(85, 85, 230);
  border-color: rgb(85, 85, 230);
}
/* 자동완성 목록 */
.suggestion-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;

  max-height: 220px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;

  list-style: none;
  background: white;
  border: 1px solid #c4b5fd;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(139, 92, 246, 0.18);
}
.suggestion-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.suggestion-item.active {
  background-color: #f3ecff;
}
.suggestion-name {
  font-size: 15px;
  font-weight: 700;
}
.suggestion-region {
  color: #8a94a6;
  font-size: 12px;
}
.suggestion-status {
  padding: 9px 10px;
  color: #8a94a6;
  font-size: 13px;
  font-weight: 600;
}

#search-title {
  margin: 10px 0 5px 5px;
}
#search-result {
  margin: 6px 0 0 5px;
  font-size: 14px;
  font-weight: bold;
  word-break: break-word;
}
#search-guide {
  font-weight: bold;
  font-size: 12px;
  margin-left: 10px;
  margin-bottom: 10px;
}

@media (max-width: 600px) {
  .search-input-wrapper {
    max-width: none;
  }
  .search-input {
    height: 40px;
    font-size: 15px;
  }
  #search-title {
    font-size: 17px;
  }
  #search-result {
    font-size: 13px;
  }
}
</style>
