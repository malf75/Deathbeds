<script lang="ts" setup>
  import { authServices } from '@/services/auth.services';
  import { websocketService } from '@/services/websocket.service';
  import Cookies from 'js-cookie';
  import iziToast from 'izitoast';

  const tries = ref(0);
  const notificacao = ref(null);
  const color = ref('');
  const user = reactive({
    id: null,
    nome: null,
  });
  const websocket = reactive({
    socket: null,
  })

  async function iniciaWebSocket (token: string) {
    const socket = await websocketService.conectaWebsocket(token);
    websocket.socket = socket;
    socket.onopen = () => {
      console.log('WebSocket conectado');
    };

    socket.onmessage = event => {
      const response = JSON.parse(event.data);
      if (response.tipo === 'notificacao') {
        notificacao.value = response.message;
      }
    }

    socket.onclose = () => {
      console.log('WebSocket desconectado');
    };
  }

  async function iniciaConexao (token) {
    const response = await authServices.verificaToken(token);
    if (response.id) {
      user.id = response.id;
      user.nome = response.nome;
      await iniciaWebSocket(token);
    }
  }

  async function reconexao () {
    try {
      if (tries.value < 4) {
        setTimeout(async () => {
          const token = Cookies.get('access_token');
          await iniciaConexao(token);
          tries.value += 1;
        }, 1000);
      }
    } catch {
      iziToast.error({
        title: 'Erro',
        message: 'Erro ao iniciar conexão com o servidor',
        timeout: 3000,
      });
    }
  }

  onMounted(async () => {
    const route = useRoute().path;
    const token = Cookies.get('access_token');
    let colorCookie = Cookies.get('color');
    if (!colorCookie) {
      Cookies.set('color', 'aliceblue');
      colorCookie = Cookies.get('color');
    }
    color.value = colorCookie;
    if (token && route != '/login') {
      try {
        await iniciaConexao(token);
      } catch {
        reconexao();
      }
    }
  });

</script>

<template>
  <v-main :style="`background-color: ${color};`">
    <router-view :notificacao="notificacao" style="margin: 0;" :usuario="user" :websocket="websocket" />
  </v-main>
</template>
<style>
::-webkit-scrollbar {
  background-color: transparent;
  width: 6px;

}
::-webkit-scrollbar-thumb {
  background-color: rgba(76, 175, 80, 0.5);
  border-radius: 40px;
}
</style>
