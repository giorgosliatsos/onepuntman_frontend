import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue')
    },
    {
      path: '/not-allowed',
      name: 'not-allowed',
      component: () => import('@/views/NotAllowedView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pick',
      name: 'pick',
      component: () => import('@/views/PickView.vue'),
      meta: { requiresAuth: true, requiresAllowed: true }
    },
    {
      path: '/standings',
      name: 'standings',
      component: () => import('@/views/StandingsView.vue'),
      meta: { requiresAuth: true, requiresAllowed: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next(authStore.user?.isAllowed ? { name: 'pick' } : { name: 'not-allowed' })
  } else if (to.meta.requiresAdmin && !authStore.user?.isAdmin) {
    next({ name: 'pick' })
  } else if (to.meta.requiresAllowed && !authStore.user?.isAllowed) {
    next({ name: 'not-allowed' })
  } else {
    next()
  }
})

export default router
