<script setup lang="ts">

  const props = defineProps<{
    usuario: object,
    websocket: object,
    idChat: number
  }>();

  const idChatLocal = ref(props.idChat);

  watch(() => props.idChat, (newVal) => {
    idChatLocal.value = newVal;
  });

</script>
<template>
  <v-row class="w-100 h-100">
    <v-col md="2" style="display: flex; align-items: center; flex-direction: column; padding-top: 10em;">
      <AppSidebar :usuario="props.usuario" />
    </v-col>
    <v-divider color="success" vertical />
    <v-col md="2">
      <AppAllChats :atendimento="true" :idChat="idChatLocal" style="display: flex; align-items: center;" :usuario="props.usuario"  @update:idChat="val => idChatLocal = val" />
    </v-col>
    <v-divider color="success" vertical />
    <v-col md="8" sm="4">
      <AppChat :atendimento="true" :idChat="idChatLocal" :usuario="props.usuario" :websocket="props.websocket" />
    </v-col>
  </v-row>
</template>
