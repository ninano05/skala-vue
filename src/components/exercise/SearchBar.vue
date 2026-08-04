<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

// 부모(WeatherParent)로부터 검색어를 전달받아 표시만 한다 (단방향 데이터 흐름)
defineProps({
  keyword: {
    type: String,
    default: '',
  },
})

// update-query : 타이핑할 때마다 검색어를 부모에게 전달
// search-city  : 입력 확정(Enter/blur) 시 부모에게 검색 실행을 요청
const emit = defineEmits(['update-query', 'search-city'])

const onInput = (event) => {
  emit('update-query', event.target.value)
}

const onChange = () => {
  emit('search-city')
}
</script>

<template>
  <div class="search-input-container">
    <h3 id="search-title">
      <FontAwesomeIcon :icon="faMagnifyingGlass" style="color: rgb(0, 0, 0)" />도시 검색
    </h3>
    <p id="search-guide">
      원하는 도시를 검색한 후 Enter키를 눌러주세요! (시/구/동 단위 검색 가능합니다)
    </p>

    <!-- props는 직접 수정하지 않고 :value 로 표시 + @input 으로 이벤트만 올려보낸다 -->
    <input
      type="text"
      class="search-input"
      :value="keyword"
      @input="onInput"
      @change="onChange"
      placeholder="검색할 도시를 입력해주세요."
    />

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
.search-input {
  width: 100%;
  max-width: 500px;
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
#search-title {
  margin: 5px 0 5px 5px;
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
}

@media (max-width: 600px) {
  .search-input {
    max-width: none;
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
