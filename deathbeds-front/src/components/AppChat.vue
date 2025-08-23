<script setup lang="ts">
  import iziToast from '@/plugins/iziToast';
  import { chatServices } from '@/services/chat.service';

  const props = defineProps<{
    usuario: object,
    idChat: number,
    websocket: object
  }>();

  const chat = ref(null);
  const mensagens = ref([]);
  const quantidade = ref(8);
  const tries = ref(0);
  const carregando = ref(false);
  const nomesUsuarios = ref({});
  const container = ref<HTMLElement | null>(null);
  const inicializando = ref(false);
  const corpoMensagem = ref('');


  async function fetchChat (id_usuario, id_chat, quantidadeMensagens) {
    const response = await chatServices.retornaChat(id_usuario, id_chat, quantidadeMensagens);
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
      props.websocket.socket.send(JSON.stringify({
        'type':'mensagem',
        'id_chat': props.idChat,
        'corpo': corpoMensagem.value,
      }));
      corpoMensagem.value = '';
    } catch (e) {
      iziToast.error({
        title: 'Erro',
        message: 'Erro ao enviar mensagem',
        timeout: 3000,
      });
    }
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
            console.log('Mensagem recebida do server:', response)
          }
        }
      }
    },
    { immediate: true }
  )

  onUpdated(async () => {
    if (props.usuario.id && props.idChat) {
      inicializando.value = false;
      await fetchChat(props.usuario.id, props.idChat, quantidade.value);
      console.log(props.websocket)
    }
  })

  async function loadMensagens({ done }) {
    if (carregando.value) return;
    carregando.value = true;
    setTimeout(async () => {
      tries.value += 1;
      quantidade.value += 5;
      const response = await chatServices.retornaChat(props.usuario.id, props.idChat, quantidade.value);
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
      <v-row v-if="props.idChat" style="width: 800px;">
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
                @load="loadMensagens"
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
                      <v-card-item style="padding: 0 0 0 0.5em; margin-bottom: 0.5em; text-align: start;">
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
                <v-form>
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
</template>
