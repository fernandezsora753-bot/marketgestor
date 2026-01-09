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
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'center'
  },
  series: [
    {
      name: 'Métodos de Pago',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      data: props.datos.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: getColorForMethod(item.name)
        }
      }))
    }
  ]
}))

const getColorForMethod = (method) => {
  const colors = {
    'Efectivo': '#4CAF50',
    'Transferencia': '#2196F3',
    'Tarjeta': '#FF9800',
    'Nequi': '#9C27B0',
    'DaviPlata': '#3F51B5',
    'Cheque': '#795548',
    'Otro': '#607D8B'
  }
  return colors[method] || '#607D8B'
}
</script>