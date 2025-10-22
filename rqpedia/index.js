document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([31.5, -7.9], 6);
    const searchInput = document.getElementById('search');
    let sites = [];
    let markers = [];

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetch('data/output.json')
        .then(response => response.json())
        .then(data => {
            sites = data;
            renderMarkers(sites);
        });

    function renderMarkers(data) {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        data.forEach(site => {
            if (site.lat && site.lng) {
                const marker = L.marker([site.lat, site.lng]).addTo(map);
                marker.bindPopup(`<b><a href="profile.html?id=${site.id}">${site.site}</a></b>`);
                markers.push(marker);
            }
        });
    }

    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.toLowerCase();
        const filteredSites = sites.filter(site => {
            return site.site.toLowerCase().includes(searchText);
        });
        renderMarkers(filteredSites);
    });
});
