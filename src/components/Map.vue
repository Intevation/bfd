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
    url: "https://mapserver.nabu.de/owncloud/index.php/s/WSgbJsvRYH7jf6Z/download",
    einsatzstellen: {},
    einsatzstelle: {},
    einsatzstellen_besetzt: {},
    einsatzstellen_unklar: {},
    dialog: false,
    map: {},
    //https://github.com/esri/esri-leaflet#terms
    esri: L.tileLayer(
      "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy;<a href="http://www.esri.com/">Esri</a>i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community, ' + process.env.VUE_APP_GIT_HASH,
        maxZoom: 18
      }
    ),
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      minZoom: 5,
      maxZoom: 18,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, ' + process.env.VUE_APP_GIT_HASH
    }),
    streetmap: L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' + process.env.VUE_APP_GIT_HASH,
        minZoom: 5,
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken:
          "pk.eyJ1IjoiYmpvZXJuc2NoaWxiZXJnIiwiYSI6InRzOVZKeWsifQ.y20mr9o3MolFOUdTQekhUA",
        noWrap: true
      }
    ),
    satellite: L.tileLayer.wms("https://tiles.maps.eox.at/?", {
      layers: "s2cloudless_3857",
      attribution:
        '<a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at/" target="_blank">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2017 & 2018), ' + process.env.VUE_APP_GIT_HASH
    })
    //#ba3b76
    //#b54076
    //#d0b6d0
    //#d38231
    //#13c4be
    //#e87a05
    //#31a354
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
      maxZoom: 18,
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
    //this.map.on("moveend", function() {
    //  console.log(this.map.getCenter());
    //});

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
    fetchData(url) {
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
          ws.A1.w = "titel";
          ws.B1.w = "teaser";
          ws.C1.w = "status";
          ws.D1.w = "name";
          ws.E1.w = "adresse";
          ws.F1.w = "themen";
          ws.G1.w = "beschreibung";
          ws.H1.w = "taschengeld";
          ws.I1.w = "unterkunft";
          ws.J1.w = "anforderungen";
          ws.K1.w = "beginn";
          ws.L1.w = "ende";
          ws.M1.w = "bewerbungsschluss";
          ws.N1.w = "anzahl";
          ws.O1.w = "ansprechpartner"
          ws.P1.w = "telefon";
          ws.Q1.w = "email";
          ws.R1.w = "webseite";
          ws.S1.w = "bild"
          ws.T1.w = "lat";
          ws.U1.w = "lon";
          var js = XLSX.utils.sheet_to_json(ws, { range: 0 , defval: ""});
          return js;
        }).then(data => {
          return GeoJSON.parse(data, { Point: ['lat', 'lon'] });
        }).then(gj => {
          var greenIcon = new L.Icon({
            iconUrl: "img/marker-icon-green.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });
          var redIcon = new L.Icon({
            iconUrl: "img/marker-icon-red.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });
          var greyIcon = new L.Icon({
            iconUrl: "img/marker-icon-grey.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });
          this.einsatzstellen = L.geoJSON(gj, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function (feature) {
              return feature.properties.status == "frei";
            },
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {
                icon: greenIcon
              }).on("mouseover", function () {
                this.bindPopup(feature.properties.name).openPopup();
              });
            }
          });
          this.einsatzstellen_besetzt = L.geoJSON(gj, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function (feature) {
              return feature.properties.status == "besetzt";
            },
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {
                icon: redIcon
              }).on("mouseover", function () {
                this.bindPopup(feature.properties.name).openPopup();
              });
            }
          });
          this.einsatzstellen_unklar = L.geoJSON(gj, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function (feature) {
              return (!(feature.properties.status == "frei") && !(feature.properties.status == "besetzt"));
            },
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {
                icon: greyIcon
              }).on("mouseover", function () {
                this.bindPopup(feature.properties.name).openPopup();
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
          markers.addLayer(this.einsatzstellen_besetzt);
          markers.addLayer(this.einsatzstellen_unklar);
          this.map.addLayer(markers);

          //this.map.addLayer(this.einsatzstellen);
          //this.map.addLayer(this.einsatzstellen_besetzt);
          //this.map.addLayer(this.einsatzstellen_unklar);
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
</style>
