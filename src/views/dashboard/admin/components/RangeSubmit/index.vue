<template>
  <div
    style="padding: 0 25px 20px 20px"
    :class="className"
    :style="{ height: height, width: width }"
  />
</template>

<script>
import echarts from 'echarts'
import resize from '../mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    statisticsData: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    statisticsData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.statisticsData)
    },
    setOptions({ expectedData, actualData } = {}) {
      this.chart.setOption({
        title: {
          textStyle: {
            fontSize: 15
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: [this.$t('工单总数'), this.$t('未结束'), this.$t('已结束')]
        },
        grid: {
          left: '25',
          right: '35',
          bottom: '20',
          top: '50',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.statisticsData.datetime
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: this.$t('工单总数'),
            type: 'line',
            data: this.statisticsData.total
          },
          {
            name: this.$t('未结束'),
            type: 'line',
            data: this.statisticsData.processing
          },
          {
            name: this.$t('已结束'),
            type: 'line',
            data: this.statisticsData.overs
          }
        ]
      })
    }
  }
}
</script>
