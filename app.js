// Initialize map centered on WA
const map = L.map('map').setView([-26.5, 121], 5);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Layer group for Emergency WA incidents
const emergencyLayer = L.layerGroup();

// RSS feed URL
const rssUrl = 'https://www.emergency.wa.gov.au/rss/Incidents.rss';

// Fetch RSS via CORS proxy
fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(rssUrl))
  .then(res => res.json())
  .then(data => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");
    const items = xml.querySelectorAll("item");

    items.forEach(item => {
      const title = item.querySelector("title")?.textContent || "Incident";
      const description = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "#";

      // Attempt to get coordinates from RSS
      const lat = parseFloat(item.querySelector("geo\\:lat")?.textContent || "-26.5");
      const lon = parseFloat(item.querySelector("geo\\:long")?.textContent || "121");

      const marker = L.marker([lat, lon])
        .bindPopup(`<strong>${title}</strong><br>${description}<br><a href="${link}" target="_blank">More info</a>`);
      emergencyLayer.addLayer(marker);
    });

    // Add to map by default
    emergencyLayer.addTo(map);
  })
  .catch(err => {
    console.error("Failed to load Emergency WA RSS feed", err);
    // Fallback marker in Perth with link
    const fallback = L.marker([-31.9505, 115.8605]).addTo(emergencyLayer);
    fallback.bindPopup(`
      🚨 Emergency WA feed unavailable.<br>
      <a href="https://www.emergency.wa.gov.au/" target="_blank">View incidents on official site</a>
    `);
    emergencyLayer.addTo(map);
  });

// Checkbox toggle
document.getElementById('emergencies').onchange = e => {
  if (e.target.checked) {
    map.addLayer(emergencyLayer);
  } else {
    map.removeLayer(emergencyLayer);
  }
};
