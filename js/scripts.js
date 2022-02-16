var transformRequest = (url, resourceType) => {
  var isMapboxRequest =
    url.slice(8, 22) === "api.mapbox.com" ||
    url.slice(10, 26) === "tiles.mapbox.com";
  return {
    url: isMapboxRequest
      ? url.replace("?", "?pluginName=sheetMapper&")
      : url
  };
};
//YOUR TURN: add your Mapbox token

mapboxgl.accessToken = 'pk.eyJ1IjoibmFuY3kyMjM1IiwiYSI6ImNremhsenA3dzJibHgyb2t1aHA5ZzJvYXcifQ.ENgwmLpXLnphzFpbbmo-PQ'; //Mapbox token
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v9', // YOUR TURN: choose a style: https://docs.mapbox.com/api/maps/#styles
  center: [-75, 43], // starting position [lng, lat]
  zoom: 10,// starting zoom
  transformRequest: transformRequest
});

$(document).ready(function () {
  $.ajax({
    type: "GET",
    //YOUR TURN: Replace with csv export link
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIzdqjbzp_TTBNW4P_U5xNYtPiKcTFpQ3IT8he7_I5Kr2VF_2XwnLkQvk-y4bdIb_zQwMqZEBorwUV/pub?gid=0&single=true&output=csv',
    dataType: "text",
    success: function (csvData) { makeGeoJSON(csvData); }
  });



  function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(csvData, {
      latfield: 'Latitude',
      lonfield: 'Longitude',
      delimiter: ','
    }, function (err, data) {
      map.on('load', function () {

        //Add the the layer to the map
        map.addLayer({
          'id': 'csvData',
          'type': 'circle',
          'source': {
            'type': 'geojson',
            'data': data
          },
          'paint': {
            'circle-radius': 5,
            'circle-color': "purple"
          }
        });


        // When a click event occurs on a feature in the csvData layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'csvData', function (e) {
          var coordinates = e.features[0].geometry.coordinates.slice();

          //set popup text
          //You can adjust the values of the popup to match the headers of your CSV.
          // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV.
          var description = `<h3>` + e.features[0].properties.Name + `</h3>` + `<h4>` + `<b>` + `CityName: ` + `</b>` + e.features[0].properties.CityName + `</h4>` + `<h4>` + `<b>` + `When: ` + `</b>` + e.features[0].properties.When + `</h4>`;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          //add Popup to map

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'csvData', function () {
          map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'places', function () {
          map.getCanvas().style.cursor = '';
        });

        var bbox = turf.bbox(data);
        map.fitBounds(bbox, { padding: 50 });

      });

    });
  };
});




/* var popup = new mapboxgl.Popup({
  offset :40
})
  .setHTML('<h3>Washington Square Park</h3>');

// add marker for wsp fountain
var marker = new mapboxgl.Marker({
.setLngLat(wspCenter)
.setPopup(popup)
.addTo(map);

var pointsOfInterest = [
  {
    lngLat: [-74.016444,40.689438],
    popupHtml: 'Nolan Park',
  }
  {
    lngLat: [],
    popupHtml: '',
  }
  {
    lngLat: [],
    popupHtml: '',
  }
]

pointsOfInterest.forEACH(function(pointsOfInterest){
  var mapboxgl.Marker()
  .setLngLat(pointsOfInterest.LngLat)
  .setPopup(popup)
  .addTo(map);
}
)
*/
