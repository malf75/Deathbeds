<script setup lang="ts">
  import { authServices } from '@/services/auth.services';
  import { useWindowSize } from '@vueuse/core';
  import Cookies from 'js-cookie';

  const router = useRouter()
  const { width } = useWindowSize()
  const qrcode = ref('');
  const loading = ref(false);
  const id = ref(0);
  const payloadOtp = reactive({
    otp: null,
  });
  const form = reactive({
    acao: 'login',
  });
  const credenciais = reactive({
    username: null,
    password: null,
  });
  const cadastro = reactive({
    nome: null,
    email: null,
    password: null,
  });

  async function login () {
    loading.value = true;
    try {
      const data = await authServices.login(credenciais);
      id.value = data['id']
      loading.value = false
      if (data['key']){
        const response = await authServices.primeiroLogin(id.value, data['key']);
        qrcode.value = response['qrcode'];
        form.acao = 'qrcode';
      } else {
        form.acao = 'otp';
      }
    } catch (e) {
      loading.value = false
      console.log(e)
    }
  }

  async function registro () {
    loading.value = true
    try {
      await authServices.cadastro(cadastro);
      loading.value = false
      form.acao = 'login'
    } catch (e) {
      loading.value = false
      console.log(e)
    }
  }

  async function entrar () {
    loading.value = true
    try {
      await authServices.verificaOtp(id.value, payloadOtp.otp);
      router.push('/timeline')
    } catch (e) {
      console.log(e);
    }
  }

  onMounted(async () =>{
    const verificaToken = await authServices.verificaToken(Cookies.get('access_token'));
    if (verificaToken.email) {
      console.log(verificaToken)
      router.push('/timeline');
    }
    form.acao = 'login'
  })
</script>
<template>
  <v-card v-if="width > 880" class="h-50 d-flex text-center justify-center flex-column" style="border: 1px solid rgb(76, 175, 80); background-color: white; color: #444; width: 600px;">
    <v-card-title>
      Deathbeds
    </v-card-title>
    <v-list-item>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iure mollitia in quisquam sunt aperiam reiciendis rem hic repudiandae assumenda consequuntur, voluptatibus delectus blanditiis quaerat officia nemo inventore doloribus. Voluptatem, debitis.
    </v-list-item>
  </v-card>
  <v-card class="h-50 d-flex text-center justify-center flex-column" style="border: 1px solid rgb(76, 175, 80); background-color: white; color: #444;">
    <v-card-title>
      LOGO
    </v-card-title>
    <v-card-item v-if="form.acao == 'login'" class="d-flex justify-center">
      <v-row>
        <v-col md="12s">
          <v-text-field
            v-model="credenciais.username"
            label="Email"
            style="margin-top: 10px;"
            type="email"
            variant="outlined"
          />
          <v-text-field v-model="credenciais.password" label="Senha" type="password" variant="outlined" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn color="primary" :loading="loading" @click="login()">entrar</v-btn>
          <v-btn class="ml-2" color="success" @click="form.acao = 'cadastro'">Cadastre-se</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <a href="" style="text-decoration: none; color: rgba(2, 2, 2, 0.3);">Esqueceu a senha?</a>
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-item v-if="form.acao == 'cadastro'" class="d-flex justify-center">
      <v-row>
        <v-col>
          <v-text-field
            v-model="cadastro.nome"
            label="Nome"
            style="margin-top: 10px;"
            variant="outlined"
          />
          <v-text-field
            v-model="cadastro.email"
            label="Email"
            type="email"
            variant="outlined"
          />
          <v-text-field v-model="cadastro.password" label="Senha" type="password" variant="outlined" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn class="ml-2" color="success" :loading="loading" @click="registro()">Confirmar</v-btn>
          <v-btn class="ml-2" color="error" @click="form.acao = 'login'">Cancelar</v-btn>
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-item v-if="form.acao == 'qrcode'" class="d-flex justify-center">
      <v-row>
        <v-col>
          <v-img :src="`data:image/png;base64,${qrcode}`" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn class="ml-2" color="success" :loading="loading" @click="form.acao = 'otp'">Continuar</v-btn>
          <v-btn class="ml-2" color="error" @click="form.acao = 'login'">Cancelar</v-btn>
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-item v-if="form.acao == 'otp'" class="d-flex justify-center">
      <v-row>
        <v-col>
          <v-otp-input v-model="payloadOtp.otp" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn class="ml-2" color="success" :loading="loading" @click="entrar()">Continuar</v-btn>
          <v-btn class="ml-2" color="error" @click="form.acao = 'login'">Cancelar</v-btn>
        </v-col>
      </v-row>
    </v-card-item>
  </v-card>
</template>
