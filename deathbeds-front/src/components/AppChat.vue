<script setup lang="ts">

  const props = defineProps<{
    usuario: Ref<object>,
  }>();

</script>
<template>
  <v-row>
    <v-col md="12" style="padding: 1em 2em 0em 2em; display: flex; align-items: center; flex-direction: column;">
      <v-row style="max-height: 100px;">
        <v-col md="12" style="display: flex; flex-direction: column; align-items: center;">
          <v-img
            aspect-ratio="4/3"
            cover
            src="/aaaaa.png"
            :width="100"
          />
        </v-col>
      </v-row>
      <v-row style="width: 800px;">
        <v-col>
          <v-card
            color="success"
            rounded="xl"
            style="text-align: center;"
            variant="outlined"
          >
            <v-card-title>teste</v-card-title>
            <v-divider color="success" />
            <v-infinite-scroll color="success" height="700">
              <v-card style="width: 50%;" variant="text">
                <v-card style="width: 80%; display: flex; justify-content: start; padding-left: 1em; align-items: center; margin-bottom: 0.5em;" variant="text">
                  <v-avatar image="/No_avatar.png" size="50" style="border: 1px solid greenyellow; cursor: pointer;" />
                  <v-card style="padding: 0.5em; margin-left: 0.5em;" variant="tonal">
                    <v-card-item style="padding: 0;">
                      {{ "teste" }}
                    </v-card-item>
                  </v-card>
                </v-card>
              </v-card>
            </v-infinite-scroll>
          </v-card>
        </v-col>
      </v-row>
      <v-row style="width: 750px;">
        <v-col md="12">
          <v-form>
            <v-row>
              <v-col md="12">
                <v-row>
                  <v-text-field
                    bg-color="white"
                    clearable
                    color="success"
                    label="Escreva sua mensagem"
                    rounded="xl"
                    type="text"
                    variant="outlined"
                  />
                  <v-icon
                    color="success"
                    icon="mdi-send"
                    style="padding: 1em;"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
