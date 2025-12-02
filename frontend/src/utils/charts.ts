import type { ECOption } from '@/types'

/**
 * 图表工具类
 */
export class ChartUtils {
  /**
   * 生成饼图配置
   */
  static generatePieChart(data: { name: string; value: number }[], title?: string): ECOption {
    return {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      } : undefined,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: title || '数据',
          type: 'pie',
          radius: '50%',
          data: data.sort((a, b) => b.value - a.value),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  /**
   * 生成折线图配置
   */
  static generateLineChart(
    xAxisData: string[],
    seriesData: { name: string; data: number[]; color?: string }[],
    title?: string
  ): ECOption {
    return {
      title: title ? {
        text: title,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: seriesData.map(item => item.name),
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: seriesData.map(item => ({
        name: item.name,
        type: 'line',
        smooth: true,
        data: item.data,
        itemStyle: {
          color: item.color
        }
      }))
    }
  }

  /**
   * 生成柱状图配置
   */
  static generateBarChart(
    xAxisData: string[],
    seriesData: { name: string; data: number[]; color?: string }[],
    title?: string
  ): ECOption {
    return {
      title: title ? {
        text: title,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: seriesData.map(item => item.name),
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: seriesData.map(item => ({
        name: item.name,
        type: 'bar',
        data: item.data,
        itemStyle: {
          color: item.color
        }
      }))
    }
  }

  /**
   * 生成仪表盘配置
   */
  static generateGaugeChart(
    value: number,
    max: number = 100,
    title?: string,
    unit?: string
  ): ECOption {
    const percentage = (value / max) * 100

    return {
      title: title ? {
        text: title,
        left: 'center'
      } : undefined,
      series: [
        {
          name: title || '指标',
          type: 'gauge',
          detail: {
            formatter: `{value}${unit || ''}`,
            fontSize: 20,
            offsetCenter: [0, '70%']
          },
          data: [{ value, name: title || '当前值' }],
          progress: {
            show: true,
            width: 18
          },
          axisLine: {
            lineStyle: {
              width: 18
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999'
            }
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 12
          }
        }
      ]
    }
  }

  /**
   * 生成雷达图配置
   */
  static generateRadarChart(
    indicators: { name: string; max: number }[],
    data: { name: string; value: number[]; color?: string }[],
    title?: string
  ): ECOption {
    return {
      title: title ? {
        text: title,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: data.map(item => item.name),
        bottom: 0
      },
      radar: {
        indicator: indicators,
        radius: '60%'
      },
      series: [
        {
          name: title || '雷达图',
          type: 'radar',
          data: data.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: item.color
            }
          }))
        }
      ]
    }
  }

  /**
   * 生成散点图配置
   */
  static generateScatterChart(
    data: Array<[number, number]>,
    title?: string,
    xName?: string,
    yName?: string
  ): ECOption {
    return {
      title: title ? {
        text: title,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${xName || 'X'}: ${params.value[0]}<br/>${yName || 'Y'}: ${params.value[1]}`
        }
      },
      xAxis: {
        type: 'value',
        name: xName,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yName,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: title || '散点图',
          type: 'scatter',
          data: data,
          symbolSize: (data: any) => Math.sqrt(data[0]) * 2
        }
      ]
    }
  }

  /**
   * 格式化数值显示
   */
  static formatValue(value: number, decimals = 2): string {
    if (value === 0) return '0'

    if (Math.abs(value) >= 100000000) {
      return (value / 100000000).toFixed(decimals) + '亿'
    } else if (Math.abs(value) >= 10000) {
      return (value / 10000).toFixed(decimals) + '万'
    } else {
      return value.toFixed(decimals)
    }
  }

  /**
   * 格式化百分比
   */
  static formatPercentage(value: number, decimals = 2): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
  }

  /**
   * 获取主题色彩
   */
  static getThemeColors(theme: string): string[] {
    const colorMap: Record<string, string[]> = {
      fire: ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d3f261'],
      global: ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff'],
      inflation: ['#fa8c16', '#ffa940', '#ffc53d', '#ffd666', '#ffe58f']
    }

    return colorMap[theme] || ['#409eff', '#66b1ff', '#8cc8ff', '#b3d8ff', '#d6e4ff']
  }

  /**
   * 生成渐变色
   */
  static generateGradient(color: string, direction = 'vertical'): any {
    return {
      type: 'linear',
      x: direction === 'horizontal' ? 0 : 0.5,
      y: direction === 'vertical' ? 0 : 0.5,
      x2: direction === 'horizontal' ? 1 : 0.5,
      y2: direction === 'vertical' ? 1 : 0.5,
      colorStops: [
        {
          offset: 0,
          color: color
        },
        {
          offset: 1,
          color: this.adjustColorBrightness(color, 0.3)
        }
      ]
    }
  }

  /**
   * 调整颜色亮度
   */
  static adjustColorBrightness(color: string, factor: number): string {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const newR = Math.round(r + (255 - r) * factor)
    const newG = Math.round(g + (255 - g) * factor)
    const newB = Math.round(b + (255 - b) * factor)

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }
}

/**
 * 主题图表配置生成器
 */
export class ThemeChartGenerator {
  private theme: string
  private colors: string[]

  constructor(theme: string) {
    this.theme = theme
    this.colors = ChartUtils.getThemeColors(theme)
  }

  /**
   * 生成FIRE主题图表
   */
  generateFireCharts(data: any) {
    return {
      retirementProgress: ChartUtils.generateGaugeChart(
        data.metrics?.retirementReadiness || 0,
        100,
        '退休准备度',
        '%'
      ),
      withdrawalSimulator: ChartUtils.generateLineChart(
        data.years || [],
        [
          {
            name: '投资组合价值',
            data: data.portfolioValues || [],
            color: this.colors[0]
          },
          {
            name: '年取款额',
            data: data.withdrawalAmounts || [],
            color: this.colors[1]
          }
        ],
        '退休后取款模拟'
      ),
      savingsGrowth: ChartUtils.generateLineChart(
        data.months || [],
        [
          {
            name: '储蓄增长',
            data: data.savingsGrowth || [],
            color: this.colors[0]
          }
        ],
        '储蓄增长预测'
      )
    }
  }

  /**
   * 生成全球配置主题图表
   */
  generateGlobalCharts(data: any) {
    const allocation = data.metrics?.allocation || {}

    return {
      allocation: ChartUtils.generatePieChart(
        [
          { name: '美国', value: allocation.us || 0 },
          { name: '欧洲', value: allocation.europe || 0 },
          { name: '日本', value: allocation.japan || 0 },
          { name: '中国', value: allocation.china || 0 },
          { name: '新兴市场', value: allocation.emergingMarkets || 0 },
          { name: '其他', value: allocation.others || 0 }
        ],
        '全球资产配置'
      ),
      diversification: ChartUtils.generateRadarChart(
        [
          { name: '地域多元化', max: 100 },
          { name: '行业多元化', max: 100 },
          { name: '货币多元化', max: 100 },
          { name: '风格多元化', max: 100 },
          { name: '资产多元化', max: 100 }
        ],
        [
          {
            name: '当前配置',
            value: [
              allocation.us + allocation.europe + allocation.japan,
              70, // 示例数据
              60,
              80,
              75
            ],
            color: this.colors[0]
          },
          {
            name: '理想配置',
            value: [80, 80, 70, 75, 85],
            color: this.colors[1]
          }
        ],
        '多元化分析'
      ),
      currencyRisk: ChartUtils.generateBarChart(
        ['美元', '欧元', '日元', '人民币', '其他'],
        [
          {
            name: '外汇敞口',
            data: [
              allocation.us || 0,
              allocation.europe || 0,
              allocation.japan || 0,
              0,
              allocation.others || 0
            ],
            color: this.colors[0]
          }
        ],
        '汇率风险敞口'
      )
    }
  }

  /**
   * 生成通胀保值主题图表
   */
  generateInflationCharts(data: any) {
    return {
      realReturn: ChartUtils.generateLineChart(
        data.dates || [],
        [
          {
            name: '名义收益率',
            data: data.nominalReturns || [],
            color: this.colors[0]
          },
          {
            name: '实际收益率',
            data: data.realReturns || [],
            color: this.colors[1]
          },
          {
            name: '通胀率',
            data: data.inflationRates || [],
            color: this.colors[2]
          }
        ],
        '收益 vs 通胀'
      ),
      purchasingPower: ChartUtils.generateLineChart(
        data.years || [],
        [
          {
            name: '购买力',
            data: data.purchasingPower || [],
            color: this.colors[0]
          }
        ],
        '购买力变化'
      ),
      inflationProtection: ChartUtils.generateBarChart(
        ['股票型', '债券型', '商品型', 'REITs', '现金'],
        [
          {
            name: '通胀保护能力',
            data: data.protectionLevels || [85, 45, 95, 70, 20],
            color: this.colors[0]
          }
        ],
        '资产类别通胀保护能力'
      )
    }
  }
}

export default ChartUtils