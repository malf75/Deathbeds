<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import Cookies from 'js-cookie';

  const router = useRouter();

  onMounted (() => {
    if(!Cookies.get('access_token') || !Cookies.get('refresh_token')) {
      router.push('/')
    }
  })
</script>
