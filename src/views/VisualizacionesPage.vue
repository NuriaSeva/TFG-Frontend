<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  toastController
} from '@ionic/vue'
import { refreshOutline } from 'ionicons/icons'
import type { ApexOptions } from 'apexcharts'
import {
  getVisualizaciones,
  getMapaCalorMesActual,
  type DashboardVisualizacionesResponse,
  type DashboardMapaCalorResponse
} from '@/services/dashboardService'

import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { HeatmapChart } from 'echarts/charts'
import {
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  HeatmapChart,
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent
])

const cargando = ref(false)
const datos = ref<DashboardVisualizacionesResponse | null>(null)
const mapaCalor = ref<DashboardMapaCalorResponse | null>(null)

const cargarDatos = async () => {
  cargando.value = true

  try {
    const [visualizaciones, heatmap] = await Promise.all([
      getVisualizaciones(),
      getMapaCalorMesActual()
    ])

    datos.value = visualizaciones
    mapaCalor.value = heatmap
  } catch (error: any) {
    const toast = await toastController.create({
      message: error?.message || 'No se pudieron cargar las visualizaciones.',
      duration: 2400,
      position: 'bottom',
      color: 'danger'
    })

    await toast.present()
  } finally {
    cargando.value = false
  }
}

onIonViewWillEnter(async () => {
  await cargarDatos()
})

const distribucion = computed(() => datos.value?.distribucionGastosPorCategoria ?? [])
const evolucion = computed(() => datos.value?.evolucionUltimosMeses ?? [])
const resumen = computed(() => datos.value?.resumenMesActual ?? null)

const totalIngresos = computed(() => resumen.value?.ingresosMes ?? 0)
const totalGastos = computed(() => resumen.value?.gastosMes ?? 0)

const formatoMoneda = (valor: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(valor)

const comparativaSeries = computed(() => [
  {
    name: 'Importe',
    data: [
      Number(totalIngresos.value ?? 0),
      Number(totalGastos.value ?? 0)
    ]
  }
])

const comparativaOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  colors: ['#f1b80f', '#233f6b'],
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: '42%',
      distributed: true
    }
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  xaxis: {
    categories: ['Ingresos', 'Gastos'],
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 600,
        colors: ['#233f6b', '#233f6b']
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      formatter: (value: number) => formatoMoneda(value)
    }
  },
  grid: {
    strokeDashArray: 4
  },
  tooltip: {
    y: {
      formatter: (value: number) => formatoMoneda(value)
    }
  }
}))

const distribucionTop = computed(() => {
  const items = [...distribucion.value]

  if (items.length <= 5) return items

  const top = items.slice(0, 5)
  const resto = items.slice(5)

  const importeResto = resto.reduce((acc, item) => acc + Number(item.importe ?? 0), 0)
  const porcentajeResto = resto.reduce((acc, item) => acc + Number(item.porcentaje ?? 0), 0)

  return [
    ...top,
    {
      categoria: 'Otros',
      importe: importeResto,
      porcentaje: porcentajeResto
    }
  ]
})

const categoriasDonutSeries = computed(() =>
  distribucionTop.value.map(x => Number(x.importe ?? 0))
)

const categoriasDonutOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  labels: distribucionTop.value.map(x => x.categoria),
  colors: ['#233f6b', '#f1b80f', '#5b8def', '#12b76a', '#f97066', '#9e77ed'],
  legend: {
    position: 'bottom',
    fontSize: '13px',
    itemMargin: {
      horizontal: 10,
      vertical: 6
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${value.toFixed(1)}%`
  },
  stroke: {
    width: 0
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%'
      }
    }
  },
  tooltip: {
    y: {
      formatter: (value: number) => formatoMoneda(value)
    }
  }
}))

const evolucionSeries = computed(() => [
  {
    name: 'Ingresos',
    data: evolucion.value.map(x => Number(x.ingresos ?? 0))
  },
  {
    name: 'Gastos',
    data: evolucion.value.map(x => Number(x.gastos ?? 0))
  }
])

const evolucionOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#f1b80f', '#233f6b'],
  markers: {
    size: 4
  },
  xaxis: {
    categories: evolucion.value.map(x => x.etiqueta)
  },
  yaxis: {
    labels: {
      formatter: (value: number) => formatoMoneda(value)
    }
  },
  grid: {
    strokeDashArray: 4
  },
  legend: {
    position: 'top'
  },
  tooltip: {
    y: {
      formatter: (value: number) => formatoMoneda(value)
    }
  }
}))

const datosMapaCalor = computed(() => {
  if (!mapaCalor.value) return []

  const { anio, mes, dias } = mapaCalor.value
  const diasMes = new Date(anio, mes, 0).getDate()

  const mapa = new Map(dias.map(d => [d.fecha, d]))

  return Array.from({ length: diasMes }, (_, index) => {
    const dia = index + 1
    const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const dato = mapa.get(fecha)

    return [fecha, Number(dato?.totalGasto ?? 0), Number(dato?.numeroMovimientos ?? 0)]
  })
})

const heatmapOptions = computed(() => {
  if (!mapaCalor.value) return {}

  const rango = `${mapaCalor.value.anio}-${String(mapaCalor.value.mes).padStart(2, '0')}`

  return {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const [fecha, gasto, movimientos] = params.value
        const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long'
        })

        return `
          <div style="min-width:140px">
            <strong>${fechaFormateada}</strong><br/>
            Gasto: ${formatoMoneda(Number(gasto))}<br/>
            Movimientos: ${movimientos}
          </div>
        `
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(Number(mapaCalor.value.maximoGastoDia ?? 0), 1),
      dimension: 1,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#f8fafc', '#cfdced', '#8ca8cb', '#4e6f9d', '#1f3f73']
      }
    },
    calendar: {
      top: 40,
      left: 20,
      right: 20,
      cellSize: ['auto', 42],
      range: rango,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e5e7eb',
          width: 1
        }
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#ffffff'
      },
      dayLabel: {
        firstDay: 1,
        nameMap: 'es'
      },
      monthLabel: {
        show: false
      },
      yearLabel: {
        show: false
      }
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: datosMapaCalor.value,
        label: {
          show: true,
          formatter: (params: any) => {
            const fecha = new Date(params.value[0])
            return String(fecha.getDate())
          },
          color: '#344054',
          fontSize: 11
        }
      }
    ]
  }
})
</script>
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Visualizaciones</h1>
            <p class="topbar-subtitle">Gráficos y comparativas de tus finanzas</p>
          </div>

          <ion-button fill="clear" class="refresh-button" @click="cargarDatos">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="visualizaciones-content">
      <div class="page-shell">
        <div v-if="cargando" class="estado-carga">
          <ion-spinner name="crescent" />
          <ion-text color="medium">Cargando visualizaciones...</ion-text>
        </div>

        <template v-else-if="datos">
          <section class="section-card">
            <div class="section-header">
              <h2>Comparativa ingresos vs gastos</h2>
              <p>Vista general del mes actual.</p>
            </div>

            <div class="chart-wrapper">
              <apexchart
                type="bar"
                height="320"
                :options="comparativaOptions"
                :series="comparativaSeries"
              />
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <h2>Distribución de gastos por categoría</h2>
              <p>Cómo se reparte el gasto del mes actual.</p>
            </div>

            <div v-if="distribucion.length === 0" class="estado-vacio">
              No hay gastos categorizados este mes.
            </div>

            <div v-else class="chart-wrapper">
              <apexchart
                type="donut"
                height="340"
                :options="categoriasDonutOptions"
                :series="categoriasDonutSeries"
              />
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <h2>Evolución mensual</h2>
              <p>Últimos 6 meses de ingresos y gastos.</p>
            </div>

            <div v-if="evolucion.length === 0" class="estado-vacio">
              No hay datos suficientes para mostrar la evolución.
            </div>

            <div v-else class="chart-wrapper">
              <apexchart
                type="line"
                height="340"
                :options="evolucionOptions"
                :series="evolucionSeries"
              />
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <h2>Días con más gasto</h2>
              <p>Mapa de calor del gasto diario del mes actual.</p>
            </div>

            <div v-if="!mapaCalor" class="estado-vacio">
              No hay datos para mostrar el mapa de calor.
            </div>

            <div v-else class="heatmap-wrapper">
              <VChart class="heatmap-chart" :option="heatmapOptions" autoresize />
            </div>
          </section>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>
<style scoped>
.visualizaciones-content {
  --background: #f2f0ef;
}

.custom-toolbar {
  --background: #233f6b;
  --min-height: 104px;
  display: flex;
  align-items: flex-end;
}

.topbar {
  width: 100%;
  padding: 20px 18px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.7rem;
  font-weight: 700;
}

.topbar-subtitle {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.92rem;
}

.refresh-button {
  --color: #ffffff;
}

.page-shell {
  padding: 16px;
}

.section-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 10px 24px rgba(35, 63, 107, 0.08);
}

.section-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #233f6b;
}

.section-header p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 0.93rem;
}

.chart-wrapper {
  margin-top: 16px;
}

.estado-carga,
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  text-align: center;
  color: #667085;
}

.visualizaciones-content {
  --background: #f2f0ef;
}

.custom-toolbar {
  --background: #233f6b;
  --min-height: 104px;
  display: flex;
  align-items: flex-end;
}

.topbar {
  width: 100%;
  padding: 20px 18px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.7rem;
  font-weight: 700;
}

.topbar-subtitle {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.92rem;
}

.refresh-button {
  --color: #ffffff;
}

.page-shell {
  padding: 16px;
}

.section-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 10px 24px rgba(35, 63, 107, 0.08);
}

.section-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #233f6b;
}

.section-header p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 0.93rem;
}

.chart-wrapper {
  margin-top: 16px;
}

.heatmap-wrapper {
  margin-top: 18px;
}

.heatmap-chart {
  width: 100%;
  height: 420px;
}

.estado-carga,
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  text-align: center;
  color: #667085;
}
</style>