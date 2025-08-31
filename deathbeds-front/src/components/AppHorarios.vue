<script setup lang="ts">
  const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const dialogAberto = ref(false);
  const novoDia = ref('');
  const horarioInicio = ref('');
  const horarioFim = ref('');

  function abrirDialog (dia: string) {
    novoDia.value = dia;
    dialogAberto.value = true;
  }

  function adicionarHorarios () {


    dialogAberto.value = false;
    horarioInicio.value = '';
    horarioFim.value = '';
  }

</script>
<template>
  <v-row style="display: flex; padding: 0.5em; height: 100%; align-content: center;">
    <v-card style="display: flex; width: 100%; height: 100%; flex-direction: column; border: 1px solid rgb(75, 165, 80); background-color: aliceblue;">
      <v-card-title style="color: rgb(75, 165, 80); align-self: center;">Agenda</v-card-title>
      <v-card style="display: flex; background-color: transparent; height: 100%;">
        <v-col
          v-for="dia in diasDaSemana"
          :key="dia"
          cols="12"
          md="2"
        >
          <v-card style="height: 100%; background-color: transparent; border: 1px solid rgb(75, 165, 80);">
            <v-card-title class="d-flex justify-space-between" style="color: rgb(75, 165, 80);">
              {{ dia }}
              <v-btn color="success" rounded="pill" @click="abrirDialog(dia)">
                +
              </v-btn>
            </v-card-title>
            <v-divider color="success" />

            <v-list style="background-color: transparent;">

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{  }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{  }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-card>
      <v-dialog v-model="dialogAberto" max-width="400">
        <v-card style="background-color: aliceblue; border: 1px solid rgb(75, 165, 80); border-radius: 20px;">
          <v-card-title style="color: rgb(75, 165, 80);">Adicionar horários - {{ novoDia }}</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="horarioInicio"
              label="Hora início"
              style="color: rgb(75, 165, 80);"
              type="time"
            ></v-text-field>
            <v-text-field
              v-model="horarioFim"
              label="Hora fim"
              style="color: rgb(75, 165, 80);"
              type="time"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="dialogAberto = false">Cancelar</v-btn>
            <v-btn color="success" variant="flat" @click="adicionarHorarios">Adicionar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-row>
</template>
