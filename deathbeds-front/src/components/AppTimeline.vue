<script setup lang="ts">
  import { postagemServices } from '@/services/postagem.service';
  import iziToast from '@/plugins/iziToast'

  const postagens = ref([]);
  const quantidade = ref(0);
  const loading = ref(false);
  const tries = ref(0);

  const props = defineProps<{
    usuario: object,
  }>();

  const postagem = reactive({
    id: null,
    corpo: null,
  })

  const postagemValida = computed(() => {
    return postagem.corpo && postagem.corpo.length < 256
  })

  async function criaPostagem () {
    loading.value = true;
    try {
      await postagemServices.posta(postagem);
      iziToast.success({
        title: "Sucesso",
        message: "Postagem realizada com sucesso",
        timeout: 1000000,
      });
      loading.value = false;
    } catch {
      iziToast.error({
        title: "Erro",
        message: "Erro ao realizar postagem",
        timeout: 3000,
      });
      loading.value = false;
    }
    postagem.corpo = null;
    quantidade.value = 0;
    tries.value = 0;
    await load({ done: () => {} });
  }

  async function fetchPostagens () {
    postagens.value = await postagemServices.lista(quantidade.value);
  }

  async function load ({ done }) {
    setTimeout(async () => {
      tries.value += 1;
      quantidade.value += 10;
      await fetchPostagens();
      if (postagens.value.length === 0) {
        done('empty');
      } else if (tries.value === 3) {
        done('empty');
      } else {
        done('ok');
      }
    }, 1000)
  }

  watch(() => props.usuario.id, async id => {
    if (id) {
      postagem.id = id;
    }
  })

</script>
<template>
  <v-row>
    <v-col md="12" style="display: flex; flex-direction: column; align-items: center;">
      <v-img
        aspect-ratio="4/3"
        cover
        src="/aaaaa.png"
        :width="100"
      />
    </v-col>
  </v-row>
  <v-row style="display: flex; justify-content: center; margin: 0;">
    <v-col md="10" style="padding: 0;">
      <v-textarea
        v-model="postagem.corpo"
        bg-color="white"
        color="green"
        :counter="255"
        label="Faça sua postagem"
        no-resize
        rounded
        rows="3"
        variant="outlined"
      />
    </v-col>
  </v-row>
  <v-row style="display: flex; justify-content: center;">
    <v-col md="10" style="display: flex; justify-content: end;">
      <v-btn
        color="success"
        :disabled="!postagemValida"
        :loading="loading"
        rounded
        @click="criaPostagem()"
      >
        Postar
      </v-btn>
    </v-col>
  </v-row>
  <v-divider
    color="success"
    style="margin: 1em 0 0 0;"
  />
  <v-row>
    <v-col>
      <v-infinite-scroll color="success" :items="postagens" style="margin-top: -1em;" @load="load">
        <v-card
          v-for="post in postagens"
          :key="post"
          hover
          style="color: black;"
          variant="text"
        >
          <v-card-title style="display: flex; align-items: center;">
            <v-avatar image="/No_avatar.png" size="50" style="border: 1px solid greenyellow; cursor: pointer;" />
            <p style="margin-left: 0.5em; font-size: 16px;">{{ post.usuario }}</p>
            <v-icon
              v-if="post.tipo_usuario_id === 2"
              color="success"
              icon="mdi-pill"
              size="x-small"
              style="margin-left: 0.2em;"
            />
            <p style="margin-left: 0.2em;">•</p>
            <p style="margin-left: 0.5em; font-size: 14px; font-weight: 300;">{{ post.criado_em.replace(",", "") }}</p>
          </v-card-title>
          <v-card-text style="padding: 16px 20px 16px 20px;">
            {{ post.corpo }}
          </v-card-text>
          <v-divider color="success" />
        </v-card>
        <template #empty>
          <v-alert color="success" style="display: flex; justify-content: center;" type="warning" variant="text">Nenhuma Postagem Encontrada!</v-alert>
        </template>
      </v-infinite-scroll>
    </v-col>
  </v-row>
</template>
