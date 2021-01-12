define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  var insertPagePageCode = Sitecore.Definitions.App.extend({
    translationContext: null,
    templateId: null,
    map : null,
    lat : 0.0,
    lng : 0.0,
    key: null, 
    marker : null,
    searchBox : null,

    initialized: function () {
      this.setOkButtonClick();
      this.setCancelButtonClick();
      this.lat = parseFloat(document.getElementById("map-point-lat").value) || 0.0;
      this.lng = parseFloat(document.getElementById("map-point-lng").value) || 0.0;
      this.key = document.getElementById("key").value;

      window.initMap = this.initMap.bind(this);
      var googleMaps = document.createElement("script");
      googleMaps.setAttribute("src", "https://maps.googleapis.com/maps/api/js?libraries=places&&key=" + this.key + "&callback=initMap");
      document.body.appendChild(googleMaps);
    },

    initMap: function(){
        var hasPoint,
          zoom,
          point = {lat : this.lat, lng : this.lng},
          _this = this,
          latInput, lngInput,
          setInputValues, resetMarker,
          searchInput;

        latInput = document.getElementById("map-point-lat");
        lngInput = document.getElementById("map-point-lng");
        setInputValues = function(args){
            latInput.value = args.lat();
            lngInput.value = args.lng();
        };

        //helper values
        hasPoint = latInput.value && lngInput.value ? true : false;
        zoom = hasPoint ? 12 : 1;

        //initialize map
        this.map = new google.maps.Map(document.getElementById("map-point-selector"),{
            zoom : zoom,
            center: point
        });

        //initialize searchbox
        searchInput = document.getElementById("map-search-box");
        this.searchBox = new google.maps.places.SearchBox(searchInput);
        //this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(searchInput);

        //initial point
        if(hasPoint){
            this.marker = new google.maps.Marker({
                position : point,
                map : this.map,
                draggable : true,
            });
            google.maps.event.addListener(this.marker,"drag",function(args){
                setInputValues(args.latLng);
            });
        }

        resetMarker = function(newMarker){
            if(_this.marker !== null){
                _this.marker.setMap(null);
                _this.marker = null;
            }

            _this.marker = new google.maps.Marker({
                position : newMarker,
                map : _this.map,
                draggable : true,
            });

            google.maps.event.addListener(_this.marker,"drag",function(args){
                setInputValues(args.latLng);
            });
        };

        //map events
        this.map.addListener("click",function(args){
            resetMarker(args.latLng);
            setInputValues(args.latLng);
        });

        this.searchBox.addListener("places_changed",function(args){
            var places = _this.searchBox.getPlaces(),
                place, bounds;
            if(places.length === 0){
                return;
            }

            place = places[0];
            resetMarker(place.geometry.location);
            setInputValues(place.geometry.location);
            bounds = new google.maps.LatLngBounds();
            if(place.geometry.viewport){
                bounds.union(place.geometry.viewport);
            }
            else {
                bounds.extend(place.geometry.location);
            }
            _this.map.fitBounds(bounds);
        });
    },

    setOkButtonClick: function () {
      this.on("button:ok", function () {
        var latInput = document.getElementById("map-point-lat"),
          lngInput = document.getElementById("map-point-lng"),
          result;
        result = {
            lat : latInput.value || "",
            lng : lngInput.value || ""
        };
        this.closeDialog(JSON.stringify(result));
      }, this);
    },
    setCancelButtonClick: function () {
      this.on("button:cancel", function () {
        this.closeDialog(null);
      }, this);
    },
  });
  return insertPagePageCode;
});
