<template>
  <div id="map">
    <Popup :dialog.sync="dialog" :einsatzstelle="einsatzstelle"></Popup>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Popup from "./Popup";
import germany from "./germany";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";

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
    url: "data/EinsatzstellenKartenanwendung.geojson",
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
          '&copy;<a href="http://www.esri.com/">Esri</a>i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      }
    ),
    osm: new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      minZoom: 6,
      maxZoom: 18,
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    streetmap: L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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
        '<a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at/" target="_blank">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2017 & 2018)'
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
  },
  mounted() {
    this.map = L.map("map", {
      attributionControl: false,
      center: [51, 13],
      zoom: 6,
      maxZoom: 18,
      minZoom: 6,
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

      initialize: function(latLngs, options) {
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

    L.mask = function(latLngs, options) {
      return new L.Mask(latLngs, options);
    };

    L.mask(germany).addTo(this.map);
  },
  methods: {
    fetchData(url) {
      fetch(url)
        .then(response => {
          return response.json();
        })
        .then(data => {
          var greenIcon = new L.Icon({
            iconUrl: "img/marker-icon-green.png",
            shadowUrl: "img/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          var redIcon = new L.Icon({
            iconUrl: "img/marker-icon-red.png",
            shadowUrl: "img/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          var greyIcon = new L.Icon({
            iconUrl: "img/marker-icon-grey.png",
            shadowUrl: "img/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          this.einsatzstellen = L.geoJSON(data, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function(feature) {
              return feature.properties.status == "frei";
            },
            pointToLayer: function(feature, latlng) {
              return L.marker(latlng, {
                icon: greenIcon
              }).on("mouseover", function() {
                this.bindPopup(feature.properties.name).openPopup();
              });
            }
          });
          this.einsatzstellen_besetzt = L.geoJSON(data, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function(feature) {
              return feature.properties.status == "besetzt";
            },
            pointToLayer: function(feature, latlng) {
              return L.marker(latlng, {
                icon: redIcon
              }).on("mouseover", function() {
                this.bindPopup(feature.properties.name).openPopup();
              });
            }
          });
          this.einsatzstellen_unklar = L.geoJSON(data, {
            onEachFeature: this.onEachFeatureClosure(),
            //filter: function(feature, layer)
            filter: function(feature) {
              return (feature.properties.status !== "frei") | "besetzt";
            },
            pointToLayer: function(feature, latlng) {
              return L.marker(latlng, {
                icon: greyIcon
              }).on("mouseover", function() {
                this.bindPopup(feature.properties.name).openPopup();
              });
            }
          });

          var markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 25,
            iconCreateFunction: function(cluster) {
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
        layer.on("click", function(e) {
          that.klick(e.target);
        });
      };
    },
    klick(layer) {
      console.log(layer);
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
