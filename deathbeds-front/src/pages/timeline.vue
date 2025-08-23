<script setup lang="ts">

  const tipoNotificacao = ref("info");

  const props = defineProps<{
    usuario: Ref<object>,
    websocket: Ref<object>,
    notificacao: Ref<string>
  }>();

  const socket = ref(null);

  // PARA LEMBRAR DO FLUXO DO SOCKET
  // async function teste () {
  //   socket.value.socket.send(JSON.stringify({ type:'teste' }));
  //   iziToast.success({
  //     title: 'Sucesso',
  //     message: props.notificacao,
  //     timeout: 3000,
  //   })
  // }

  onMounted (async () => {
    socket.value = props.websocket;
  })

</script>
<template>
  <v-row class="w-100 h-100">
    <v-col md="3" style="display: flex; align-items: center; flex-direction: column; padding-top: 10em;">
      <AppSidebar :usuario="props.usuario" />
    </v-col>
    <v-divider color="success" vertical />
    <v-col md="6" style="padding: 3em 0 5em 0;">
      <AppTimeline :usuario="props.usuario" />
    </v-col>
    <v-divider color="success" vertical />
    <v-col style="padding: 1em 5em 5em 5em;">
      <AppSearch style="margin-top: 8em;" />
    </v-col>
  </v-row>
</template>
