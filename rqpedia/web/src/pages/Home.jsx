import React, {useEffect, useState} from 'react';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import SiteCard from '../components/SiteCard';
import { fetchSites } from '../utils/api';

export default function Home(){
  const [sites, setSites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filtered, setFiltered] = useState([]);

  useEffect(()=>{
    fetchSites().then(d=>{ setSites(d); setFiltered(d); });
  },[]);

  function onSelectSite(s){
    setSelected(s);
    // center map via event (MapView listens via prop change)
  }

  function onSearchResults(results){
    setFiltered(results);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">RQpedia • Archaeopedia</h1>
          <div className="text-sm text-gray-500">Morocco — Radiocarbon database</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <SearchBar sites={sites} onResultSelect={onSelectSite} onResults={onSearchResults} />
          <div className="overflow-auto max-h-[65vh] border rounded bg-white">
            {filtered.map(s => <SiteCard key={s.id} site={s} onClick={()=>onSelectSite(s)} />)}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <MapView sites={filtered} onMarkerClick={onSelectSite} selected={selected} />
          {selected && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold">{selected.site || selected.name}</h2>
              <p className="text-sm text-gray-600">Lab: {selected.labnr} — BP: {selected.bp}</p>
              <p className="mt-2 text-sm">{selected.reference}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}