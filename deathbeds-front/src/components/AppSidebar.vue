<script setup lang="ts">

  const userRole = 'Profissional';
  const router = useRouter();

  const props = defineProps<{
    usuario: Ref<object>,
  }>();

</script>
<template>
  <v-row>
    <v-col>
      <v-row style="display: flex; justify-content: center; flex-direction: column; align-items: center; margin-bottom: 1em;">
        <v-avatar image="/No_avatar.png" size="80" style="border: 1px solid greenyellow; cursor: pointer; margin-bottom: 1em;" />
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            color="success"
            prepend-icon="mdi-home"
            rounded
            size="x-large"
            style="display: flex;
            justify-content: start;
            padding: 0 0 0 1em;"
            variant="plain"
            @click="router.push('/timeline')"
          >
            Página Inicial
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-bell"
            rounded
            size="x-large"
            style="display: flex;
            justify-content: start;
            padding: 0 0 0 1em;"
            variant="plain"
          >
            Notificações
          </v-btn>
          <v-btn
            v-if="userRole === 'Profissional'"
            color="success"
            prepend-icon="mdi-clipboard"
            rounded
            size="x-large"
            style="display: flex;
            justify-content: start;
            padding: 0 0 0 1em;"
            variant="plain"
          >
            Atendimentos
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-email"
            rounded
            size="x-large"
            style="display: flex;
            justify-content: start;
            padding: 0 0 0 1em;"
            variant="plain"
            @click="router.push('/chat')"
          >
            Mensagens
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-cog"
            rounded
            size="x-large"
            style="display: flex;
            justify-content: start;
            padding: 0 0 0 1em;"
            variant="plain"
          >
            Configurações
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
