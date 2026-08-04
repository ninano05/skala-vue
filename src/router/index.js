import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 정적 import - 애플리케이션 시작 시점에 번들링되어 로딩됨
    // 초반에 로딩이 많아지면 초기 로딩 속도가 느려질 수 있음
    // 날씨 최종 실습 view
    {
      path: '/',
      name: 'WeatherHomeView',
      component: WeatherHomeView,
    },
    // 동적 import - 필요할 때 로딩됨 (코드 스플리팅)
    {
      path: '/about',
      name: 'WeatherAboutView',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/detail/:cityName',
      name: 'WeatherDetailView',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/verydetail/:cityName',
      name: 'WeatherVeryDetailView',
      component: () => import('../views/WeatherVeryDetailView.vue'),
    },
    // 실습 1일차 practice view
    {
      path: '/day1',
      name: 'Day1PracticeView',
      component: () => import('../views/Day1PracticeView.vue'),
    },
    // 실습 2일차 practice view
    {
      path: '/day2',
      name: 'Day2PracticeView',
      component: () => import('../views/Day2PracticeView.vue'),
    },
    // 실습 3일차 practice view
    {
      path: '/day3',
      name: 'Day3PracticeView',
      component: () => import('../views/Day3PracticeView.vue'),
    },
    // 정의되지 않은 경로
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
