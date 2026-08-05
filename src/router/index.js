import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

// 뒤로/앞으로 이동 직후에는 데이터 로딩이 끝나기 전이라 페이지가 짧아서 스크롤 복원이 실패한다
// 복원할 위치까지 스크롤할 수 있을 만큼 콘텐츠가 채워질 때까지 기다린다 (최대 3초)
const waitForScrollHeight = (top, timeout = 3000) => {
  return new Promise((resolve) => {
    const startedAt = Date.now()

    const check = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight

      if (scrollableHeight >= top || Date.now() - startedAt > timeout) {
        resolve()
        return
      }

      requestAnimationFrame(check)
    }

    check()
  })
}

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
    // {
    //   path: '/detail/:cityName',
    //   name: 'WeatherDetailView',
    //   component: () => import('../views/WeatherDetailView.vue'),
    // },
    {
      path: '/umbrella',
      name: 'WeatherUmbrellaView',
      component: () => import('../views/WeatherUmbrellaView.vue'),
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
  // 페이지 이동 시 항상 최상단(navBar)부터 보이도록
  // 단, 뒤로/앞으로 가기는 이전에 보던 위치를 복원한다
  // 첫 진입/새로고침은 from이 시작 위치(from.name === undefined)라
  // savedPosition이 있어도 무시하고 최상단으로 보낸다
  async scrollBehavior(to, from, savedPosition) {
    if (savedPosition && from.name !== undefined) {
      await waitForScrollHeight(savedPosition.top)

      return savedPosition
    }

    return { top: 0 }
  },
})

export default router
