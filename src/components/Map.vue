<template>
  <div id="map">
    <Popup
      :dialog.sync="dialog"
      :einsatzstelle="einsatzstelle" />
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Popup from "./Popup";
import germany from "./germany";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import XLSX from 'xlsx';
import GeoJSON from 'geojson';

//https://github.com/KoRiGaN/Vue2Leaflet/issues/28

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default {
  components: { Popup },
  props: {},
  data: () => ({
    url: 'data/DUMMYDATA.xlsx',
    einsatzstellen: {},
    einsatzstelle: {},
    dialog: false,
    map: {},
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      minZoom: 5,
      maxZoom: 14,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, ' + process.env.VUE_APP_GIT_HASH
    }),
    plz: null,
  }),
  created() {
    this.fetchData(this.url);
    fetch("data/bundeslaender.geojson")
      .then(response => {
        return response.json();
      })
      .then(data => {
        L.geoJSON(data, {
          style: {
            stroke: true,
            color: "grey",
            weight: 1,
            opacity: 1,
            fillColor: "white",
          }
        }).addTo(this.map);
      });
  },
  mounted() {
    this.map = L.map("map", {
      attributionControl: false,
      center: (L.Browser.mobile ? [51, 10] : [51, 13]),
      zoom: (L.Browser.mobile ? 5 : 6),
      maxZoom: 14,
      minZoom: (L.Browser.mobile ? 5 : 6),
      //maxBounds: [[42, -46], [58, 67]],
      //maxBounds: [[0, -180], [0, 180]],
      fadeAnimation: false,
      zoomControl: false,
      doubleClickZoom: false
      // renderer: L.canvas()
    });

    this.map.addControl(
      L.control.attribution({
        position: "bottomright",
        prefix: false
      })
    );

    this.osm.addTo(this.map);


    L.Mask = L.Polygon.extend({
      options: {
        stroke: false,
        color: "#333",
        fillOpacity: 0.5,
        clickable: true,
        outerBounds: new L.LatLngBounds([-90, -360], [90, 360])
      },

      initialize: function (latLngs, options) {
        var outerBoundsLatLngs = [
          this.options.outerBounds.getSouthWest(),
          this.options.outerBounds.getNorthWest(),
          this.options.outerBounds.getNorthEast(),
          this.options.outerBounds.getSouthEast()
        ];
        L.Polygon.prototype.initialize.call(
          this,
          [outerBoundsLatLngs, latLngs],
          options
        );
      }
    });

    L.mask = function (latLngs, options) {
      return new L.Mask(latLngs, options);
    };

    L.mask(germany).addTo(this.map);
  },
  methods: {
    fetchPLZ() {},

    fetchData(url) {
      var prm = [];
      prm.push(
        new Promise((resolve) => {
          fetch(url)
          .then(function (response) {
            /* get the data as a Blob */
            if (!response.ok) throw new Error("fetch failed");
            return response.arrayBuffer();
          }).then(function (ab) {
            /* parse the data when it is received */
            //var data = new Uint8Array(ab);
            var workbook = XLSX.read(new Uint8Array(ab), { type: "array" });
            var ws = workbook.Sheets[workbook.SheetNames[0]];

            ws.A1.w = "id";
            ws.D1.w = "projektname";
            ws.F1.w = "plz";
            ws.G1.w = "ort";
            ws.H1.w = "habitat";
            ws.K1.w = "besatz";
            ws.L1.w = "arten";
            ws.P1.w = "jahr";
            ws.U1.w = "adrtraeger";
            ws.V1.w = "adrname";
            ws.W1.w = "adrstrasse";
            ws.X1.w = "adrhausnummer";
            ws.Y1.w = "adrplz";
            ws.Z1.w = "adrort";
            ws.AB1.w = "mail";
            ws.AE1.w = "webseite";
            var js = XLSX.utils.sheet_to_json(ws, { range: 0 , defval: ""});
            return js;
          }).then((data) => {resolve(data)})
        })
      );
      prm.push( new Promise((resolve) => {
          fetch('data/plz_ort_2021.geojson')
          .then(response => {
            return response.json()
          .then ((content) => {
            resolve(content)
          })
          })
          })
      );
      Promise.all(prm)
      .then(values => {
        const data = this.guessLocation(values[0], values[1]);
        // TODO error handling for invalid positions
          return GeoJSON.parse(data, { Point: ['lat', 'lon'] });
        }).then(gj => {
          var greenIcon = new L.Icon({
            iconUrl: "img/marker-icon-green.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });
          this.einsatzstellen = L.geoJSON(gj, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function (feature) {
              return feature.geometry.coordinates[0] !== -999;
            },
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {
                icon: greenIcon
              }).on("mouseover", function () {
                this.bindPopup( feature.properties.projektname,
                    {className: 'popupstyle'}
                ).openPopup();
              });
            }
          });
          var markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 25,
            iconCreateFunction: function (cluster) {
              return L.divIcon({
                html:
                  '<div class="divIconCluster"></div><div class="myMarkerCluster">' +
                  cluster.getChildCount() +
                  "</div>",
                iconSize: [32, 37],
                className: ""
              });
            }
          });

          markers.addLayer(this.einsatzstellen);
          this.map.addLayer(markers);
        });
    },
    onEachFeatureClosure() {
      let that = this;
      return function onEachFeature(feature, layer) {
        layer.on("click", function (e) {
          that.klick(e.target);
        });
      };
    },
    klick(layer) {
      this.einsatzstelle = layer.feature.properties;
      this.dialog = true;
    },

    //guesses location by plz (using plz_ort_2021.js)
    guessLocation(data, plz) {
      for (const item of data) {
        const itemPlz = item.plz.toString();
        const feat = plz.features.find(p => p.properties.plz === itemPlz);
        // caution! data currently is multipoint with one item
        item.lon = feat ? feat.geometry.coordinates[0][0] : -999;
        item.lat = feat ? feat.geometry.coordinates[0][1] : -999;
      }
      return data;
    }
  }
};
</script>

<style>
#map {
  width: 100% !important;
  height: 100% !important;
  z-index: 9999;
}

.myMarkerCluster {
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  background-color: darkslategrey;
  color: white;
  position: absolute;
  top: 15%;
  left: 10%;
  font-weight: bold;
  text-align: center;
}

.divIconCluster {
  width: 25px;
  height: 41px;
  line-height: 41px;
  background-image: url("../../public/img/marker-icon-blue.png");
  text-align: center;
}

.leaflet-popup-content {
  color: #0068b4;
}

</style>
