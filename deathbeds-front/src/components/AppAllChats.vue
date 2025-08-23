<script setup lang="ts">
  import { seguidoresServices } from '@/services/seguidores.service';
  import iziToast from '@/plugins/iziToast';
  import { chatServices } from '@/services/chat.service';

  const dialog = ref(false);
  const quantidadeUsuarios = ref(0);
  const quantidadeChats = ref(0);
  const triesUsuario = ref(0);
  const triesChats = ref(0);
  const usuarios = ref([]);
  const chats = ref([]);
  const loading = ref(false)

  const props = defineProps<{
    usuario: { id: number, nome: string },
    idChat: number
  }>();

  defineEmits<{
    (e: 'update:idChat', value: number): void;
  }>();

  const novoChat = reactive({
    usuario_id: null,
    nome: null,
    destinatarios_id: [],
  });

  const validaCriaChat = computed(() => {
    return novoChat.destinatarios_id.length > 0 && novoChat.nome.length < 51
  })

  async function retornaChats () {
    try {
      chats.value = await chatServices.listaChat(props.usuario.id, quantidadeChats.value)
    } catch (e) {
      iziToast.error({
        title: 'Erro',
        message: e.response.data.detail,
        timeout: 3000,
      })
    }
  }

  async function criaChat () {
    try {
      loading.value = true;
      await chatServices.criaChat(novoChat);
      iziToast.success({
        title: 'Sucesso',
        message: 'Chat criado com sucesso',
        timeout: 3000,
      })
      novoChat.destinatarios_id = [];
      loading.value = false;
      dialog.value = false;
    } catch (e) {
      iziToast.error({
        title: 'Erro',
        message: e.response.data.detail,
        timeout: 3000,
      });
      loading.value = false;
    }
    quantidadeChats.value = 0;
    triesChats.value = 0;
    await loadChats({ done: () => {} });
  }

  async function retornaSeguindo () {
    const response = await seguidoresServices.listaSeguindo(props.usuario.id, quantidadeUsuarios.value)
    usuarios.value = response.data;
  }

  async function loadUsuarios ({ done }) {
    setTimeout(async () => {
      triesUsuario.value += 1;
      quantidadeUsuarios.value += 5;
      await retornaSeguindo();
      if (usuarios.value.length === 0) {
        done('empty');
      } else if (triesUsuario.value === 3) {
        done('empty');
      } else {
        done('ok');
      }
    }, 1000)
  }

  async function loadChats ({ done }) {
    setTimeout(async () => {
      triesChats.value += 1;
      quantidadeChats.value += 5;
      await retornaChats();
      if (chats.value.length === 0) {
        done('empty');
      } else if (triesChats.value === 3) {
        done('empty');
      } else {
        done('ok');
      }
    }, 1000)
  }

  watch(() => props.usuario.id, async id => {
    if (id) {
      novoChat.usuario_id = id;
    }
  })

</script>
<template>
  <v-row style="padding: 0.5em 0.2em 0.5em 0.5em; display: flex; align-items: center; justify-content: space-between;">
    <h2 style="color: rgb(76, 175, 80);">Mensagens</h2>
    <v-btn color="success" icon="mdi-message-plus" variant="text" @click="dialog = true" />
  </v-row>
  <v-row style="padding: 0.5em;">
    <v-text-field
      bg-color="white"
      color="success"
      label="Pesquisar"
      prepend-inner-icon="mdi-magnify"
      rounded
      variant="outlined"
    />
  </v-row>
  <v-divider
    color="success"
  />
  <v-row style="display: flex; justify-content: center;">
    <v-infinite-scroll color="success" style="display: flex; align-items: center; padding: 0.5em;" @load="loadChats">
      <v-card
        v-for="chat in chats.data"
        :key="chat.id"
        hover
        style="border: 1px solid rgb(76, 175, 80); border-radius: 20px; margin-bottom: 10px; width: 300px;"
        variant="text"
        @click="$emit('update:idChat', chat.id)"
      >
        <v-card-title style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: rgb(76, 175, 80);">{{ chat.nome }}</span>
        </v-card-title>

        <v-card-subtitle>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1em;">
            <v-chip
              color="success"
              small
              text-color="white"
            >
              {{ chat.criador }}
            </v-chip>
            <v-chip
              v-for="participante in chat.participantes.slice(0,2)"
              :key="participante.id"
              color="success"
              small
              text-color="white"
            >
              {{ participante.nome }}
            </v-chip>
            <span v-if="chat.participantes.length > 2" style="font-weight: bold; font-size: 14px; color: rgb(76, 175, 80); align-self: center;">
              +{{ chat.participantes.length - 2 }}
            </span>
          </div>
        </v-card-subtitle>
      </v-card>
      <template #empty>
        <v-alert color="success" style="display: flex; justify-content: center;" type="warning" variant="text">Nenhum Chat Encontrado!</v-alert>
      </template>
    </v-infinite-scroll>
  </v-row>
  <v-dialog v-model="dialog" style="max-width: 400px;">
    <v-card style="padding: 1em; border: 1px solid rgb(76, 175, 80); border-radius: 20px; background-color: aliceblue;" width="400px">
      <v-text-field
        v-model="novoChat.nome"
        bg-color="white"
        color="success"
        counter="50"
        label="Nome do Grupo"
        rounded
        variant="outlined"
      />
      <v-infinite-scroll color="success" @load="loadUsuarios">
        <v-card-item v-for="usuario in usuarios" :key="usuario.id">
          <v-checkbox
            v-model="novoChat.destinatarios_id"
            color="success"
            :label="usuario.nome"
            :value="usuario.id"
            style="color: black;"
          />
        </v-card-item>
        <template #empty>
          <v-alert color="success" style="display: flex; justify-content: center;" type="warning" variant="text">Nenhuma Amigo Encontrado!</v-alert>
        </template>
      </v-infinite-scroll>
      <v-row style="display: flex; justify-content: end; padding: 1em;">
        <v-btn color="error" style="margin-right: 1em;" width="100px" @click="dialog = false, novoChat.destinatarios_id = [], triesUsuario = 0, quantidadeUsuarios = 0">Cancelar</v-btn>
        <v-btn
          color="success"
          :disabled="!validaCriaChat"
          :loading="loading"
          width="100px"
          @click="criaChat"
        >
          Criar
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>
