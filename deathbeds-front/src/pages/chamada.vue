<script setup lang="ts">

  const props = defineProps<{
    usuario: Ref<object>,
    websocket: Ref<object>,
  }>();

</script>
<template>
  <AppChamada :usuario="props.usuario" />
</template>
