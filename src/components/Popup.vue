<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="800">
      <v-card>
        <v-container>
          <v-img
            v-if="bild"
            :aspect-ratio="4.00/1"
            :src="einsatzstelle.bild" />
          <v-row>
            <v-col cols="11">
              <div
                v-if="einsatzstelle.titel"
                class="headline">
                <strong>{{ einsatzstelle.titel }}</strong>
              </div>
              <div
                v-if="einsatzstelle.beginn || einsatzstelle.ende"
                class="body-1">
                {{ einsatzstelle.beginn }}
                <div
                  v-if="einsatzstelle.ende"
                  style="display:inline-block">
                  bis {{ einsatzstelle.ende }}
                </div>
              </div>
            </v-col>
            <v-col
              cols="1">
              <v-btn
                fab
                dark
                color="primary"
                small
                @click="schliessen">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-layout row>
            <v-flex md6>
              <v-card-text v-if="einsatzstelle.themen">
                <strong>Themen</strong>
                <br>
                {{ einsatzstelle.themen }}
              </v-card-text>

              <v-card-text
                v-if="einsatzstelle.taschengeld || einsatzstelle.anzahl || einsatzstelle.bewerbungsschluss">
                <strong>Eckdaten</strong>
                <ul>
                  <li v-if="einsatzstelle.anzahl">
                    Anzahl Plätze:
                    <strong>{{ einsatzstelle.anzahl }}</strong>
                  </li>
                  <li v-if="einsatzstelle.anforderungen">
                    Anforderungen:
                    <strong>{{ einsatzstelle.anforderungen }}</strong>
                  </li>
                  <li v-if="einsatzstelle.taschengeld">
                    Taschengeld:
                    <strong>{{ einsatzstelle.taschengeld }}</strong>
                  </li>
                  <li v-if="einsatzstelle.unterkunft">
                    Unterkunft:
                    <strong>{{ einsatzstelle.unterkunft }}</strong>
                  </li>
                  <li v-if="einsatzstelle.bewerbungsschluss">
                    Bewerbungsschluss:
                    <strong>{{ einsatzstelle.bewerbungsschluss }}</strong>
                  </li>
                </ul>
              </v-card-text>

              <v-card-text v-if="einsatzstelle.teaser">
                <strong>Kurzbeschreibung</strong>
                <br>
                {{ einsatzstelle.teaser }}
              </v-card-text>

              <v-card-text v-if="einsatzstelle.beschreibung">
                <strong>Beschreibung</strong>
                <br>
                {{ einsatzstelle.beschreibung }}
              </v-card-text>
            </v-flex>
            <v-flex md6>
              <v-card-text
                v-if="einsatzstelle.name || einsatzstelle.adresse || einsatzstelle.webseite">
                <strong>Einsatzstelle</strong>
                <v-list dense>
                  <v-list-item v-if="einsatzstelle.name">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">
                        mdi-home
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="special-item-content">
                      {{ einsatzstelle.name }}
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.adresse">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">
                        mdi-map-marker
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="special-item-content">
                      {{ einsatzstelle.adresse }}
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.webseite">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">
                        mdi-web
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="special-item-content">
                      <a
                        :href="einsatzstelle.webseite"
                        target="_blank">{{ einsatzstelle.webseite }}</a>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-text
                v-if="einsatzstelle.ansprechpartner || einsatzstelle.telefon || einsatzstelle.email">
                <strong>Ansprechpartner</strong>
                <v-list dense>
                  <v-list-item v-if="einsatzstelle.ansprechpartner">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">
                        mdi-account
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="special-item-content">
                      {{ einsatzstelle.ansprechpartner }}
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.telefon">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">
                        mdi-phone
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="special-item-content">
                      <a
                        :href="'tel:'+einsatzstelle.telefon"
                        target="_blank">{{ einsatzstelle.telefon }}</a>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="einsatzstelle.email">
                    <v-list-item-icon>
                      <v-icon color="#0068b4">
                        mdi-email
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="special-item-content">
                      <a
                        :href="'mailto:'+einsatzstelle.email"
                        target="_blank">{{ einsatzstelle.email }}</a>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-flex>
          </v-layout>
        </v-container>

        <v-card-actions class="justify-center">
          <v-btn
            small
            color="#0068b4"
            dark
            @click="schliessen">
            Schließen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<style>
.headline {
  word-break: normal !important;
}
.special-item-content{
  font-weight: 500;
  font-size: 0.8125rem;
}
</style>

<script>
export default {
  props: { dialog: Boolean, einsatzstelle: {type: Object, default: ()=>{} }},
  computed: {
    bild: function() {
      var pattern = new RegExp("^(https?|ftp)://");
      var bild = "";

      if (pattern.test(this.einsatzstelle.bild)) {
        bild = this.einsatzstelle.bild;
      }
      return bild;
    }
  },
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
