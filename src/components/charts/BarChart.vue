<template>
  <div style="height: 500px; margin: 0 auto">
    <BarChart
      :key="$i18n.locale"
      v-if="chartData.datasets[0].data.length"
      :data="chartData"
      :options="chartOptions"
    />
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
import { computed, ref, watch } from 'vue'
import { Bar as BarChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement)
const { t } = useI18n()

const props = defineProps({
  vehicleList: { type: Array, default: () => [] },
})

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: t('data.chart.unit.soLuongDon'),
      data: [],
      backgroundColor: '#42A5F5',
    },
    {
      label: t('data.chart.unit.soLuongTra'),
      data: [],
      backgroundColor: '#66BB6A',
    },
  ],
})

const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: t('data.chart.title.bar') },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: t('data.chart.label.licenseNumber'),
        font: { weight: 'bold', size: 16 },
      },
    },
    y: {
      title: {
        display: true,
        text: t('data.chart.label.quantity'),
        font: { weight: 'bold', size: 16 },
      },
      beginAtZero: true,
    },
  },
}))

watch(
  () => props.vehicleList,
  (list) => {
    if (!list.length) return

    chartData.value.labels = list.map((v) => v.bienSoXe || 'Chưa đặt tên')

    chartData.value.datasets[0].data = list.map((v) => parseInt(v.soLuongDon) || 0)
    chartData.value.datasets[1].data = list.map((v) => parseInt(v.soLuongTra) || 0)
  },
  { immediate: true },
)

watch(
  () => t('data.chart.unit.soLuongDon'),
  (newVal) => {
    chartData.value.datasets[0].label = newVal
  },
)
watch(
  () => t('data.chart.unit.soLuongTra'),
  (newVal) => {
    chartData.value.datasets[1].label = newVal
  },
)
</script>
