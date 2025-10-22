const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.join(__dirname, '..', 'data', 'output.json');

function loadData(){
  try{
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    // normalize fields like lat/lng and parse embedded JSON strings
    return parsed.map(item => {
      const lat = item.lat && String(item.lat).trim() !== '' ? Number(item.lat) : null;
      const lng = item.lng && String(item.lng).trim() !== '' ? Number(item.lng) : null;

      function tryParseField(s){
        if(!s || typeof s !== 'string') return [];
        try{
          // fix doubled quotes "" -> " and ensure valid JSON
          const fixed = s.replace(/""/g, '"').replace(/^\"|\"$/g, '');
          return JSON.parse(fixed);
        }catch(e){
          // fallback: return original string in array
          return [s];
        }
      }

      return {
        ...item,
        lat: lat,
        lng: lng,
        periods: tryParseField(item.periods),
        typochronological_units: tryParseField(item.typochronological_units),
        ecochronological_units: tryParseField(item.ecochronological_units),
      };
    });
  }catch(e){
    console.error('Error reading data:', e);
    return [];
  }
}

app.use(express.json());
// API endpoints
app.get('/api/sites', (req, res) => {
  const data = loadData();
  res.json(data);
});

app.get('/api/site/:id', (req, res) => {
  const data = loadData();
  const site = data.find(s => String(s.id) === String(req.params.id));
  if(!site) return res.status(404).json({error: 'Not found'});
  res.json(site);
});

// simple search
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const data = loadData();
  if(!q) return res.json([]);
  const results = data.filter(s => {
    const name = s.site || s.name || '';
    const desc = s.description || '';
    const tagstr = (s.periods || []).map(p => JSON.stringify(p)).join(' ');
    return (name && name.toLowerCase().includes(q)) ||
           (desc && desc.toLowerCase().includes(q)) ||
           tagstr.toLowerCase().includes(q);
  }).slice(0, 200);
  res.json(results);
});

// Serve built frontend (after `npm run build` in web)
const staticPath = path.join(__dirname, '..', 'web', 'dist');
if(fs.existsSync(staticPath)){
  app.use(express.static(staticPath));
  app.get('*', (req,res) => res.sendFile(path.join(staticPath, 'index.html')));
}

app.listen(PORT, () => console.log(`RQpedia server listening on ${PORT}`));
