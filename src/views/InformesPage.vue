<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonToolbar,
  onIonViewWillEnter
} from '@ionic/vue'
import {
  getVisualizaciones,
  type DashboardAlertaProactivaResponse
} from '@/services/dashboardService'

const hoy = new Date()
const mesActual = hoy.getMonth() + 1
const anioActual = hoy.getFullYear()

const cargando = ref(false)
const alertasProactivas = ref<DashboardAlertaProactivaResponse[]>([])

const tiposInformeIA = new Set([
  'prediccion',
  'gasto-inusual',
  'patron-semanal',
  'patron-categoria',
  'patron-dia-semana'
])

const insightsIA = computed(() =>
  alertasProactivas.value.filter(a => tiposInformeIA.has((a.tipo ?? '').toLowerCase()))
)

const predicciones = computed(() =>
  insightsIA.value.filter(a => {
    const tipo = (a.tipo ?? '').toLowerCase()
    return tipo === 'prediccion' || tipo === 'gasto-inusual'
  })
)

const patrones = computed(() =>
  insightsIA.value.filter(a => {
    const tipo = (a.tipo ?? '').toLowerCase()
    return tipo !== 'prediccion' && tipo !== 'gasto-inusual'
  })
)

const etiquetaTipoInsight = (alerta: DashboardAlertaProactivaResponse) => {
  const tipo = (alerta.tipo ?? '').toLowerCase()
  switch (tipo) {
    case 'prediccion':
      return 'Prediccion'
    case 'gasto-inusual':
      return 'Ritmo'
    case 'patron-semanal':
      return 'Patron semanal'
    case 'patron-categoria':
      return 'Patron categoria'
    case 'patron-dia-semana':
      return 'Dia de semana'
    default:
      return 'Insight'
  }
}

const cargarInformes = async () => {
  cargando.value = true

  try {
    const response = await getVisualizaciones({
      mes: mesActual,
      anio: anioActual
    })

    alertasProactivas.value = response.alertasProactivas ?? []
  } catch {
    alertasProactivas.value = []
  } finally {
    cargando.value = false
  }
}

onIonViewWillEnter(async () => {
  await cargarInformes()
})
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="topbar">
          <div>
            <h1 class="topbar-title">Informes</h1>
            <p class="topbar-subtitle">Cómo parece avanzar tu mes actual</p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="informes-content">
      <div class="page-shell">
        <div v-if="cargando" class="estado-carga">
          <ion-spinner name="crescent" />
          <ion-text color="medium">Generando informes...</ion-text>
        </div>

        <template v-else>
          <section class="section-card">
            <div class="section-header">
              <p>Estimaciones basadas en tu ritmo y evolución reciente</p>
            </div>

            <div v-if="predicciones.length === 0" class="estado-vacio">
              No hay predicciones relevantes para este periodo.
            </div>

            <div v-else class="insights-list">
              <article
                v-for="(item, index) in predicciones"
                :key="`pred-${index}`"
                class="insight-card"
                :class="`insight-${item.severidad}`"
              >
                <div class="insight-chip">{{ etiquetaTipoInsight(item) }}</div>
                <h3>{{ item.titulo }}</h3>
                <p>{{ item.mensaje }}</p>
              </article>
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <p>Comportamientos repetidos que te pueden ayudar a anticiparte.</p>
            </div>

            <div v-if="patrones.length === 0" class="estado-vacio">
              No hemos detectado patrones claros en este periodo.
            </div>

            <div v-else class="insights-list">
              <article
                v-for="(item, index) in patrones"
                :key="`pat-${index}`"
                class="insight-card"
                :class="`insight-${item.severidad}`"
              >
                <div class="insight-chip">{{ etiquetaTipoInsight(item) }}</div>
                <h3>{{ item.titulo }}</h3>
                <p>{{ item.mensaje }}</p>
              </article>
            </div>
          </section>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.informes-content {
  --background: var(--finmind-color-page);
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

.estado-carga,
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 34px 20px;
  text-align: center;
  color: #667085;
}

.insights-list {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.insight-card {
  border-radius: 14px;
  padding: 12px;
  border-left: 4px solid #98a2b3;
}

.insight-card h3 {
  margin: 0;
  font-size: 1rem;
  color: #1d2939;
}

.insight-card p {
  margin: 6px 0 0;
  color: #475467;
  line-height: 1.45;
  font-size: 0.92rem;
}

.insight-chip {
  width: fit-content;
  margin-bottom: 8px;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #edf2f8;
  color: #3f5268;
}

.insight-alta {
  background: #fff4f2;
  border-left-color: #d92d20;
}

.insight-media {
  background: #fffaeb;
  border-left-color: #dc6803;
}

.insight-baja {
  background: #eff8ff;
  border-left-color: #175cd3;
}
</style>
