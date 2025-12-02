<template>
  <div class="base-chart">
    <div
      ref="chartRef"
      :class="['chart-container', className]"
      :style="{ width: width, height: height }"
    />
    <div v-if="loading" class="chart-loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>{{ loadingText }}</span>
    </div>
    <div v-if="error" class="chart-error">
      <el-icon><CircleClose /></el-icon>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, type PropType } from 'vue'
import { Loading, CircleClose } from '@element-plus/icons-vue'
import { init, type ECharts, type ECOption } from 'echarts/core'
import { useThemeStore } from '@/stores/theme'

interface Props {
  option: ECOption
  width?: string
  height?: string
  className?: string
  loading?: boolean
  loadingText?: string
  autoResize?: boolean
  notMerge?: boolean
  lazyUpdate?: boolean
  silent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  className: '',
  loading: false,
  loadingText: '图表加载中...',
  autoResize: true,
  notMerge: false,
  lazyUpdate: true,
  silent: false
})

const emit = defineEmits<{
  ready: [chart: ECharts]
  click: [params: any]
  doubleClick: [params: any]
  mouseDown: [params: any]
  mouseMove: [params: any]
  mouseUp: [params: any]
  mouseOver: [params: any]
  mouseOut: [params: any]
  globalOut: [params: any]
  contextMenu: [params: any]
  dataZoom: [params: any]
  brush: [params: any]
  brushEnd: [params: any]
  brushSelect: [params: any]
  legendSelectChanged: [params: any]
  legendSelected: [params: any]
  legendUnSelected: [params: any]
  legendScroll: [params: any]
  magicTypeChanged: [params: any]
  dataViewChanged: [params: any]
  restore: [params: any]
  saveAsImage: [params: any]
}>()

const chartRef = ref<HTMLElement>()
const chart = ref<ECharts>()
const error = ref<string>('')
const themeStore = useThemeStore()

/**
 * 初始化图表
 */
const initChart = async () => {
  if (!chartRef.value) return

  try {
    // 动态导入ECharts组件以减少初始包大小
    const {
      BarChart,
      LineChart,
      PieChart,
      RadarChart,
      GaugeChart,
      ScatterChart,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      DataZoomComponent,
      ToolboxComponent,
      MarkPointComponent,
      MarkLineComponent,
      MarkAreaComponent
    } = await import('echarts/charts')
    const {
      CanvasRenderer
    } = await import('echarts/renderers')

    // 注册必要的组件
    const echarts = await import('echarts/core')
    echarts.use([
      BarChart,
      LineChart,
      PieChart,
      RadarChart,
      GaugeChart,
      ScatterChart,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      DataZoomComponent,
      ToolboxComponent,
      MarkPointComponent,
      MarkLineComponent,
      MarkAreaComponent,
      CanvasRenderer
    ])

    // 创建图表实例
    chart.value = init(chartRef.value, 'light', {
      renderer: 'canvas',
      useDirtyRect: false
    })

    // 绑定事件
    bindEvents()

    // 设置主题色彩
    updateThemeColors()

    // 设置配置项
    chart.value.setOption(props.option, props.notMerge, props.lazyUpdate, props.silent)

    // 触发就绪事件
    emit('ready', chart.value)

    console.log('✅ ECharts实例创建成功')
  } catch (err) {
    console.error('❌ ECharts初始化失败:', err)
    error.value = '图表初始化失败，请检查配置'
  }
}

/**
 * 绑定图表事件
 */
const bindEvents = () => {
  if (!chart.value) return

  const events = [
    'click',
    'dblclick',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseover',
    'mouseout',
    'globalout',
    'contextmenu',
    'dataZoom',
    'brush',
    'brushEnd',
    'brushSelect',
    'legendSelectChanged',
    'legendSelected',
    'legendUnSelected',
    'legendScroll',
    'magicTypeChanged',
    'dataViewChanged',
    'restore',
    'saveAsImage'
  ]

  events.forEach(event => {
    chart.value!.on(event, (params: any) => {
      // 将事件名转换为驼峰命名
      const camelCaseEvent = event.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      emit(camelCaseEvent as any, params)
    })
  })
}

/**
 * 更新主题色彩
 */
const updateThemeColors = () => {
  if (!chart.value) return

  const themeColors = {
    fire: ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d3f261'],
    global: ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff'],
    inflation: ['#fa8c16', '#ffa940', '#ffc53d', '#ffd666', '#ffe58f']
  }

  const colors = themeColors[themeStore.currentTheme as keyof typeof themeColors] || themeColors.fire

  if (props.option.series) {
    props.option.series.forEach((series: any, index: number) => {
      if (!series.color) {
        series.color = colors[index % colors.length]
      }
    })
  }
}

/**
 * 调整图表大小
 */
const resize = () => {
  if (chart.value) {
    chart.value.resize()
  }
}

/**
 * 销毁图表
 */
const dispose = () => {
  if (chart.value) {
    chart.value.dispose()
    chart.value = undefined
  }
}

/**
 * 重新加载图表
 */
const reload = async () => {
  dispose()
  await nextTick()
  await initChart()
}

// 监听配置变化
watch(
  () => props.option,
  (newOption) => {
    if (chart.value) {
      updateThemeColors()
      chart.value.setOption(newOption, props.notMerge, props.lazyUpdate, props.silent)
    }
  },
  { deep: true }
)

// 监听主题变化
watch(
  () => themeStore.currentTheme,
  () => {
    reload()
  }
)

// 监听loading状态
watch(
  () => props.loading,
  (loading) => {
    if (chart.value) {
      if (loading) {
        chart.value.showLoading('default', {
          text: props.loadingText,
          color: themeStore.themeColor,
          textColor: '#666',
          maskColor: 'rgba(255, 255, 255, 0.8)',
          zlevel: 0,
          fontSize: 12,
          showSpinner: true,
          spinnerRadius: 10,
          lineWidth: 5
        })
      } else {
        chart.value.hideLoading()
      }
    }
  }
)

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

// 组件卸载前销毁图表
onBeforeUnmount(() => {
  dispose()
})

// 监听窗口大小变化
if (props.autoResize) {
  window.addEventListener('resize', resize)
}

onBeforeUnmount(() => {
  if (props.autoResize) {
    window.removeEventListener('resize', resize)
  }
})

// 暴露方法给父组件
defineExpose({
  chart,
  resize,
  dispose,
  reload,
  getEchartsInstance: () => chart.value
})
</script>

<style lang="scss" scoped>
.base-chart {
  position: relative;
  width: 100%;
  height: 100%;

  .chart-container {
    width: 100%;
    height: 100%;
  }

  .chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    z-index: 1;

    .el-icon {
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--theme-primary, #409eff);
    }

    span {
      font-size: 14px;
      color: #666;
    }
  }

  .chart-error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fafafa;
    z-index: 1;

    .el-icon {
      font-size: 32px;
      margin-bottom: 12px;
      color: #f56c6c;
    }

    span {
      font-size: 14px;
      color: #666;
      text-align: center;
      max-width: 80%;
    }
  }
}

.dark-theme {
  .chart-loading {
    background: rgba(0, 0, 0, 0.8);

    span {
      color: #ccc;
    }
  }

  .chart-error {
    background: #2f2f2f;

    span {
      color: #ccc;
    }
  }
}
</style>