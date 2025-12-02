<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <el-config-provider :locale="zhCn">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const themeStore = useThemeStore()

// 主题模式控制
const isDarkMode = computed(() => themeStore.isDarkMode)
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 全局滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

// 暗色主题样式
.dark-theme {
  color-scheme: dark;

  ::-webkit-scrollbar-track {
    background: #2f2f2f;
  }

  ::-webkit-scrollbar-thumb {
    background: #555;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
}
</style>