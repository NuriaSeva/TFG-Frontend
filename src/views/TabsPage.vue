<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="inicio" href="/inicio">
          <ion-icon :icon="homeOutline" />
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="movimientos" href="/movimientos">
          <ion-icon :icon="swapHorizontalOutline" />
          <ion-label>Movimientos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="graficos" href="/visualizaciones">
          <ion-icon :icon="pieChartOutline" />
          <ion-label>Gráficos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="informes" href="/informes">
          <ion-icon :icon="analyticsOutline" />
          <ion-label>Informes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="ajustes" href="/ajustes">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Ajustes</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/vue'
import {
  homeOutline,
  swapHorizontalOutline,
  settingsOutline,
  pieChartOutline,
  analyticsOutline
} from 'ionicons/icons'
</script>
