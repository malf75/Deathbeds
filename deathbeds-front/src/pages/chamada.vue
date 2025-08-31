<script setup lang="ts">

  const props = defineProps<{
    usuario: object,
    websocket: object,
  }>();

</script>
<template>
  <AppChamada :usuario="props.usuario" :websocket="websocket" />
</template>
