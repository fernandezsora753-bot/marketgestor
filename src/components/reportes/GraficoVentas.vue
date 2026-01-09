<template>
  <GraficoBase :options="chartOptions" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import GraficoBase from './GraficoBase.vue'

const props = defineProps({
  datos: {
    type: Array,
    default: () => []
  },
  height: {
    type: String,
    default: '300px'
  }
})

const chartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: function(params) {
      const fecha = params[0].axisValue
      const valor = params[0].data
      return `${fecha}<br/>💰 <b>$${new Intl.NumberFormat('es-CO').format(valor)}</b>`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.datos.map(d => d.mes || d.fecha)
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '${value}'
    }
  },
  series: [
    {
      name: 'Ventas',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(25, 118, 210, 0.8)'
          }, {
            offset: 1, color: 'rgba(25, 118, 210, 0.1)'
          }]
        }
      },
      itemStyle: {
        color: '#1976D2'
      },
      data: props.datos.map(d => d.ventas || d.valor)
    }
  ]
}))
</script>