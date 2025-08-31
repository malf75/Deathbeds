<script lang="ts" setup>
  import { authServices } from '@/services/auth.services';
  import { websocketService } from '@/services/websocket.service';
  import Cookies from 'js-cookie';
  import iziToast from 'izitoast';

  const tries = ref(0);
  const notificacao = ref(null);
  const color = ref('');
  const router = useRouter();
  const user = reactive({
    id: null,
    nome: null,
    tipo: null,
  });
  const websocket = reactive({
    socket: null,
  })
  const ligacao = ref(false);
  const destino = ref({})

  async function iniciaWebSocket (token: string) {
    const socket = await websocketService.conectaWebsocket(token);
    websocket.socket = socket;
  }

  watch(
    () => websocket.socket,
    socket => {
      if (socket) {
        socket.onmessage = event => {
          const response = JSON.parse(event.data);
          if (response.type === 'notificacao') {
            notificacao.value = response.message;
          }
          if (response.type === 'call_request') {
            ligacao.value = true;
            destino.value = { 'id': response['destino_id'], 'nome': response['destino']};
            setTimeout(() => {
              ligacao.value = false;
            }, 30000)
          }
        }
      }
    }
  );

  async function rejeitaLigacao () {
    websocket.socket.send(JSON.stringify({
      'type': 'call_request_rejected',
      'destinatario_id': destino.value['id'],
    }));
    ligacao.value = false;
  }

  async function aceitaLigacao () {
    websocket.socket.send(JSON.stringify({
      'type': 'call_request_accepted',
      'destinatario_id': destino.value['id'],
    }));
    ligacao.value = false;
    router.push('/chamada');
  }

  async function iniciaConexao (token) {
    const response = await authServices.verificaToken(token);
    if (response.id) {
      user.id = response.id;
      user.nome = response.nome;
      user.tipo = response.tipo;
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
    <v-dialog v-model="ligacao" persistent style="justify-self: center;">
      <v-card
        class="pa-6 text-center"
        elevation="10"
        rounded="xl"
        width="320"
      >
        <v-avatar size="100" class="mx-auto mb-4">
          <v-img src="https://randomuser.me/api/portraits/women/44.jpg" />
        </v-avatar>

        <h3 class="mb-2">{{ destino['nome'] }}</h3>
        <p class="text-grey">Chamando...</p>

        <div class="dots mb-6">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <v-row style="display: flex; justify-content: center;">
          <v-btn
            color="red"
            icon
            size="large"
            style="margin-right: 1em;"
            variant="tonal"
            @click="rejeitaLigacao"
          >
            <v-icon>mdi-phone-hangup</v-icon>
          </v-btn>
          <v-btn
            color="green"
            icon
            size="large"
            variant="tonal"
            @click="aceitaLigacao"
          >
            <v-icon>mdi-phone</v-icon>
          </v-btn>
        </v-row>
      </v-card>
    </v-dialog>
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
