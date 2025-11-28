<template>
  <div style="width: 300px; height: 300px; margin: 0 auto">
    <PieChart
      v-if="chartData.datasets && chartData.datasets[0]?.data.length"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js'
import { ref, watch } from 'vue'
import { Pie as PieChart } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  vehicleList: { type: Array, default: () => [] },
})

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Số lượng xe',
      data: [],
      backgroundColor: ['green', 'red', '#FFCE56', '#4BC0C0', '#9966FF'],
      hoverOffset: 10,
    },
  ],
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'right' },
    title: { display: true, text: 'Biểu đồ trạng thái xe theo số lượng' },
  },
  radius: '100%',
  cutout: '40%',
}

watch(
  () => props.vehicleList,
  (list) => {
    if (!list || !list.length) {
      chartData.value.labels = []
      chartData.value.datasets[0].data = []
      return
    }

    const statusCount = list.reduce((acc, v) => {
      const status = v.trangThai === '1' ? 'Hoạt động' : 'Không hoạt động'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    chartData.value.labels = Object.keys(statusCount)
    chartData.value.datasets[0].data = Object.values(statusCount)
  },
  { immediate: true },
)
</script>
