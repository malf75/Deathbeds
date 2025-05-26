<script setup lang="ts">
  import Cookies from 'js-cookie';

  const router = useRouter();

  onMounted (() => {
    if(!Cookies.get('access_token') || Cookies.get('refresh_token')) {
      router.push('/')
    }
  })
</script>
<template>
  <p>teste</p>
</template>
