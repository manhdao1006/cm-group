<template>
  <div>
    <LineChart
      :key="$i18n.locale"
      v-if="chartData.datasets[0].data.length"
      :data="chartData"
      :options="chartOptions"
    />
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

const chartData = ref({
  datasets: [
    {
      label: t('data.chart.unit.temperature'),
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
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: t('data.chart.title.line') },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'hour',
        displayFormats: { hour: 'HH:mm' },
        tooltipFormat: 'dd/MM/yyyy HH:mm',
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
      suggestedMin: 20,
      suggestedMax: 40,
    },
  },
})

watch(
  () => [
    t('data.chart.unit.temperature'),
    t('data.chart.title.line'),
    t('data.chart.label.time'),
    t('data.chart.label.temperature'),
  ],
  () => {
    chartData.value.datasets[0].label = t('data.chart.unit.temperature')
    chartOptions.value.plugins.title.text = t('data.chart.title.line')
    chartOptions.value.scales.x.title.text = t('data.chart.label.time')
    chartOptions.value.scales.y.title.text = t('data.chart.label.temperature')
  },
)

watch(
  () => props.vehicleList,
  (list) => {
    if (!list.length) return

    const data = list.map((v) => ({
      x: parseDate(v.ngayNhap),
      y: parseFloat(v.nhietDo) || 0,
    }))

    chartData.value.datasets[0].data = data

    const times = data.map((d) => d.x.getTime())
    const minTime = Math.min(...times) - 30 * 60 * 1000
    const maxTime = Math.max(...times) + 30 * 60 * 1000
    chartOptions.value.scales.x.min = new Date(minTime)
    chartOptions.value.scales.x.max = new Date(maxTime)

    const temps = data.map((d) => d.y)
    chartOptions.value.scales.y.suggestedMin = Math.min(...temps) - 1
    chartOptions.value.scales.y.suggestedMax = Math.max(...temps) + 1
  },
  { immediate: true },
)

function parseDate(str) {
  const [day, month, yearAndTime] = str.split('/')
  const [year, time] = yearAndTime.split(' ')
  return new Date(`${year}-${month}-${day}T${time}`)
}
</script>
