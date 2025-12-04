<template>
  <div style="height: 350px; margin: 0 auto">
    <LineChart
      :key="$i18n.locale + (currentDate ? currentDate : '')"
      v-if="chartData.datasets[0].data.length"
      :data="chartData"
      :options="chartOptions"
    />
    <button
      v-if="currentDate"
      class="btn btn-sm btn-secondary"
      @click="currentDate = null"
      style="margin-top: -700px"
    >
      {{ $t('data.button.viewByDay') }}
    </button>
  </div>
</template>

<script setup>
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { ref, watch } from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Filler,
)

const props = defineProps({
  khoList: { type: Array, default: () => [] },
})
const { t } = useI18n()
const currentDate = ref(null)

const createHumidityGradient = (ctx, chartArea) => {
  if (!chartArea) return 'rgba(20, 80, 220, 0.3)'
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, 'rgba(20, 80, 220, 0.9)')
  g.addColorStop(0.4, 'rgba(60, 140, 255, 0.6)')
  g.addColorStop(1, 'rgba(100, 180, 255, 0.2)')
  return g
}

const chartData = ref({
  datasets: [
    {
      label: t('khoLanh.chart.hover.doAm'),
      data: [],
      borderColor: 'rgb(20, 80, 220)',
      backgroundColor: (ctx) => createHumidityGradient(ctx.chart.ctx, ctx.chart.chartArea),
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      yAxisID: 'yTemp',
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  onClick(_, elements) {
    if (!elements.length) return
    const index = elements[0].index
    currentDate.value = chartData.value.datasets[0].data[index].x
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (ctx) {
          const item = ctx.raw
          return item.maKho ? `Kho ${item.maKho}: ${item.y}°C` : `${item.y}°C`
        },
      },
    },
    legend: { position: 'top' },
    title: { display: true, text: t('khoLanh.chart.title.lineDoAm') },
  },
  scales: {
    x: {
      type: 'time',
      time: { unit: 'day', displayFormats: { day: 'dd/MM' } },
      title: {
        display: true,
        text: t('khoLanh.chart.label.time'),
        font: { weight: 'bold', size: 16 },
      },
      ticks: {
        font: {
          style: 'italic',
        },
      },
    },
    yTemp: {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: t('khoLanh.chart.label.doAm'),
        font: { weight: 'bold', size: 16 },
      },
      suggestedMin: 0,
      suggestedMax: 100,
    },
  },
})

watch(
  () => [
    t('khoLanh.chart.unit.doAm'),
    t('khoLanh.chart.title.lineDoAm'),
    t('khoLanh.chart.label.time'),
  ],
  () => {
    chartData.value.datasets[0].label = t('khoLanh.chart.unit.doAm')

    chartOptions.value.plugins.title.text = t('khoLanh.chart.title.lineDoAm')
    chartOptions.value.scales.x.title.text = t('khoLanh.chart.label.time')
    chartOptions.value.scales.yTemp.title.text = t('khoLanh.chart.unit.doAm')
  },
)

watch(
  () => [props.khoList, currentDate.value],
  () => {
    if (!props.khoList.length) return

    let list = props.khoList

    if (currentDate.value) {
      const d = new Date(currentDate.value)
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)

      list = list.filter((v) => {
        const dt = parseDate(v.thoiGian)
        return dt >= dayStart && dt < dayEnd
      })

      chartOptions.value.scales.x.time.unit = 'hour'
      chartOptions.value.scales.x.time.displayFormats = { hour: 'HH:mm' }
      chartOptions.value.scales.x.time.tooltipFormat = 'dd/MM/yyyy HH:mm'

      chartData.value.datasets[0].data = list.map((v) => ({
        x: parseDate(v.thoiGian),
        y: Number(v.doAm) || 0,
        maKho: v.maKho,
      }))

      const temps = chartData.value.datasets[0].data.map((d) => d.y)

      chartOptions.value.scales.yTemp.suggestedMin = Math.min(...temps) - 1
      chartOptions.value.scales.yTemp.suggestedMax = Math.max(...temps) + 1

      const dataX = chartData.value.datasets[0].data.map((d) => d.x.getTime())
      if (dataX.length) {
        const min = Math.min(...dataX)
        const max = Math.max(...dataX)
        const hour = 60 * 60 * 1000
        chartOptions.value.scales.x.min = new Date(min - hour)
        chartOptions.value.scales.x.max = new Date(max + hour)
      }

      return
    }

    const map = {}
    list.forEach((v) => {
      const dt = parseDate(v.thoiGian)
      const key = dt.toISOString().split('T')[0]

      if (!map[key]) map[key] = { temp: [], hum: [] }

      map[key].temp.push(Number(v.doAm) || 0)
    })

    const sortedKeys = Object.keys(map).sort()
    chartData.value.datasets[0].data = sortedKeys.map((key) => ({
      x: new Date(key),
      y: avg(map[key].temp),
    }))

    chartOptions.value.scales.x.time.unit = 'day'
    chartOptions.value.scales.x.time.displayFormats = { day: 'dd/MM' }
    chartOptions.value.scales.x.time.tooltipFormat = 'dd/MM/yyyy'

    chartOptions.value.scales.yTemp.suggestedMin = 0
    chartOptions.value.scales.yTemp.suggestedMax = 100

    const xs = chartData.value.datasets[0].data.map((d) => d.x.getTime())
    if (xs.length) {
      const min = Math.min(...xs)
      const max = Math.max(...xs)
      const padding = (max - min) * 0.05
      chartOptions.value.scales.x.min = new Date(min - padding)
      chartOptions.value.scales.x.max = new Date(max + padding)
    }
  },
  { immediate: true },
)

function parseDate(str) {
  const [day, month, yearTime] = str.split('/')
  const [year, time] = yearTime.split(' ')
  return new Date(`${year}-${month}-${day}T${time}`)
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
</script>
