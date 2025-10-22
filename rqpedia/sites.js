document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#sites-table tbody');
    const filterInput = document.getElementById('filter');
    let sites = [];

    fetch('data/output.json')
        .then(response => response.json())
        .then(data => {
            sites = data;
            renderTable(sites);
        });

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(site => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="profile.html?id=${site.id}">${site.site}</a></td>
                <td>${site.country}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    filterInput.addEventListener('input', () => {
        const filterText = filterInput.value.toLowerCase();
        const filteredSites = sites.filter(site => {
            return site.site.toLowerCase().includes(filterText) ||
                   (site.country && site.country.toLowerCase().includes(filterText));
        });
        renderTable(filteredSites);
    });
});
