/* modified from
 * https://github.com/shramov/leaflet-plugins/commit/f387ce1ec9f85f7e6558fd3dd7a6baff4e31a6b3#diff-9a15ae9cb46f6cad34cf696d87b8fbd5
 *
 * Copyright (c) 2011-2015, Pavel Shramov, Bruno Bergot
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as L from "leaflet";

/*
 * Google layer using Google Maps API
 */

/* global google: true */
L.Google = L.Layer.extend({
  includes: L.Evented.prototype || L.Mixin.Events,
  options: {
    minZoom: 0,
    maxZoom: 18,
    tileSize: 256,
    subdomains: "abc",
    errorTileUrl: "",
    attribution: "",
    opacity: 1,
    continuousWorld: false,
    noWrap: false,
    mapOptions: {
      backgroundColor: "#dddddd"
    }
  },

  // Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
  initialize: function(type, options) {
    var _this = this;

    this._ready = L.Google.isGoogleMapsReady();

    L.Util.setOptions(this, options);

    this._googleApiPromise = this._ready
      ? Promise.resolve(window.google)
      : L.Google.createGoogleApiPromise();

    this._googleApiPromise.then(function() {
      _this._ready = true;
      _this._initMapObject();
      _this._update();
    });
    this._type = type || "SATELLITE";
  },

  onAdd: function(map, insertAtTheBottom) {
    var _this = this;
    this._googleApiPromise.then(function() {
      _this._map = map;
      _this._insertAtTheBottom = insertAtTheBottom;

      // create a container div for tiles
      _this._initContainer();
      _this._initMapObject();

      // set up events
      map.on("viewreset", _this._reset, _this);

      // _this._limitedUpdate = L.Util.throttle(_this._update, 150, _this);
      map.on("move", _this._update, _this);

      map.on("zoomanim", _this._handleZoomAnim, _this);

      // 20px instead of 1em to avoid a slight overlap with google's attribution
      map._controlCorners.bottomright.style.marginBottom = "20px";

      _this._reset();
      _this._update();
    });
  },

  onRemove: function(map) {
    map._container.removeChild(this._container);

    map.off("viewreset", this._reset, this);

    map.off("move", this._update, this);

    map.off("zoomanim", this._handleZoomAnim, this);

    map._controlCorners.bottomright.style.marginBottom = "0em";
  },

  getAttribution: function() {
    return this.options.attribution;
  },

  setOpacity: function(opacity) {
    this.options.opacity = opacity;
    if (opacity < 1) {
      L.DomUtil.setOpacity(this._container, opacity);
    }
  },

  setElementSize: function(e, size) {
    e.style.width = size.x + "px";
    e.style.height = size.y + "px";
  },

  _initContainer: function() {
    var tilePane = this._map._container,
      first = tilePane.firstChild;

    if (!this._container) {
      this._container = L.DomUtil.create("div", "leaflet-google-layer");
      this._container.id = "_GMapContainer_" + L.Util.stamp(this);
      this._container.style.zIndex = "auto";
    }

    tilePane.insertBefore(this._container, first);

    this.setOpacity(this.options.opacity);
    this.setElementSize(this._container, this._map.getSize());
  },

  _initMapObject: function() {
    if (!this._ready || !this._container) return;
    this._google_center = new google.maps.LatLng(0, 0);
    var map = new google.maps.Map(this._container, {
      center: this._google_center,
      zoom: 0,
      tilt: 0,
      mapTypeId: google.maps.MapTypeId[this._type],
      disableDefaultUI: true,
      keyboardShortcuts: false,
      draggable: false,
      disableDoubleClickZoom: true,
      scrollwheel: false,
      streetViewControl: false,
      styles: this.options.mapOptions.styles,
      backgroundColor: this.options.mapOptions.backgroundColor
    });
    var _this = this;
    this._reposition = google.maps.event.addListenerOnce(
      map,
      "center_changed",
      function() {
        _this.onReposition();
      }
    );
    this._google = map;

    google.maps.event.addListenerOnce(map, "idle", function() {
      _this._checkZoomLevels();
    });
    google.maps.event.addListenerOnce(map, "tilesloaded", function() {
      _this.fire("load");
    });
    // Reporting that map-object was initialized.
    this.fire("MapObjectInitialized", { mapObject: map });
  },

  _checkZoomLevels: function() {
    //setting the zoom level on the Google map may result in a different zoom level than the one requested
    //(it won't go beyond the level for which they have data).
    // verify and make sure the zoom levels on both Leaflet and Google maps are consistent
    if (
      this._map.getZoom() !== undefined &&
      this._google.getZoom() !== Math.round(this._map.getZoom())
    ) {
      //zoom levels are out of sync. Set the leaflet zoom level to match the google one
      this._map.setZoom(this._google.getZoom());
    }
  },

  _reset: function() {
    this._initContainer();
  },

  _update: function() {
    if (!this._google) return;
    this._resize();
    const _zoom = this._map.getZoom();
    var center = this._map.getCenter();
    var _center = new google.maps.LatLng(center.lat, center.lng);

    this._google.setCenter(_center);
    if (_zoom !== undefined && this._google.getZoom() !== _zoom) {
      this._google.setZoom(Math.round(_zoom));
    }
    this._checkZoomLevels();
  },

  _resize: function() {
    var size = this._map.getSize();
    if (
      parseInt(this._container.style.width) === size.x &&
      parseInt(this._container.style.height) === size.y
    ) {
      return;
    }
    this.setElementSize(this._container, size);
    this.onReposition();
  },

  _handleZoomAnim: function(e) {
    var center = e.center;
    var _center = new google.maps.LatLng(center.lat, center.lng);

    this._google.setCenter(_center);
    this._google.setZoom(Math.round(e.zoom));
  },

  onReposition: function() {
    if (!this._google) return;
    google.maps.event.trigger(this._google, "resize");
  }
});

L.Google.isGoogleMapsReady = function() {
  return !!window.google && !!window.google.maps && !!window.google.maps.Map;
};

// backwards compat
L.Google.asyncInitialize = L.Google.isGoogleMapsReady;

L.Google.maxApiChecks = 10;

L.Google.apiCheckIntervalMilliSecs = 500;

L.Google.createGoogleApiPromise = function() {
  var checkCounter = 0;
  var intervalId = null;

  return new Promise(function(resolve, reject) {
    intervalId = setInterval(function() {
      if (
        checkCounter >= L.Google.maxApiChecks &&
        !L.Google.isGoogleMapsReady()
      ) {
        clearInterval(intervalId);
        return reject(new Error("window.google not found after max attempts"));
      }
      if (L.Google.isGoogleMapsReady()) {
        clearInterval(intervalId);
        return resolve(window.google);
      }
      checkCounter++;
    }, L.Google.apiCheckIntervalMilliSecs);
  });
};

export default L.Google;
