<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="800">
      <v-card>
        <v-container>
          <v-layout row>
            <v-flex md6>
              <v-card-title class="headline" v-if="einsatzstelle.titel">{{einsatzstelle.titel}}</v-card-title>
              <v-card-subtitle v-if="einsatzstelle.beginn || einsatzstelle.ende">
                {{einsatzstelle.beginn}}
                <div
                  style="display:inline-block"
                  v-if="einsatzstelle.ende"
                >bis {{einsatzstelle.ende}}</div>
              </v-card-subtitle>

              <v-card-text
                v-if="einsatzstelle.taschengeld || einsatzstelle.anzahl || einsatzstelle.bewerbungsschluss"
              >
                <strong>Eckdaten:</strong>
                <ul>
                  <li v-if="einsatzstelle.anzahl">
                    Anzahl Plätze:
                    <strong>{{einsatzstelle.anzahl}}</strong>
                  </li>
                  <li v-if="einsatzstelle.taschengeld">
                    Taschengeld:
                    <strong>{{einsatzstelle.taschengeld}}</strong>
                  </li>
                  <li v-if="einsatzstelle.bewerbungsschluss">
                    Bewerbungsschluss:
                    <strong>{{einsatzstelle.bewerbungsschluss}}</strong>
                  </li>
                </ul>
              </v-card-text>

              <v-card-text v-if="einsatzstelle.teaser">
                <strong>Teaser:</strong>
                {{einsatzstelle.teaser}}
              </v-card-text>

              <v-card-text v-if="einsatzstelle.beschreibung">
                <strong>Beschreibung:</strong>
                {{einsatzstelle.beschreibung}}
              </v-card-text>
            </v-flex>
            <v-flex md6>
              <v-card-text
                v-if="einsatzstelle.name || einsatzstelle.adresse || einsatzstelle.webseite"
              >
                <strong>Einsatzstelle</strong>
                <v-list dense>
                  <v-list-item v-if="einsatzstelle.name">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">mdi-home</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>{{einsatzstelle.name}}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.adresse">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">mdi-map-marker</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>{{einsatzstelle.adresse}}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.webseite">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">mdi-web</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>
                        <a
                          v-bind:href="einsatzstelle.webseite"
                          target="_blank"
                        >{{einsatzstelle.webseite}}</a>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-text
                v-if="einsatzstelle.ansprechpartner || einsatzstelle.telefon || einsatzstelle.email"
              >
                <strong>Ansprechpartner</strong>
                <v-list dense>
                  <v-list-item v-if="einsatzstelle.ansprechpartner">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">mdi-account</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>{{einsatzstelle.ansprechpartner}}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.telefon">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">mdi-phone</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>
                        <a
                          v-bind:href="'tel:'+einsatzstelle.telefon"
                          target="_blank"
                        >{{einsatzstelle.telefon}}</a>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.email">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">mdi-email</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>
                        <a
                          v-bind:href="'mailto:'+einsatzstelle.email"
                          target="_blank"
                        >{{einsatzstelle.email}}</a>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-flex>
          </v-layout>
        </v-container>

        <v-card-actions class="justify-center">
          <v-btn small outlined color="#0068b4" @click="schliessen">Schließen!</v-btn>
          <v-btn small color="#0068b4" dark @click="klick">Mehr erfahren!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<style>
.headline {
  word-break: normal !important;
}
</style>

<script>
export default {
  props: { dialog: Boolean, einsatzstelle: Object },
  methods: {
    schliessen() {
      this.$emit("update:dialog", !this.dialog);
    },
    klick() {
      window.open(this.einsatzstelle.webseite);
      this.$emit("update:dialog", !this.dialog);
      //this.$emit("update:einsatzstelle", this.einsatzstelle={});
    }
  }
};
</script>
