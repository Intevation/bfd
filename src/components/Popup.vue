<template>
  <v-dialog
    v-model="dialog"
    persistent
    scrollable
    max-width="800">
    <v-card>
      <v-app-bar
        flat
        color="white">
        <v-toolbar-title
          v-if="einsatzstelle.projektname"
          class="headline">
          <strong>{{ einsatzstelle.projektname }}</strong>
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          fab
          icon
          dark
          color="primary"
          small
          @click="schliessen">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>
      <v-sheet
        class="overflow-y-auto"
        max-height="600">
        <v-container>
          <v-layout row>
            <v-flex md6>
              <v-card-text>
                <strong>Eckdaten</strong>
                <ul>
                  <li v-if="einsatzstelle.arten">
                    Eingesetzte Tiere: {{ einsatzstelle.arten }}
                  </li>
                  <li v-if="einsatzstelle.besatz">
                    Größe der Beweidungsfläche: {{ einsatzstelle.besatz }}
                  </li>
                  <li v-if="einsatzstelle.jahr">
                    Beweidungsdauer: {{ einsatzstelle.jahr }}
                  </li>
                  <li v-if="einsatzstelle.habitat">
                    Lebensraumtypen: {{ einsatzstelle.habitat }}
                  </li>
                  <li v-if="einsatzstelle.ort">
                    Ort der Beweidung: {{ einsatzstelle.ort }}
                  </li>
                </ul>
              </v-card-text>
            </v-flex>
            <v-flex md6>
              <v-card-text>
                <strong>Kontakt</strong>
                <ul>
                  <li v-if="einsatzstelle.adrtraeger">
                    Institution: {{ einsatzstelle.adrtraeger }}
                  </li>
                  <li v-if="einsatzstelle.adrname">
                    Verantwortliche*r: {{ einsatzstelle.adrname }}
                  </li>
                  <li v-if="einsatzstelle.mail">
                    Mail:
                    <v-icon color="#0068b4">
                      mdi-email
                    </v-icon>
                    <a
                      :href="'mailto:'+einsatzstelle.mail"
                      target="_blank">
                      {{ einsatzstelle.mail }}
                    </a>
                  </li>
                  <li v-if="einsatzstelle.webseite">
                    Webseite:
                    <a
                      :href="fixUrl(einsatzstelle.webseite)"
                      target="_blank">
                      {{ einsatzstelle.webseite }}
                    </a>
                  </li>
                </ul>
              </v-card-text>
            </v-flex>
          </v-layout>
        </v-container>
      </v-sheet>
    </v-card>
  </v-dialog>
</template>

<style>
.v-dialog--active{
    overflow: hidden !important;
}

.headline {
  white-space: normal !important;
  color: #0068b4;
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
    },
    fixUrl(url) {
      return url.startsWith('http') ? url : `http://${url}`;
    }
  }
};
</script>
