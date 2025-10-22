import React, {useState, useEffect} from 'react';

export default function SearchBar({sites=[], onResultSelect, onResults}){
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(()=>{
    if(!q){ setResults([]); onResults && onResults(sites); return; }
    const qq = q.toLowerCase();
    const r = sites.filter(s => (s.site || '').toLowerCase().includes(qq) || (s.labnr||'').toLowerCase().includes(qq)).slice(0,50);
    setResults(r);
    onResults && onResults(r);
  },[q,sites]);

  return (
    <div className="p-2">
      <input
        className="w-full p-3 rounded border"
        placeholder="Search site name or lab number..."
        value={q}
        onChange={e=>setQ(e.target.value)} />

      {results.length>0 && (
        <div className="mt-2 bg-white rounded shadow max-h-64 overflow-auto">
          {results.map(r=> (
            <div key={r.id} className="p-2 border-b cursor-pointer hover:bg-gray-50" onClick={()=>onResultSelect(r)}>
              <div className="font-medium">{r.site || r.name}</div>
              <div className="text-xs text-gray-500">{r.labnr} — {r.bp} BP</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}