<template>
  <div style="height: 350px; margin: 0 auto">
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
import { format } from 'date-fns'
import { ref, watch } from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

ChartJS.register(
  TimeScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
)

const props = defineProps({
  khoList: { type: Array, default: () => [] },
})
const { t } = useI18n()

function parseDate(str) {
  const [date, time] = str.split(' ')
  const [d, m, y] = date.split('/')
  const [h, min, s] = time.split(':')
  return new Date(+y, +m - 1, +d, +h, +min, +s)
}

const createPeopleGradient = (ctx, chartArea) => {
  if (!chartArea) return 'rgba(0, 120, 255, 0.3)'
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, 'rgba(0, 120, 255, 0.9)')
  g.addColorStop(0.4, 'rgba(0, 180, 255, 0.6)')
  g.addColorStop(1, 'rgba(0, 220, 255, 0.2)')
  return g
}

const chartData = ref({
  datasets: [
    {
      label: '',
      data: [],
      borderColor: 'rgb(0, 120, 255)',
      backgroundColor: (ctx) => createPeopleGradient(ctx.chart.ctx, ctx.chart.chartArea),
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 6,
      yAxisID: 'yPeople',
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        title: (items) => {
          const date = items[0].raw.x
          return format(date, 'HH:mm dd/MM')
        },
        label: () => {
          return ''
        },
      },
    },
    legend: { position: 'top' },
    title: { display: true, text: t('khoLanh.chart.title.linePeople') },
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
    },
    yPeople: {
      type: 'linear',
      suggestedMin: -0.2,
      suggestedMax: 1.2,
      ticks: {
        callback: (v) =>
          v === 1
            ? t('khoLanh.chart.unit.coNguoi')
            : v === 0
              ? t('khoLanh.chart.unit.khongNguoi')
              : '',
      },
      title: {
        display: true,
        text: t('khoLanh.chart.label.trangThai'),
        font: { weight: 'bold', size: 16 },
      },
    },
  },
})

watch(
  () => [
    t('khoLanh.chart.unit.coNguoi'),
    t('khoLanh.chart.title.linePeople'),
    t('khoLanh.chart.label.time'),
    t('khoLanh.chart.label.trangThai'),
  ],
  () => {
    chartData.value.datasets[0].label = t('khoLanh.chart.unit.coNguoi')

    chartOptions.value = {
      ...chartOptions.value,
      plugins: {
        ...chartOptions.value.plugins,
        title: {
          ...chartOptions.value.plugins.title,
          text: t('khoLanh.chart.title.linePeople'),
        },
      },
      scales: {
        ...chartOptions.value.scales,
        x: {
          ...chartOptions.value.scales.x,
          title: {
            ...chartOptions.value.scales.x.title,
            text: t('khoLanh.chart.label.time'),
          },
        },
        yPeople: {
          ...chartOptions.value.scales.yPeople,
          title: {
            ...chartOptions.value.scales.yPeople.title,
            text: t('khoLanh.chart.label.trangThai'),
          },
          ticks: {
            ...chartOptions.value.scales.yPeople.ticks,
            callback: (v) =>
              v === 1
                ? t('khoLanh.chart.unit.coNguoi')
                : v === 0
                  ? t('khoLanh.chart.unit.khongNguoi')
                  : '',
          },
        },
      },
    }
  },
)

watch(
  () => props.khoList,
  () => {
    if (!props.khoList.length) return

    const fullList = [...props.khoList].sort(
      (a, b) => parseDate(a.thoiGian) - parseDate(b.thoiGian),
    )

    chartOptions.value.scales.x.time.unit = 'minute'
    chartOptions.value.scales.x.time.displayFormats = {
      minute: 'HH:mm dd/MM',
    }

    chartData.value.datasets[0].data = fullList.map((v) => ({
      x: parseDate(v.thoiGian),
      y: v.coNguoi === '1' ? 1 : 0,
    }))
  },
  { immediate: true },
)
</script>
