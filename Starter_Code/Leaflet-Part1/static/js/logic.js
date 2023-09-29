// Store our API endpoint.
var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//----------------------- POP UP WINDOW -----------------------vvvvvvvv
  // Perform a GET request.
d3.json(queryUrl).then(function (data) {
  // Give each feature a popup.
  function bindPopuptoEarthquake(feature, layer) {
    layer.bindPopup(
      `<h3>Location: ${feature.properties.place}<br>
      Magnitude: ${feature.properties.mag}<br>
      Click <a href="${feature.properties.url}" target="_blank">ME!</a> for more info.
      </h3><hr><p>${new Date(feature.properties.time)}</p>`
    );}
//----------------------- POP UP WINDOW -----------------------^^^^^^^


//----------------------- BUBLES & RADIUS -----------------------vvvvvvvv
  function generateQuakeRadius(depth) {
    return Math.sqrt(depth / 3.1415);
  }
  function generateQuakeColor(magnitude) {
    if (magnitude > 9.0) {return "#330000"}
    if (magnitude > 8.0) {return "#660000"}
    if (magnitude > 7.0) {return "#990000"}
    if (magnitude > 6.0) {return "#CC0000"}
    if (magnitude > 5.0) {return "#CC6600"}
    if (magnitude > 4.0) {return "#FF8000"}
    if (magnitude > 3.0) {return "#FF9933"}
    if (magnitude > 2.0) {return "#FFB266"}
    if (magnitude > 1.0) {return "#FFFF00"} else {return "#FFFF99"}}
    
  function generateQuakeStyle(feature) {
    console.log(feature);
    return {
      color: generateQuakeColor(feature.properties.mag),
      radius: generateQuakeRadius(feature.geometry.coordinates[2])}}

  function generateQuakeMarker(feature, layer) {
    return L.circleMarker(layer)}
//----------------------- BUBLES & RADIUS -----------------------^^^^^^^




//----------------------- MAPS -----------------------vvvvvvvv
  // GeoJSON layer on the earthquakeData object.
  // onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: bindPopuptoEarthquake,
    style: generateQuakeStyle,
    pointToLayer: generateQuakeMarker});
  console.log(earthquakes);

//---------------------- Create the base layers---------------//
  var street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
                        
    ///---------------https://wordpress.org/support/topic/how-do-you-get-topo-map/
  var topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", 
    {attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    
      //---------------https://docs.mapbox.com/api/maps/styles/
  var PUBLIC_API_KEY =
    "pk.eyJ1Ijoic2NvbHNvbjgyIiwiYSI6ImNrdTYzbjhrdjU3ODMyb28yZmlrMHpybjYifQ.jzpQ-HWh3lT55X-v0IQoHA";

     //---------------https://docs.mapbox.com/help/troubleshooting/migrate-legacy-static-tiles-api/
  let dark = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      accessToken: PUBLIC_API_KEY});

  let satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      accessToken: PUBLIC_API_KEY});
//---------------------- Create the base layers---------------//
//----------------------- MAPS -----------------------^^^^^^^



//----------------------- MAP SELECTOR -----------------------vvvvvvvv
  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    Dark: dark,
    Satellite: satellite};
//----------------------- MAP SELECTOR -----------------------^^^^^^^


  // Create map, streetmap and earthquakes layers.
  var myMap = L.map("map", {
    center: [20.0, -4.0],
    zoom: 3,
    layers: [satellite, earthquakes]});

  var tectonicPlates = new L.LayerGroup();

  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
  .then(function (tectonicPlateData) {
    L.geoJson(tectonicPlateData).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap);
    console.log(tectonicPlates)});

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    // Add Tectonic Plates
    "Tectonic Plates": tectonicPlates,
    Earthquakes: earthquakes};

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false})
    .addTo(myMap);

  //----------------------- Color Legend -----------------------vvvvvvvv

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0];
    var colors = ["#FFFF99","#FFFF00","#FFB266","#FF9933",
      "#FF8000","#CC6600","#CC0000","#990000","#660000","#330000"];

    // Add the minimum and maximum.
    var legendInfo = `
      <h2>Earthquake Magnitude and Depth</h2>

      <div class="labels">
      <div class="min">
      ${limits[0]}
      </div>
      
      <div class="max">
      ${limits[limits.length - 1]}
      </div>
      </div>
      <ul>`;

    limits.forEach(function (limit, index) {
      legendInfo += '<li style="background-color: ' + colors[index] + '"></li>'});

    legendInfo += "</ul>";
    div.innerHTML = legendInfo;
    return div};
  // Adding the legend to the map
  legend.addTo(myMap);
});
    //----------------------- Color Legend -----------------------^^^^^^^
