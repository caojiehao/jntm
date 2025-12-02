/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_AI: string
  readonly VITE_ENABLE_OCR: string
  readonly VITE_ENABLE_THEMES: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_AVAILABLE_THEMES: string
  readonly VITE_CHART_ANIMATION: string
  readonly VITE_CHART_REFRESH_INTERVAL: string
  readonly VITE_DEV_MOCK_DATA: string
  readonly VITE_DEV_SHOW_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}