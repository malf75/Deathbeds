<script setup lang="ts">

  const props = defineProps<{
    usuario: Ref<object>,
  }>();

</script>
<template>
  <v-row class="w-100 h-100">
    <v-col md="3" style="display: flex; align-items: center; flex-direction: column; padding-top: 10em;">
      <AppSidebar :usuario="props.usuario" />
    </v-col>
    <v-divider color="success" vertical />
    <v-col md="9">
      <AppChat :usuario="props.usuario" />
    </v-col>
  </v-row>
</template>
