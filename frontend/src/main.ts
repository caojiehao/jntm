import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'nprogress/nprogress.css'
import './styles/main.scss'

import App from './App.vue'
import router from './router'

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置Pinia
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('全局错误:', error)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
}

// 挂载应用
app.mount('#app')