let allPlaces = [];

// === DATA FETCHING & PROCESSING ===
async function loadData() {
  try {
    const response = await fetch('output.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const uniqueSites = new Set();

    allPlaces = data
      .map(item => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lng);

        if (!item.site || isNaN(lat) || isNaN(lon)) {
          return null;
        }

        const siteKey = item.site.toLowerCase();
        if (uniqueSites.has(siteKey)) return null;
        uniqueSites.add(siteKey);

        // Field label mapping
        const fieldLabels = {
          d: 'Sample ID',
          labnr: 'Laboratory Number',
          bp: 'Radiocarbon Age (BP)',
          std: 'Uncertainty',
          'delta c13': 'δ¹³C (delta C13)',
          'feature type': 'Feature Type',
          site: 'Site Name',
          country: 'Country',
          lat: 'Latitude',
          lng: 'Longitude',
          'site type': 'Site Type',
          periods: 'Cultural Period(s)',
          'typochronological units': 'Typochronological Unit(s)',
          'ecochronological units': 'Ecochronological Unit(s)',
          reference: 'Reference'
        };

        const skipFields = ['d', 'lat', 'lng']; // Hide internal or redundant fields

        const extractParts = [];

        for (const key in item) {
          if (!item.hasOwnProperty(key)) continue;

          let value = item[key];
          if (value === null || value === '' || value === undefined) continue;

          // Parse JSON strings if possible
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            const parsed = parseMalformedJson(value);
            if (Array.isArray(parsed)) {
              const cleaned = parsed
                .map(obj => {
                  if (obj && typeof obj === 'object') {
                    // Extract value from known keys
                    if (obj.periode) return obj.periode;
                    if (obj.typochronological_unit) return obj.typochronological_unit;
                    if (obj.ecochronological_unit) return obj.ecochronological_unit;
                    if (obj.reference) return obj.reference;
                    return Object.values(obj)[0] || '';
                  }
                  return String(obj);
                })
                .filter(v => v && v !== 'null' && v.trim() !== '')
                .join(', ');
              value = cleaned || '—';
            } else if (typeof parsed === 'object' && parsed !== null) {
              value = parsed.reference || JSON.stringify(parsed);
            }
          }

          // Skip unwanted fields
          if (skipFields.includes(key)) continue;

          // Format special values
          let displayValue = value;
          if (key === 'country' && value === 'MA') {
            displayValue = 'Morocco';
          } else if (key === 'bp') {
            displayValue = `${parseFloat(value).toFixed(1)} years BP`;
          } else if (key === 'std') {
            displayValue = `±${parseFloat(value).toFixed(1)} years`;
          } else if (key === 'delta c13') {
            displayValue = `${parseFloat(value).toFixed(1)} ‰`;
          }

          const label = fieldLabels[key] || key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

          extractParts.push(`<strong>${label}:</strong> ${displayValue}`);
        }

        return {
          id: item.id,
          display_name: item.site,
          lat: lat,
          lon: lon,
          extract: extractParts.join('<br>')
        };
      })
      .filter(Boolean);

    initializeApp();

  } catch (error) {
    console.error("Failed to load and process site data:", error);
    showStatus('Error: Could not load site data. Please try refreshing the page.', true);
  }
}

function initializeApp() {
    const map = L.map('map', { zoomControl: true }).setView([31.8, -6.0], 6);

    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="https://www.esri.com">Esri</a> | Sources: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN',
        maxZoom: 19
      }
    ).addTo(map);

    map.attributionControl.setPrefix('');

    const searchInput = document.getElementById('search-input');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const statusMessageEl = document.getElementById('status-message');
    const locationInfoEl = document.getElementById('info');
    const infoTitleEl = document.getElementById('info-title');
    const infoTextEl = document.getElementById('info-text');
    const infoCoordsEl = document.getElementById('info-coords');
    const copyCoordsBtn = document.getElementById('copy-coords-btn');
    const shareViewBtn = document.getElementById('share-view-btn');

    let currentMarker = null;
    let currentCoords = null;

    function clearMarker() {
      if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
      }
    }

    function showStatus(message, isError = false) {
      statusMessageEl.innerHTML = message;
      statusMessageEl.style.color = isError ? '#dc2626' : '#64748b';
      statusMessageEl.style.display = 'block';
      locationInfoEl.classList.remove('show');
    }

    function showPlaceInfo(place) {
      const { id, display_name, lat, lon, extract } = place;
      currentCoords = { lat, lon };
      infoCoordsEl.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      infoTitleEl.textContent = display_name;
      infoTextEl.innerHTML = extract + `<br><p><a href="profile.html?id=${id}">Click for details</a></p>`;
      locationInfoEl.classList.add('show');
      statusMessageEl.style.display = 'none';
    }

    function renderSuggestions(filtered) {
      autocompleteResults.innerHTML = '';
      if (filtered.length === 0) {
        autocompleteResults.style.display = 'none';
        return;
      }
      filtered.forEach(place => {
        const div = document.createElement('div');
        div.className = 'suggestion';
        div.textContent = place.display_name;
        div.addEventListener('click', () => selectPlace(place));
        autocompleteResults.appendChild(div);
      });
      autocompleteResults.style.display = 'block';
    }

    function hideAutocomplete() {
      autocompleteResults.style.display = 'none';
    }

    function selectPlace(place) {
      if (!place) return;
      searchInput.value = place.display_name;
      hideAutocomplete();
      searchInput.blur();
      clearMarker();

      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      currentMarker = L.marker([lat, lon]).addTo(map);
      map.setView([lat, lon], 10);
      showPlaceInfo(place);
    }

    function handleSearch(query) {
      if (!query.trim()) {
        hideAutocomplete();
        return;
      }
      const filtered = allPlaces
        .filter(p => p.display_name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      renderSuggestions(filtered);
    }

    function handleManualSearch() {
      const query = searchInput.value.trim();
      if (!query) return;

      const exact = allPlaces.find(p => p.display_name.toLowerCase() === query.toLowerCase());
      if (exact) {
        selectPlace(exact);
        return;
      }

      const partial = allPlaces.find(p => p.display_name.toLowerCase().includes(query.toLowerCase()));
      if (partial) {
        selectPlace(partial);
        return;
      }

      showStatus('No matching site found in Moroccan dataset.', true);
      clearMarker();
      locationInfoEl.classList.remove('show');
    }

    searchInput.addEventListener('input', () => handleSearch(searchInput.value));

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        hideAutocomplete();
        handleManualSearch();
      } else if (e.key === 'Escape') {
        hideAutocomplete();
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
        hideAutocomplete();
      }
    });

    map.on('click', () => {
      if (searchInput.value.trim() !== '') {
        clearMarker();
        searchInput.value = '';
        locationInfoEl.classList.remove('show');
        statusMessageEl.textContent = 'Search for a Moroccan archaeological site';
        statusMessageEl.style.display = 'block';
        searchInput.blur();
      }
    });

    copyCoordsBtn.addEventListener('click', async () => {
      if (!currentCoords) return;
      const text = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lon.toFixed(6)}`;
      try {
        await navigator.clipboard.writeText(text);
        copyCoordsBtn.classList.add('copied');
        setTimeout(() => copyCoordsBtn.classList.remove('copied'), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });

    shareViewBtn.addEventListener('click', async () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const baseUrl = window.location.origin + window.location.pathname;
      const link = `${baseUrl}#lat=${center.lat.toFixed(6)}&lng=${center.lng.toFixed(6)}&z=${zoom}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Moroccan Archaeological Site', url: link });
          shareViewBtn.classList.add('copied');
          setTimeout(() => shareViewBtn.classList.remove('copied'), 2000);
        } catch (err) {
          console.error('Web Share failed:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(link);
          shareViewBtn.classList.add('copied');
          setTimeout(() => shareViewBtn.classList.remove('copied'), 2000);
        } catch (err) {
          alert('Failed to copy share link.');
        }
      }
    });

    window.addEventListener('resize', () => map.invalidateSize());
    map.invalidateSize();
    showStatus('Loaded ' + allPlaces.length + ' Moroccan archaeological sites.');
}

window.addEventListener('load', loadData);