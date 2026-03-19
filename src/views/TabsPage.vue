<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon :icon="homeOutline" />
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon :icon="swapHorizontalOutline" />
          <ion-label>Movimientos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
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
  settingsOutline
} from 'ionicons/icons'
</script>

<style scoped>
.custom-tab-bar {
  --background: #ffffff;
  --border: 1px solid rgba(35, 63, 107, 0.08);
}

ion-tab-button {
  --color: #8fa3bb;
  --color-selected: #233f6b;
}
</style>