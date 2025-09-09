<script setup lang="ts">
  import iziToast from '@/plugins/iziToast';
  import { chatServices } from '@/services/chat.service';

  const props = defineProps<{
    usuario: object,
    idChat: number,
    websocket: object
  }>();

  const router = useRouter();
  const chat = ref(null);
  const mensagens = ref([]);
  const quantidade = ref(8);
  const tries = ref(0);
  const carregando = ref(false);
  const nomesUsuarios = ref({});
  const container = ref<HTMLElement | null>(null);
  const inicializando = ref(false);
  const corpoMensagem = ref('');
  const ligando = ref(false);
  const path = useRoute().path
  const destinatarioId = ref(0);
  const destinatarioNome = ref('');


  async function fetchChatPadrao (id_usuario, id_chat, quantidadeMensagens) {
    const response = await chatServices.retornaChatPadrao(id_usuario, id_chat, quantidadeMensagens);
    chat.value = response.data;
    mensagens.value = response.data.mensagens;
    nomesUsuarios.value = {};
    nomesUsuarios.value[chat.value.criador_id] = chat.value.criador;
    chat.value.participantes.forEach((p: any) => {
      nomesUsuarios.value[p.id] = p.nome;
    });
  }

  async function fetchChatAtendimento (id_usuario, id_chat, quantidadeMensagens) {
    const response = await chatServices.retornaChatAtendimento(id_usuario, id_chat, quantidadeMensagens);
    chat.value = response.data;
    mensagens.value = response.data.mensagens;
    nomesUsuarios.value = {};
    nomesUsuarios.value[chat.value.criador_id] = chat.value.criador;
    chat.value.participantes.forEach((p: any) => {
      nomesUsuarios.value[p.id] = p.nome;
    });
  }

  async function enviaMensagem () {
    try {
      if (path === '/atendimento') {
        props.websocket.socket.send(JSON.stringify({
          'type':'mensagem',
          'tipo_chat':'atendimento',
          'id_chat': props.idChat,
          'corpo': corpoMensagem.value,
        }));
      } else {
        props.websocket.socket.send(JSON.stringify({
          'type':'mensagem',
          'tipo_chat':'padrao',
          'id_chat': props.idChat,
          'corpo': corpoMensagem.value,
        }));
      }
      corpoMensagem.value = '';
    } catch (e) {
      iziToast.error({
        title: 'Erro',
        message: 'Erro ao enviar mensagem',
        timeout: 3000,
      });
    }
  }

  async function enviaOferta (id: number, nome: string) {
    destinatarioId.value = id;
    destinatarioNome.value = nome;
    props.websocket.socket.send(JSON.stringify({
      'type': 'call_request',
      'destinatario_id': destinatarioId.value,
    }));
    ligando.value = true;
    setTimeout(() => {
      ligando.value = false
    }, 30000)
  }

  async function cancelaOferta () {
    props.websocket.socket.send(JSON.stringify({
      'type': 'call_request_cancelled',
      'destinatario_id': destinatarioId.value,
    }))
    ligando.value = false;
  }

  watch(mensagens, async () => {
    await nextTick();
    container.value = document.getElementById('chatCard') as HTMLElement;
    if (container.value && !inicializando.value) {
      container.value.scrollTop = container.value.scrollHeight;
      inicializando.value = true;
    }
  });

  watch(
    () => props.websocket.socket,
    (socket) => {
      if (socket) {
        socket.onmessage = event => {
          const response = JSON.parse(event.data)
          if (response.type === 'mensagem' && response.chat_id === props.idChat) {
            mensagens.value.push({
              'id': response.id,
              'corpo': response.corpo,
              'chat_id': response.chat_id,
              'usuario_id': response.usuario_id,
              'criado_em': response.criado_em,
            })
          }
          container.value = document.getElementById('chatCard') as HTMLElement;
          container.value.scrollTop = container.value.scrollHeight;
          if (response.type === 'call_request_rejected') {
            ligando.value = false;
          }
          if (response.type === 'call_request_accepted') {
            router.push({ name: '/chamada', state: { acceptedCall: response } });
          }
        }
      }
    },
    { immediate: true }
  )

  onUpdated(async () => {
    if (props.usuario.id && props.idChat) {
      if (useRoute().path === '/chat') {
        inicializando.value = false;
        await fetchChatPadrao(props.usuario.id, props.idChat, quantidade.value);
        (props.websocket)
      } else {
        (useRoute().path)
        inicializando.value = false;
        await fetchChatAtendimento(props.usuario.id, props.idChat, quantidade.value);
        (props.websocket)
      }
    }
  })

  async function loadMensagensPadrao({ done }) {
    if (carregando.value) return;
    carregando.value = true;
    setTimeout(async () => {
      tries.value += 1;
      quantidade.value += 5;
      const response = await chatServices.retornaChatPadrao(props.usuario.id, props.idChat, quantidade.value);
      if (response.data.mensagens.length === mensagens.value.length) {
        done('empty');
      } else {
        mensagens.value = response.data.mensagens;
        done('ok');
      }
      carregando.value = false;
    }, 1000);
  }

  async function loadMensagensAtendimento({ done }) {
    if (carregando.value) return;
    carregando.value = true;
    setTimeout(async () => {
      tries.value += 1;
      quantidade.value += 5;
      const response = await chatServices.retornaChatAtendimento(props.usuario.id, props.idChat, quantidade.value);
      if (response.data.mensagens.length === mensagens.value.length) {
        done('empty');
      } else {
        mensagens.value = response.data.mensagens;
        done('ok');
      }
      carregando.value = false;
    }, 1000);
  }

</script>
<template>
  <v-row>
    <v-col style="padding: 1em 2em 0em 2em; display: flex; align-items: center; flex-direction: column;">
      <v-row style="max-height: 100px;">
        <v-col style="display: flex; flex-direction: column; align-items: center;">
          <v-img
            aspect-ratio="4/3"
            cover
            src="/aaaaa.png"
            :width="100"
          />
        </v-col>
      </v-row>
      <v-row v-if="props.idChat && useRoute().path === '/chat'" style="width: 800px;">
        <v-col>
          <v-card
            color="success"
            rounded="xl"
            style="text-align: center;"
            variant="outlined"
          >
            <v-card-title>{{ chat?.nome }}</v-card-title>
            <v-divider color="success" />
            <v-card
              id="chatCard"
              style="text-align: center; height: 700px; overflow-y: auto;"
              variant="text"
            >
              <v-infinite-scroll
                color="success"
                :items="mensagens"
                side="start"
                @load="loadMensagensPadrao"
              >
                <template #empty>
                  <v-alert color="success" style="display: flex; justify-content: center;" type="warning" variant="text">Nenhuma Mensagem Encontrada!</v-alert>
                </template>
                <v-card v-for="msg in mensagens" :key="msg.id" style="width: 100%; min-height: 100px;" variant="text">
                  <v-card v-if="msg.usuario_id === props.usuario.id" :style="{width: '100%', display: 'flex', justifyContent: 'end', marginBottom: '0.5em', padding: '0.5em'}" variant="text">
                    <v-card style="padding: 5px; margin: 0 0.5em 0 0.5em;" variant="tonal">
                      <v-row style="display: flex; align-items: center; margin: 0.5em;">
                        <v-card-item style="padding: 0; margin-right: 0.5em;">
                          {{ nomesUsuarios[msg.usuario_id] }}
                        </v-card-item>
                        <small style="font-size: 0.7em; color: grey;">
                          {{ msg.criado_em }}
                        </small>
                      </v-row>
                      <v-card-item style="padding: 0 0.5em 0 0.5em; margin-bottom: 0.5em; text-align: start;">
                        {{ msg.corpo }}
                      </v-card-item>
                    </v-card>
                    <v-avatar image="/No_avatar.png" size="50" style="border: 1px solid greenyellow; cursor: pointer;" />
                  </v-card>
                  <v-card v-else :style="{width: '100%', display: 'flex', justifyContent: 'start', marginBottom: '0.5em', padding: '0.5em'}" variant="text">
                    <v-avatar image="/No_avatar.png" size="50" style="border: 1px solid greenyellow; cursor: pointer;" />
                    <v-card style="padding: 5px; margin: 0 0.5em 0 0.5em;" variant="tonal">
                      <v-row style="display: flex; align-items: center; margin: 0.5em;">
                        <v-card-item style="padding: 0; margin-right: 0.5em;">
                          {{ nomesUsuarios[msg.usuario_id] }}
                        </v-card-item>
                        <small style="font-size: 0.7em; color: grey;">
                          {{ msg.criado_em }}
                        </small>
                      </v-row>
                      <v-card-item style="padding: 0 0 0 0.5em; margin-bottom: 0.5em; text-align: start;">
                        {{ msg.corpo }}
                      </v-card-item>
                    </v-card>
                  </v-card>
                </v-card>
              </v-infinite-scroll>
            </v-card>
            <v-row style="margin: 0 1em 0 1em;">
              <v-col>
                <v-form @submit.prevent>
                  <v-row>
                    <v-col>
                      <v-row>
                        <v-text-field
                          v-model="corpoMensagem"
                          bg-color="white"
                          clearable
                          color="success"
                          label="Escreva sua mensagem"
                          rounded="xl"
                          type="text"
                          variant="outlined"
                          @keyup.enter="enviaMensagem()"
                        />
                        <v-icon
                          color="success"
                          icon="mdi-send"
                          style="padding: 1em;"
                          @click="enviaMensagem()"
                        />
                      </v-row>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="props.idChat && useRoute().path === '/atendimento'" style="width: 800px;">
        <v-col>
          <v-card
            color="success"
            rounded="xl"
            style="text-align: center;"
            variant="outlined"
          >
            <v-row style="height: 70px; width: 100%; display: flex; align-items: center; justify-content: center;">
              <v-card-title style="justify-self: end;">{{ chat?.participantes[0].nome }}</v-card-title>
              <v-icon v-if="props.usuario.id === chat?.criador_id" icon="mdi-phone" @click="enviaOferta(chat.participantes[0].id, chat.participantes[0].nome)" />
              <v-card-title v-else>{{ chat?.criador }}</v-card-title>
            </v-row>
            <v-divider color="success" />
            <v-card
              id="chatCard"
              style="text-align: center; height: 700px; overflow-y: auto;"
              variant="text"
            >
              <v-infinite-scroll
                color="success"
                :items="mensagens"
                side="start"
                @load="loadMensagensAtendimento"
              >
                <template #empty>
                  <v-alert color="success" style="display: flex; justify-content: center;" type="warning" variant="text">Nenhuma Mensagem Encontrada!</v-alert>
                </template>
                <v-card v-for="msg in mensagens" :key="msg.id" style="width: 100%; min-height: 100px;" variant="text">
                  <v-card v-if="msg.usuario_id === props.usuario.id" :style="{width: '100%', display: 'flex', justifyContent: 'end', marginBottom: '0.5em', padding: '0.5em'}" variant="text">
                    <v-card style="padding: 5px; margin: 0 0.5em 0 0.5em;" variant="tonal">
                      <v-row style="display: flex; align-items: center; margin: 0.5em;">
                        <v-card-item style="padding: 0; margin-right: 0.5em;">
                          {{ nomesUsuarios[msg.usuario_id] }}
                        </v-card-item>
                        <small style="font-size: 0.7em; color: grey;">
                          {{ msg.criado_em }}
                        </small>
                      </v-row>
                      <v-card-item style="padding: 0 0.5em 0 0.5em; margin-bottom: 0.5em; text-align: start;">
                        {{ msg.corpo }}
                      </v-card-item>
                    </v-card>
                    <v-avatar image="/No_avatar.png" size="50" style="border: 1px solid greenyellow; cursor: pointer;" />
                  </v-card>
                  <v-card v-else :style="{width: '100%', display: 'flex', justifyContent: 'start', marginBottom: '0.5em', padding: '0.5em'}" variant="text">
                    <v-avatar image="/No_avatar.png" size="50" style="border: 1px solid greenyellow; cursor: pointer;" />
                    <v-card style="padding: 5px; margin: 0 0.5em 0 0.5em;" variant="tonal">
                      <v-row style="display: flex; align-items: center; margin: 0.5em;">
                        <v-card-item style="padding: 0; margin-right: 0.5em;">
                          {{ nomesUsuarios[msg.usuario_id] }}
                        </v-card-item>
                        <small style="font-size: 0.7em; color: grey;">
                          {{ msg.criado_em }}
                        </small>
                      </v-row>
                      <v-card-item style="padding: 0 0 0 0.5em; margin-bottom: 0.5em; text-align: start;">
                        {{ msg.corpo }}
                      </v-card-item>
                    </v-card>
                  </v-card>
                </v-card>
              </v-infinite-scroll>
            </v-card>
            <v-row style="margin: 0 1em 0 1em;">
              <v-col>
                <v-form @submit.prevent>
                  <v-row>
                    <v-col>
                      <v-row>
                        <v-text-field
                          v-model="corpoMensagem"
                          bg-color="white"
                          clearable
                          color="success"
                          label="Escreva sua mensagem"
                          rounded="xl"
                          type="text"
                          variant="outlined"
                          @keyup.enter="enviaMensagem()"
                        />
                        <v-icon
                          color="success"
                          icon="mdi-send"
                          style="padding: 1em;"
                          @click="enviaMensagem()"
                        />
                      </v-row>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <v-dialog v-model="ligando" persistent style="justify-self: center;">
    <v-card
      class="pa-6 text-center"
      elevation="10"
      rounded="xl"
      width="320"
    >
      <v-avatar size="100" class="mx-auto mb-4">
        <v-img src="https://randomuser.me/api/portraits/women/44.jpg" />
      </v-avatar>

      <h3 class="mb-2">{{ destinatarioNome }}</h3>
      <p class="text-grey">Chamando...</p>

      <div class="dots mb-6">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <v-btn
        color="red"
        icon
        size="large"
        style="align-self: center;"
        variant="tonal"
        @click="cancelaOferta"
      >
        <v-icon>mdi-phone-hangup</v-icon>
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.dots span {
  width: 8px;
  height: 8px;
  background: #555;
  border-radius: 50%;
  display: inline-block;
  animation: blink 1.4s infinite both;
}

.dots span:nth-child(1) {
  animation-delay: 0s;
}
.dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 80%, 100% {
    transform: scale(0.7);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
