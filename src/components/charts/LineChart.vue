<template>
  <div>
    <LineChart v-if="chartData.datasets[0].data.length" :data="chartData" :options="chartOptions" />
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

const chartData = ref({
  datasets: [
    {
      label: 'Nhiệt độ',
      data: [],
      borderColor: 'red',
      backgroundColor: 'orange',
      fill: true,
      tension: 0.4,
    },
  ],
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Biểu đồ nhiệt độ theo thời gian' },
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
        text: 'Thời gian',
        font: {
          weight: 'bold',
          size: 16,
        },
      },
      min: new Date('2025-11-28T08:00:00'),
      max: new Date('2025-11-28T18:00:00'),
    },
    y: {
      title: {
        display: true,
        text: 'Nhiệt độ (°C)',
        font: {
          weight: 'bold',
          size: 16,
        },
      },
      suggestedMin: 20,
      suggestedMax: 40,
    },
  },
}

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
    chartOptions.scales.x.min = new Date(minTime)
    chartOptions.scales.x.max = new Date(maxTime)

    const temps = data.map((d) => d.y)
    chartOptions.scales.y.suggestedMin = Math.min(...temps) - 1
    chartOptions.scales.y.suggestedMax = Math.max(...temps) + 1
  },
  { immediate: true },
)

function parseDate(str) {
  const [day, month, yearAndTime] = str.split('/')
  const [year, time] = yearAndTime.split(' ')
  return new Date(`${year}-${month}-${day}T${time}`)
}
</script>
