<template>
  <div style="height: 280px; margin: 0 auto">
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
      style="margin-top: -550px"
    >
      {{ $t('data.button.viewByDay') }}
    </button>
  </div>
</template>

<script setup>
import {
  CategoryScale,
  Chart as ChartJS,
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
)

const props = defineProps({
  vehicleList: { type: Array, default: () => [] },
})
const { t } = useI18n()
const currentDate = ref(null)

const chartData = ref({
  datasets: [
    {
      label: t('data.chart.hover.soLuongXe'),
      data: [],
      borderColor: 'red',
      backgroundColor: 'orange',
      fill: true,
      tension: 0.4,
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  onClick(event, elements) {
    if (!elements.length) return
    const index = elements[0].index
    const clickedPoint = chartData.value.datasets[0].data[index]
    currentDate.value = clickedPoint.x
  },
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: t('data.chart.title.line') },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        displayFormats: { day: 'dd/MM' },
        tooltipFormat: 'dd/MM/yyyy',
      },
      title: {
        display: true,
        text: t('data.chart.label.time'),
        font: { weight: 'bold', size: 16 },
      },
    },
    y: {
      title: {
        display: true,
        text: t('data.chart.label.temperature'),
        font: { weight: 'bold', size: 16 },
      },
      suggestedMin: 0,
      suggestedMax: 10,
    },
  },
})

watch(
  () => [
    t('data.chart.unit.temperature'),
    t('data.chart.title.line'),
    t('data.chart.label.time'),
    t('data.chart.label.temperature'),
    t('data.chart.hover.soLuongXe'),
  ],
  () => {
    chartData.value.datasets[0].label = t('data.chart.unit.temperature')
    chartData.value.datasets[0].label = t('data.chart.hover.soLuongXe')
    chartOptions.value.plugins.title.text = t('data.chart.title.line')
    chartOptions.value.scales.x.title.text = t('data.chart.label.time')
    chartOptions.value.scales.y.title.text = t('data.chart.label.temperature')
  },
)

watch(
  () => [props.vehicleList, currentDate.value],
  () => {
    if (!props.vehicleList.length) return

    let list = props.vehicleList

    if (currentDate.value) {
      const d = new Date(currentDate.value)
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)

      list = list.filter((v) => {
        const dt = parseDate(v.ngayNhap)
        return dt >= dayStart && dt < dayEnd
      })

      chartData.value.datasets[0].label = t('data.chart.unit.temperature')
      chartOptions.value.scales.x.time.unit = 'hour'
      chartOptions.value.scales.x.time.displayFormats = { hour: 'HH:mm' }
      chartOptions.value.scales.x.time.tooltipFormat = 'dd/MM/yyyy HH:mm'

      chartData.value.datasets[0].data = list.map((v) => ({
        x: parseDate(v.ngayNhap),
        y: parseFloat(v.nhietDo) || 0,
      }))

      const temps = chartData.value.datasets[0].data.map((d) => d.y)
      chartOptions.value.scales.y.suggestedMin = Math.min(...temps) - 1
      chartOptions.value.scales.y.suggestedMax = Math.max(...temps) + 1
    } else {
      const map = {}
      list.forEach((v) => {
        const dt = parseDate(v.ngayNhap)
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
          2,
          '0',
        )}-${String(dt.getDate()).padStart(2, '0')}`
        map[key] = (map[key] || 0) + 1
      })

      const data = Object.keys(map)
        .sort()
        .map((key) => ({
          x: new Date(key),
          y: map[key],
        }))

      chartData.value.datasets[0].label = t('data.chart.hover.soLuongXe')
      chartOptions.value.scales.x.time.unit = 'day'
      chartOptions.value.scales.x.time.displayFormats = { day: 'dd/MM' }
      chartOptions.value.scales.x.time.tooltipFormat = 'dd/MM/yyyy'
      chartData.value.datasets[0].data = data

      const ys = data.map((d) => d.y)
      chartOptions.value.scales.y.suggestedMin = 0
      chartOptions.value.scales.y.suggestedMax = Math.max(...ys) + 1
    }

    const dataX = chartData.value.datasets[0].data.map((d) => d.x.getTime())
    if (dataX.length) {
      let minTime = Math.min(...dataX)
      let maxTime = Math.max(...dataX)

      const padding = (maxTime - minTime) * 0.05
      chartOptions.value.scales.x.min = new Date(minTime - padding)
      chartOptions.value.scales.x.max = new Date(maxTime + padding)

      if (currentDate.value) {
        const hour = 60 * 60 * 1000
        chartOptions.value.scales.x.min = new Date(minTime - hour)
        chartOptions.value.scales.x.max = new Date(maxTime + hour)
      }
    }
  },
  { immediate: true },
)

function parseDate(str) {
  const [day, month, yearAndTime] = str.split('/')
  const [year, time] = yearAndTime.split(' ')
  return new Date(`${year}-${month}-${day}T${time}`)
}
</script>
