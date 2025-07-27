<script setup lang="ts">

  const props = defineProps<{
    usuario: Ref<object>,
  }>();

</script>
<template>
  <AppChamada :usuario="props.usuario" />
</template>
