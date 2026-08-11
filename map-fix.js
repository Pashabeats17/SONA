/* SONA map visibility fix: add a clean dark basemap before app.js initializes Leaflet. */
(function(){
  function patch(){
    if(!window.L || window.L.__sonaMapFix) return false;
    const original=window.L.map;
    window.L.map=function(id,options){
      const m=original.call(this,id,options);
      try{
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd',crossOrigin:true,opacity:.72}).addTo(m);
        setTimeout(()=>m.invalidateSize(true),80);
        setTimeout(()=>m.invalidateSize(true),500);
      }catch(e){}
      return m;
    };
    window.L.__sonaMapFix=true;
    return true;
  }
  if(!patch()) document.addEventListener('DOMContentLoaded',patch,{once:true});
})();
