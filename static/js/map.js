// Initialize a simple Leaflet map
var map = L.map('map').setView([-23.5, 143.0], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
