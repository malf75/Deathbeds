<script setup lang="ts">
    const props = defineProps<{
    usuario: object,
    websocket: object,
  }>();
</script>
<template>
  <v-row class="w-100 h-100">
    <v-col md="2" style="display: flex; align-items: center; flex-direction: column; padding-top: 10em;">
      <AppSidebar :usuario="props.usuario" />
    </v-col>
    <v-divider color="success" vertical />
    <v-col md="10">
      <AppHorarios />
    </v-col>
    <v-divider color="success" vertical />
  </v-row>
</template>
