import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

//여기도 잘 건드리지 않는다. -> 뭐 설정할 때 한명이 잠깐 정도

// 최상위 컴포넌트 지정하기
const app = createApp(App)

app.use(createPinia())
app.use(router)

// index.html에 id 부분에 app을 마운트
app.mount('#app')
