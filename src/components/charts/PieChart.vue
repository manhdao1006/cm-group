<template>
  <div style="width: 300px; height: 280px; margin: 0 auto">
    <PieChart
      :key="$i18n.locale"
      v-if="chartData.datasets && chartData.datasets[0]?.data.length"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js'
import { computed, ref, watch } from 'vue'
import { Pie as PieChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  vehicleList: { type: Array, default: () => [] },
})
const { t, locale } = useI18n()

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: t('data.chart.hover.soLuongXe'),
      data: [],
      backgroundColor: ['#3782f5', 'red', '#FFCE56', '#4BC0C0', '#9966FF'],
      hoverOffset: 10,
    },
  ],
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' },
    title: { display: true, text: t('data.chart.title.pie') },
  },
  radius: '100%',
  cutout: '40%',
}))

watch(
  () => props.vehicleList,
  (list) => {
    if (!list || !list.length) {
      chartData.value.labels = []
      chartData.value.datasets[0].data = []
      return
    }

    const statusCount = list.reduce((acc, v) => {
      const status =
        v.trangThai === '1' ? t('data.chart.unit.active') : t('data.chart.unit.inActive')
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    chartData.value.labels = Object.keys(statusCount)
    chartData.value.datasets[0].data = Object.values(statusCount)
  },
  { immediate: true },
)

watch(
  () => t('data.chart.hover.soLuongXe'),
  (newVal) => {
    chartData.value.datasets[0].label = newVal
  },
)

watch(locale, () => {
  chartData.value.labels = []
  chartData.value.datasets[0].data = []
  if (props.vehicleList && props.vehicleList.length) {
    const statusCount = props.vehicleList.reduce((acc, v) => {
      const status =
        v.trangThai === '1' ? t('data.chart.unit.active') : t('data.chart.unit.inActive')
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    chartData.value.labels = Object.keys(statusCount)
    chartData.value.datasets[0].data = Object.values(statusCount)
  }
})
</script>
