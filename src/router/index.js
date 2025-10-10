import TrangChu from '@/components/TrangChu.vue'
import { createRouter, createWebHistory } from 'vue-router'
import MapBus from '../components/MapBus.vue'

const routes = [
  {
    path: '/trang-chu',
    name: 'TrangChu',
    component: TrangChu,
    meta: { requiresAuth: false },
  },
  {
    path: '/map-bus',
    name: 'MapBus',
    component: MapBus,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/trang-chu',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('googleUser')

  if (to.meta.requiresAuth && !user) {
    next('/trang-chu')
  } else {
    next()
  }
})

export default router
