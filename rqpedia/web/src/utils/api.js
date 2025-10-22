export async function fetchSites(){
  const res = await fetch('/api/sites');
  return res.ok ? res.json() : [];
}
export async function fetchSiteById(id){
  const res = await fetch(`/api/site/${id}`);
  return res.ok ? res.json() : null;
}
export async function searchApi(q){
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  return res.ok ? res.json() : [];
}