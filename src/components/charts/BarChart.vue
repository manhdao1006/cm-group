<template>
  <div>
    <BarChart v-if="chartData.datasets[0].data.length" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { ref, watch } from 'vue'
import { Bar as BarChart } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const props = defineProps({
  vehicleList: { type: Array, default: () => [] },
})

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Số lượng đón',
      data: [],
      backgroundColor: '#42A5F5',
    },
    {
      label: 'Số lượng trả',
      data: [],
      backgroundColor: '#66BB6A',
    },
  ],
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Biểu đồ số lượng đón và trả sinh viên theo xe' },
  },
  scales: {
    x: { title: { display: true, text: 'Xe' } },
    y: { title: { display: true, text: 'Số lượng' }, beginAtZero: true },
  },
}

watch(
  () => props.vehicleList,
  (list) => {
    if (!list.length) return

    chartData.value.labels = list.map((v) => v.tenXe || 'Chưa đặt tên')

    chartData.value.datasets[0].data = list.map((v) => parseInt(v.soLuongDon) || 0)
    chartData.value.datasets[1].data = list.map((v) => parseInt(v.soLuongTra) || 0)
  },
  { immediate: true },
)
</script>
