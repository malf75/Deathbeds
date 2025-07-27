<script lang="ts" setup>
  import { authServices } from '@/services/auth.services';
  import Cookies from 'js-cookie';

  const user = reactive({
    id: null,
    nome: null,
  });

  onMounted(async () => {
    const token = Cookies.get('access_token');
    if (token) {
      const response = await authServices.verificaToken(token);
      user.id = response.id;
      user.nome = response.nome;
    }
  })

</script>

<template>
  <v-main class="d-flex justify-center align-center" style=" background-color: aliceblue;">
    <router-view style="margin: 0;" :usuario="user" />
  </v-main>
</template>
