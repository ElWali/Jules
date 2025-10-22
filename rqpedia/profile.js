document.addEventListener('DOMContentLoaded', () => {
    const siteName = document.getElementById('site-name');
    const siteDetails = document.getElementById('site-details');

    const urlParams = new URLSearchParams(window.location.search);
    const siteId = urlParams.get('id');

    if (siteId) {
        fetch('data/output.json')
            .then(response => response.json())
            .then(data => {
                const site = data.find(s => String(s.id) === siteId);
                if (site) {
                    siteName.textContent = site.site;
                    siteDetails.innerHTML = `
                        <p><strong>Country:</strong> ${site.country || 'N/A'}</p>
                        <p><strong>Periods:</strong> ${parseMalformedJson(site.periods).join(', ')}</p>
                        <p><strong>Reference:</strong> ${site.reference || 'N/A'}</p>
                    `;
                } else {
                    siteName.textContent = 'Site not found';
                }
            });
    } else {
        siteName.textContent = 'No site ID provided';
    }
});
