document.addEventListener('DOMContentLoaded', () => {
    let sites = [], filteredSites = [], currentIndex = 0;
    const rowsPerBatch = 30;
    let rowsLoaded = 0;
    let currentSort = { column:'name', order:'asc' };
    const tableBody = document.getElementById('sites-table-body');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('search-filter');
    const siteSelector = document.getElementById('site-selector');
    const headers = document.querySelectorAll('th[data-sort-by]');
    const scrollBtn = document.getElementById('scrollTopBtn');

    scrollBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
    window.addEventListener('scroll', () => {
        if(window.scrollY>300) scrollBtn.style.display='block'; else scrollBtn.style.display='none';
        if((window.innerHeight+window.scrollY)>=document.body.offsetHeight-200) loadMoreRows();
    });

    fetch('output.json').then(r=>r.json()).then(data=>{
        sites = processData(data);
        filteredSites = [...sites];
        populateSelector();
        sortData();
        loadMoreRows();
    });

    function processData(data){
        const map = new Map();
        data.forEach(item=>{
            if(!map.has(item.site)) map.set(item.site,{id: item.id, name:item.site,country:item.country,lat:parseFloat(item.lat),lng:parseFloat(item.lng),radiocarbonDates:0,typologicalDates:0});
            const s = map.get(item.site);
            if(item.c14) s.radiocarbonDates+=parseMalformedJson(item.c14).length;
            else s.typologicalDates+=parseMalformedJson(item.periods).length;
        });
        return Array.from(map.values());
    }

    function populateSelector(){
        siteSelector.innerHTML='';
        filteredSites.forEach((site,i)=>{
            const opt = document.createElement('option'); opt.value=i; opt.textContent=site.name; siteSelector.appendChild(opt);
        });
        document.getElementById('selected-count').textContent=`Total sites: ${filteredSites.length}`;
    }

    siteSelector.addEventListener('change',()=>{currentIndex=parseInt(siteSelector.value);scrollToSite(currentIndex);});
    document.getElementById('prev-site').addEventListener('click',()=>{if(currentIndex>0)currentIndex--;siteSelector.value=currentIndex;scrollToSite(currentIndex);});
    document.getElementById('next-site').addEventListener('click',()=>{if(currentIndex<filteredSites.length-1)currentIndex++;siteSelector.value=currentIndex;scrollToSite(currentIndex);});

    function scrollToSite(index){
        const row = tableBody.children[index];
        if(row){row.scrollIntoView({behavior:'smooth',block:'center'});row.style.background='rgba(6,182,212,0.12)';setTimeout(()=>row.style.background='transparent',800);}
    }

    function renderRows(start,end){
        const rows = filteredSites.slice(start,end);
        rows.forEach(site=>{
            const tr=document.createElement('tr');
            tr.addEventListener('click',()=>window.location.href=`profile.html?id=${site.id}`);
            tr.innerHTML=`<td>${site.name}</td><td>${site.country||'N/A'}</td><td>${site.lat.toFixed(4)}, ${site.lng.toFixed(4)}</td><td>${site.radiocarbonDates}</td><td>${site.typologicalDates}</td>`;
            tableBody.appendChild(tr);
        });
        rowsLoaded+=rows.length;
        loader.style.display='none';
    }

    function loadMoreRows(){if(rowsLoaded>=filteredSites.length)return; loader.style.display='block';setTimeout(()=>renderRows(rowsLoaded,rowsLoaded+rowsPerBatch),200);}

    function sortData(){
        filteredSites.sort((a,b)=>{
            let aV=a[currentSort.column],bV=b[currentSort.column];
            if(currentSort.column==='coordinates'){aV=a.lat;bV=b.lat;}
            if(typeof aV==='string'){aV=aV.toLowerCase();bV=bV.toLowerCase();}
            return (aV<bV?-1:aV>bV?1:0)*(currentSort.order==='asc'?1:-1);
        });
        tableBody.innerHTML=''; rowsLoaded=0; loadMoreRows(); updateHeaderStyles(); populateSelector();
    }

    searchInput.addEventListener('input',()=>{
        const term=searchInput.value.toLowerCase();
        filteredSites=sites.filter(site=>site.name.toLowerCase().includes(term)||(site.country&&site.country.toLowerCase().includes(term)));
        sortData();
    });

    headers.forEach(h=>{
        h.addEventListener('click',()=>{
            const col=h.dataset.sortBy;
            currentSort.order=(currentSort.column===col&&currentSort.order==='asc')?'desc':'asc';
            currentSort.column=col;
            sortData();
        });
    });

    function updateHeaderStyles(){
        headers.forEach(h=>{h.classList.remove('sort-asc','sort-desc');if(h.dataset.sortBy===currentSort.column)h.classList.add(currentSort.order==='asc'?'sort-asc':'sort-desc');});
    }

});