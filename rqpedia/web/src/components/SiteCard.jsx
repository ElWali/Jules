import React from 'react';

export default function SiteCard({site, onClick}){
  return (
    <div className="p-3 hover:bg-gray-50 border-b cursor-pointer" onClick={onClick}>
      <div className="font-medium">{site.site || site.name}</div>
      <div className="text-xs text-gray-500">{site.labnr} — {site.bp} BP</div>
    </div>
  );
}