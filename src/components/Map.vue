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
    url: "data/einsatzstellen.geojson",
    einsatzstellen: {},
    einsatzstelle: {},
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
          this.einsatzstellen = L.geoJSON(data, {
            onEachFeature: this.onEachFeatureClosure()
          });
          this.map.addLayer(this.einsatzstellen);
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
      this.einsatzstelle=layer.feature.properties;
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
</style>
