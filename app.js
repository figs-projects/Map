const map = L.map('map').setView([-25, 134], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

/* 🔥 Bushfires */
const fireLayer = L.layerGroup().addTo(map);

fetch('https://services9.arcgis.com/GB33F62SbDxJjwEL/ArcGIS/rest/services/National_Bushfire/FeatureServer/0/query?where=1=1&outFields=*&f=geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (f, latlng) =>
        L.circleMarker(latlng, { radius: 6, color: 'red' }),
      onEachFeature: (f, layer) => {
        layer.bindPopup(`
          <strong>🔥 Bushfire</strong><br>
          State: ${f.properties.STATE}<br>
          Source: Official
        `);
      }
    }).addTo(fireLayer);
  });

/* 🌧️ BOM Weather Warnings */
const weatherLayer = L.layerGroup().addTo(map);

fetch('https://api.weather.bom.gov.au/v1/warnings')
  .then(res => res.json())
  .then(data => {
    data.data.forEach(w => {
      if (w.geometry) {
        L.geoJSON(w.geometry, {
          style: { color: 'orange', weight: 2 }
        }).bindPopup(`
          <strong>🌧️ Weather Warning</strong><br>
          ${w.headline}<br>
          <a href="${w.links.web}" target="_blank">Official BOM</a>
        `).addTo(weatherLayer);
      }
    });
  });

/* 🚗 Main Roads WA – Traffic Incidents */
const trafficLayer = L.layerGroup();

fetch(
  "https://services.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/Main_Roads_WA_Traffic_Events/FeatureServer/0/query?where=1=1&outFields=*&f=geojson"
)
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 6,
          color: "#ffcc00",
          fillOpacity: 0.9
        }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <strong>🚗 Traffic Incident</strong><br>
          Type: ${feature.properties.EVENT_TYPE || "Incident"}<br>
          Road: ${feature.properties.ROAD_NAME || "Unknown"}<br>
          Status: ${feature.properties.STATUS || "Active"}<br>
          <small>Source: Main Roads WA</small>
        `);
      }
    }).addTo(trafficLayer);
  });


/* TOGGLES */
document.getElementById('fires').onchange = e =>
  e.target.checked ? map.addLayer(fireLayer) : map.removeLayer(fireLayer);

document.getElementById('weather').onchange = e =>
  e.target.checked ? map.addLayer(weatherLayer) : map.removeLayer(weatherLayer);

document.getElementById('traffic').onchange = e =>
  e.target.checked ? map.addLayer(trafficLayer) : map.removeLayer(trafficLayer);
