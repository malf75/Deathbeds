<script setup lang="ts">
  import { authServices } from '@/services/auth.services';
  import Cookies from 'js-cookie';
  import iziToast from '@/plugins/iziToast';

  const qrcode = ref('');
  const loading = ref(false);
  const checkbox = ref(false);
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
    cpf: null,
    crm_crp: null,
    email: null,
    password: null,
    confirm_password: null,
    tipo_usuario: 1,
    foto: null,
    uf: null,
    tipo: null,
  });

  const tipo = ref([
    'CRM',
    'CRP',
  ])

  const uf = ref([
    { 'text': 'Acre', 'value': 'AC' },
    { 'text': 'Alagoas', 'value': 'AL' },
    { 'text': 'Amapá', 'value': 'AP' },
    { 'text': 'Amazonas', 'value': 'AM' },
    { 'text': 'Bahia', 'value': 'BA' },
    { 'text': 'Ceará', 'value': 'CE' },
    { 'text': 'Distrito Federal', 'value': 'DF' },
    { 'text': 'Espírito Santo', 'value': 'ES' },
    { 'text': 'Goiás', 'value': 'GO' },
    { 'text': 'Maranhão', 'value': 'MA' },
    { 'text': 'Mato Grosso', 'value': 'MT' },
    { 'text': 'Mato Grosso do Sul', 'value': 'MS' },
    { 'text': 'Minas Gerais', 'value': 'MG' },
    { 'text': 'Pará', 'value': 'PA' },
    { 'text': 'Paraíba', 'value': 'PB' },
    { 'text': 'Paraná', 'value': 'PR' },
    { 'text': 'Pernambuco', 'value': 'PE' },
    { 'text': 'Piauí', 'value': 'PI' },
    { 'text': 'Rio de Janeiro', 'value': 'RJ' },
    { 'text': 'Rio Grande do Norte', 'value': 'RN' },
    { 'text': 'Rio Grande do Sul', 'value': 'RS' },
    { 'text': 'Rondônia', 'value': 'RO' },
    { 'text': 'Roraima', 'value': 'RR' },
    { 'text': 'Santa Catarina', 'value': 'SC' },
    { 'text': 'São Paulo', 'value': 'SP' },
    { 'text': 'Sergipe', 'value': 'SE' },
    { 'text': 'Tocantins', 'value': 'TO' },
  ]);

  const validaCadastro = computed(() => {
    if (form.acao == 'comum') {
      return cadastro.nome && cadastro.cpf && cadastro.email && cadastro.password && cadastro.confirm_password && cadastro.password == cadastro.confirm_password && checkbox.value == true
    } else {
      return cadastro.nome && cadastro.cpf && cadastro.crm_crp && cadastro.email && cadastro.password && cadastro.confirm_password && cadastro.password == cadastro.confirm_password && checkbox.value == true
    }
  })

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
    } catch (e){
      loading.value = false
      iziToast.error({
        title: 'Erro',
        message: e.response.data.detail,
        timeout: 3000,
      });
    }
  }

  async function registro () {
    loading.value = true
    try {
      const formData = new FormData();
      formData.append('nome', cadastro.nome)
      formData.append('cpf', cadastro.cpf)
      formData.append('tipo', cadastro.tipo)
      formData.append('crm_crp', cadastro.crm_crp)
      formData.append('email', cadastro.email)
      formData.append('password', cadastro.password)
      formData.append('tipo_usuario', cadastro.tipo_usuario)
      if (cadastro.foto) {
        formData.append('foto', cadastro.foto)
      }
      formData.append('uf', cadastro.uf)
      await authServices.cadastro(formData);
      loading.value = false
      form.acao = 'login'
      iziToast.success({
        title: 'Sucesso',
        message: 'Usuário cadastrado com sucesso',
        timeout: 3000,
      });
    } catch (e) {
      loading.value = false
      iziToast.error({
        title: 'Erro',
        message: `Erro ao cadastrar usuário: ${e.response.data.detail}`,
        timeout: 3000,
      });
    }
  }

  async function entrar () {
    loading.value = true
    try {
      await authServices.verificaOtp(id.value, payloadOtp.otp);
      window.location.assign('/timeline');
    } catch (e) {
      loading.value = false;
      iziToast.error({
        title: 'Erro',
        message: `Erro ao logar usuário: ${e.response.data.detail}`,
        timeout: 3000,
      });
    }
  }

  onMounted(async () =>{
    const token = Cookies.get('access_token')
    const refreshToken = Cookies.get('refresh_token')
    if (token) {
      const verificaToken = await authServices.verificaToken(token);
      if (verificaToken.email) {
        window.location.assign('/timeline');
      }
    } else if (refreshToken) {
      const refresh = await authServices.refreshToken(refreshToken);
      if (refresh) {
        const verificaToken = await authServices.verificaToken(token);
        if (verificaToken.email) {
          window.location.assign('/timeline');
        }
      }
    }
    form.acao = 'login'
  })
</script>
<template>
  <v-row class="w-100 h-100 d-flex text-center justify-center flex-column align-center">
    <v-card class="d-flex flex-column align-center" style="border: 1px solid rgb(76, 175, 80); background-color: white; color: #444; padding: 2em; margin: 2em;">
      <v-img
        aspect-ratio="4/3"
        cover
        src="/aaaaa.png"
        :width="80"
      />
      <v-card-item v-if="form.acao == 'login'" class="d-flex justify-center">
        <v-row>
          <v-col md="12s">
            <v-text-field
              v-model="credenciais.username"
              label="Email"
              style="margin-top: 10px;"
              type="email"
              variant="outlined"
              @keyup.enter="login()"
            />
            <v-text-field
              v-model="credenciais.password"
              label="Senha"
              type="password"
              variant="outlined"
              @keyup.enter="login()"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn color="primary" :loading="loading" @click="login()">entrar</v-btn>
            <v-btn class="ml-2" color="success" @click="form.acao = 'tipo'">Cadastre-se</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <a href="" style="text-decoration: none; color: rgba(2, 2, 2, 0.3);">Esqueceu a senha?</a>
          </v-col>
        </v-row>
      </v-card-item>
      <v-card-item v-if="form.acao == 'tipo'">
        <v-col md="12">
          <v-row class="d-flex justify-center">
            <h5 style="color: rgb(76, 175, 80);">Que tipo de usuário você é?</h5>
          </v-row>
          <v-row style="padding: 1em;">
            <v-btn color="info" @click="form.acao = 'comum'; cadastro.tipo_usuario = 1">Usuário Comum</v-btn>
            <v-btn class="ml-2" color="info" @click="form.acao = 'profissional'; cadastro.tipo_usuario = 2">Profissional</v-btn>
          </v-row>
          <v-row class="d-flex justify-center" style="padding: 1em;">
            <v-btn class="ml-2" color="error" @click="form.acao = 'login'">Cancelar</v-btn>
          </v-row>
        </v-col>
      </v-card-item>
      <v-card-item v-if="form.acao == 'comum' || form.acao == 'profissional'" class="d-flex justify-center">
        <v-row v-if="form.acao == 'comum'">
          <v-col>
            <v-text-field
              v-model="cadastro.nome"
              label="Nome Completo"
              style="margin-top: 10px;"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-text-field
              v-model="cadastro.email"
              label="Email"
              type="email"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-autocomplete variant="outlined" v-model="cadastro.uf" :items="uf" item-title="text" item-value="value" label="Unidade Federativa" />
            <v-text-field
              v-model="cadastro.cpf"
              label="CPF"
              style="margin-top: 10px;"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-text-field
              v-model="cadastro.password"
              label="Senha"
              type="password"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-text-field
              v-model="cadastro.confirm_password"
              label="Confirme sua Senha"
              type="password"
              variant="outlined"
              @keyup.enter="registro()"
            />
          </v-col>
        </v-row>
        <v-row v-if="form.acao == 'profissional'">
          <v-col>
            <v-text-field
              v-model="cadastro.nome"
              label="Nome Completo"
              style="margin-top: 10px;"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-text-field
              v-model="cadastro.email"
              label="Email"
              type="email"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-autocomplete variant="outlined" v-model="cadastro.uf" :items="uf" item-title="text" item-value="value" label="Unidade Federativa" />
            <v-text-field
              v-model="cadastro.cpf"
              label="CPF"
              style="margin-top: 10px;"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-autocomplete variant="outlined" v-model="cadastro.tipo" :items="tipo" label="Conselho" />
            <v-text-field
              v-model="cadastro.crm_crp"
              label="CRM/CRP (Registro ex: 01234)"
              style="margin-top: 10px;"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-text-field
              v-model="cadastro.password"
              label="Senha"
              type="password"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <v-text-field
              v-model="cadastro.confirm_password"
              label="Confirme sua Senha"
              type="password"
              variant="outlined"
              @keyup.enter="registro()"
            />
            <p style="margin-bottom: 1em;">Envie uma foto de seu rosto para a verificação de profissional</p>
            <v-file-input v-model="cadastro.foto" label="foto" variant="outlined" />
          </v-col>
        </v-row>
        <v-row style="height: 100px; display: flex; align-items: center;">
          <v-checkbox v-model="checkbox" style="height: 60px; padding-left: 0.5em;" color="success" />
          <p style="margin-right: 0.5em;">Aceitar</p>
          <a href="https://google.com/" target="_blank">Termos e Condições</a>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              class="ml-2"
              color="success"
              :disabled="!validaCadastro"
              :loading="loading"
              @click="registro()"
            >
              Confirmar
            </v-btn>
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
            <v-otp-input v-model="payloadOtp.otp" @keyup.enter="entrar()" />
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
  </v-row>
</template>
