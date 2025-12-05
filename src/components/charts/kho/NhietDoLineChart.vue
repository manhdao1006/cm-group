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

const createTempGradient = (ctx, chartArea) => {
  if (!chartArea) return 'rgba(220, 20, 20, 0.3)'
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, 'rgba(220, 20, 20, 0.9)')
  g.addColorStop(0.4, 'rgba(255, 80, 0, 0.6)')
  g.addColorStop(1, 'rgba(255, 140, 0, 0.2)')
  return g
}

const chartData = ref({
  datasets: [
    {
      label: t('khoLanh.chart.hover.nhietDo'),
      data: [],
      borderColor: 'rgb(220, 20, 20)',
      backgroundColor: (ctx) => createTempGradient(ctx.chart.ctx, ctx.chart.chartArea),
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
    title: { display: true, text: t('khoLanh.chart.title.lineNhietDo') },
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
        text: t('khoLanh.chart.label.nhietDo'),
        font: { weight: 'bold', size: 16 },
      },
      suggestedMin: 0,
      suggestedMax: 50,
    },
  },
})

watch(
  () => [
    t('khoLanh.chart.unit.nhietDo'),
    t('khoLanh.chart.title.lineNhietDo'),
    t('khoLanh.chart.label.time'),
  ],
  () => {
    chartData.value.datasets[0].label = t('khoLanh.chart.unit.nhietDo')

    chartOptions.value.plugins.title.text = t('khoLanh.chart.title.lineNhietDo')
    chartOptions.value.scales.x.title.text = t('khoLanh.chart.label.time')
    chartOptions.value.scales.yTemp.title.text = t('khoLanh.chart.unit.nhietDo')
  },
)

watch(
  () => props.khoList,
  () => {
    if (!props.khoList.length) return

    const list = props.khoList

    chartOptions.value.scales.x.time.unit = 'minute'
    chartOptions.value.scales.x.time.stepSize = 15
    chartOptions.value.scales.x.ticks.maxTicksLimit = 4
    chartOptions.value.scales.x.time.displayFormats = { minute: 'HH:mm' }
    chartOptions.value.scales.x.time.tooltipFormat = 'dd/MM/yyyy HH:mm'

    chartData.value.datasets[0].data = list.map((v) => ({
      x: parseDate(v.thoiGian),
      y: Number(String(v.nhietDo).replace(',', '.')),
      maKho: v.maKho,
    }))

    const temps = chartData.value.datasets[0].data.map((d) => d.y)

    chartOptions.value.scales.yTemp.suggestedMin = Math.min(...temps) - 1
    chartOptions.value.scales.yTemp.suggestedMax = Math.max(...temps) + 1
  },
  { immediate: true },
)

function parseDate(str) {
  if (!str) return new Date('')

  const [datePart, timePart] = str.split(' ')
  if (!datePart || !timePart) return new Date('')

  const [day, month, year] = datePart.split('/').map(Number)
  const [h, m, s] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, h, m, s)
}
</script>
