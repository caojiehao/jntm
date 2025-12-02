import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

// 路由懒加载
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Dashboard = () => import('@/views/dashboard/index.vue')
const Portfolio = () => import('@/views/portfolio/index.vue')
const AddFund = () => import('@/views/portfolio/AddFund.vue')
const FundDetail = () => import('@/views/portfolio/FundDetail.vue')
const Themes = () => import('@/views/themes/index.vue')
const ThemeDetail = () => import('@/views/themes/ThemeDetail.vue')
const Analysis = () => import('@/views/analysis/index.vue')
const AIChat = () => import('@/views/analysis/AIChat.vue')
const OCRScanner = () => import('@/views/tools/OCRScanner.vue')
const Profile = () => import('@/views/profile/index.vue')
const Settings = () => import('@/views/settings/index.vue')
const NotFound = () => import('@/views/error/NotFound.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      layout: 'auth'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false,
      layout: 'auth'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: Portfolio,
    meta: {
      title: '我的基金',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/portfolio/add',
    name: 'AddFund',
    component: AddFund,
    meta: {
      title: '添加基金',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/portfolio/:fundCode',
    name: 'FundDetail',
    component: FundDetail,
    props: true,
    meta: {
      title: '基金详情',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/themes',
    name: 'Themes',
    component: Themes,
    meta: {
      title: '投资主题',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/themes/:themeKey',
    name: 'ThemeDetail',
    component: ThemeDetail,
    props: true,
    meta: {
      title: '主题详情',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
    meta: {
      title: '投资分析',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/analysis/ai-chat',
    name: 'AIChat',
    component: AIChat,
    meta: {
      title: 'AI投资顾问',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/tools/ocr',
    name: 'OCRScanner',
    component: OCRScanner,
    meta: {
      title: '基金截图识别',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人资料',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置',
      requiresAuth: true,
      layout: 'main'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到',
      requiresAuth: false,
      layout: 'error'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const themeStore = useThemeStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 基你太美`
  }

  // 初始化用户状态
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // 初始化主题
  if (!themeStore.isInitialized) {
    await themeStore.initializeTheme()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 保存重定向路径
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    // 已登录用户访问登录页，重定向到仪表板
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router