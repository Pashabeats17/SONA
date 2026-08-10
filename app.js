const REGION_URL='https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson';
const MUNICIPALITIES_URL=code=>`https://raw.githubusercontent.com/openpolis/geojson-italy/master/topojson/limits_R_${String(code).padStart(2,'0')}_municipalities.topo.json`;

const categories=['Producer','Artista','Fonico','Studio','Videomaker','DJ'];
const genres=['Pop','Hip-Hop / Rap','R&B / Soul','Reggaeton','Latin Pop','Latin Trap','Latin Urban','Afrobeats','Amapiano','Brazilian Funk / Funk Carioca','K-Pop','EDM / Electronic','House','Tech House','Afro House','Dance / Eurodance','Drill','Trap','Rage / Opium-style Rap','Alternative / Indie','Indie Pop','Rock / Alternative Rock','Country','Country Pop','Singer-Songwriter / Acoustic','Folk','J-Pop','Dancehall','Jersey Club','Hyperpop / Digicore'];
const profiles=[
  {id:1,name:'@pashabeats',type:'Producer',genres:['Hip-Hop / Rap','Trap','R&B / Soul'],city:'Firenze',lat:43.7696,lng:11.2558},
  {id:2,name:'@nightroom',type:'Studio',genres:['R&B / Soul','Pop'],city:'Milano',lat:45.4642,lng:9.19},
  {id:3,name:'@romasound',type:'Fonico',genres:['Hip-Hop / Rap','Trap'],city:'Roma',lat:41.9028,lng:12.4964},
  {id:4,name:'@vesuviobeats',type:'Producer',genres:['Afro House','Hip-Hop / Rap'],city:'Napoli',lat:40.8518,lng:14.2681},
  {id:5,name:'@palermovibe',type:'Artista',genres:['Pop','Indie Pop'],city:'Palermo',lat:38.1157,lng:13.3615}
];

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const instagramPhoto=username=>`https://unavatar.io/instagram/${encodeURIComponent(username.replace(/^@/,''))}`;

const ITALY_CENTER=[41.9,12.5];
const ITALY_BOUNDS=L.latLngBounds([[35.25,5.8],[47.7,19.2]]);
const ITALY_MIN_ZOOM=5.15;

const map=L.map('map',{zoomControl:false,attributionControl:false,zoomSnap:.25,minZoom:ITALY_MIN_ZOOM,maxZoom:12,maxBounds:ITALY_BOUNDS,maxBoundsViscosity:1,worldCopyJump:false,preferCanvas:true,zoomAnimation:true,fadeAnimation:false,markerZoomAnimation:false}).setView(ITALY_CENTER,ITALY_MIN_ZOOM);

let regionLayer=null;
let cityLayer=null;
let selectedRegion=null;
let selectedRegionCode=null;
let locationCircle=null;
let locationMarker=null;
let cityLoading=false;
let cityLoadedFor=null;
const categoryState=new Set();
const genreState=new Set();

const regionCentroids={'PIEMONTE':[45.05,7.65],'VALLE D\'AOSTA':[45.74,7.31],'LOMBARDIA':[45.5,9.9],'TRENTINO-ALTO ADIGE':[46.1,11.25],'VENETO':[45.55,11.85],'FRIULI-VENEZIA GIULIA':[46.1,13.15],'LIGURIA':[44.25,8.95],'EMILIA-ROMAGNA':[44.55,11.1],'TOSCANA':[43.4,11.0],'UMBRIA':[43.05,12.45],'MARCHE':[43.3,13.0],'LAZIO':[41.85,12.9],'ABRUZZO':[42.25,13.8],'MOLISE':[41.7,14.5],'CAMPANIA':[40.9,14.9],'PUGLIA':[41.0,16.0],'BASILICATA':[40.45,16.0],'CALABRIA':[39.05,16.3],'SICILIA':[37.6,14.1],'SARDEGNA':[40.0,9.0]};
function norm(s){return String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/’/g,"'");}
function regionName(f){return f?.properties?.reg_name||f?.properties?.NOME_REG||f?.properties?.name||'Regione';}
function regionCode(f){return Number(f?.properties?.reg_istat_code_num||f?.properties?.reg_istat_code||0)||null;}
function genreButtons(expanded=false,profile=false){const visible=expanded?genres:genres.slice(0,6);const attr=profile?'data-profile="genre"':'data-group="genre"';return visible.map(x=>`<button class="chip" ${attr} data-value="${x}">${x}</button>`).join('')+(expanded?'':`<button class="chip more-chip" data-more="${profile?'profile':'filter'}">Altro</button>`);}
function buildChips(){
  $('#categories').innerHTML=categories.map(x=>`<button class="chip" data-group="cat" data-value="${x}">${x}</button>`).join('');
  $('#genres').innerHTML=genreButtons(false,false);
  $('#profileCats').innerHTML=categories.map(x=>`<button class="chip" data-profile="cat" data-value="${x}">${x}</button>`).join('');
  $('#profileGenres').innerHTML=genreButtons(false,true);
  document.addEventListener('click',e=>{const more=e.target.closest('.more-chip');if(more){const target=more.dataset.more==='profile'?$('#profileGenres'):$('#genres');target.innerHTML=genreButtons(true,more.dataset.more==='profile');return}const b=e.target.closest('.chip');if(!b)return;if(b.dataset.profile){toggleProfileChip(b);return}toggleFilterChip(b);});
}
function toggleFilterChip(b){const set=b.dataset.group==='cat'?categoryState:genreState,v=b.dataset.value;set.has(v)?set.delete(v):set.add(v);b.classList.toggle('active',set.has(v));renderProfiles();}
function toggleProfileChip(b){const all=$$(`[data-profile="${b.dataset.profile}"]`),selected=all.filter(x=>x.classList.contains('selected')).length;if(!b.classList.contains('selected')&&selected>=3){b.animate([{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:160});return}b.classList.toggle('selected');}
function renderProfiles(){
  const q=($('#search').value||'').trim().toLowerCase();
  const visible=profiles.filter(p=>{const text=[p.name,p.type,p.city,...p.genres].join(' ').toLowerCase();return(!q||text.includes(q))&&(!categoryState.size||categoryState.has(p.type))&&(!genreState.size||p.genres.some(g=>genreState.has(g)));});
  $('#count').textContent=visible.length;
  $('#profiles').innerHTML=visible.length?visible.map(p=>{const username=p.name.replace(/^@/,'');return `<article class="profile"><div class="who"><div class="avatar"><img src="${instagramPhoto(username)}" alt="Foto profilo Instagram di ${p.name}" loading="lazy" referrerpolicy="no-referrer"><span>${username.slice(0,1).toUpperCase()}</span></div><div><b>${p.name}</b><small>${p.type} · ${p.genres.slice(0,3).join(' · ')} · ${p.city}</small></div></div><button class="igbtn" data-ig="${p.name}">Instagram</button></article>`;}).join(''):`<div class="profile"><div><b>Nessun risultato</b><small>Prova a cambiare filtri o zona.</small></div></div>`;
  $$('#profiles [data-ig]').forEach(b=>b.onclick=()=>window.open('https://instagram.com/'+b.dataset.ig.replace('@',''),'_blank','noopener'));
}
function markerIcon(){return L.divIcon({className:'sonap',iconSize:[9,9],iconAnchor:[4.5,4.5]});}
function addMarkers(){profiles.forEach(p=>L.marker([p.lat,p.lng],{icon:markerIcon(),keyboard:false}).addTo(map).bindTooltip(`<b>${p.name}</b><br>${p.type} · ${p.city}`,{className:'sona-tip',direction:'top',offset:[0,-7]}));}
function styleRegion(){return{className:'region',weight:1.1,color:'#302c37',fillColor:'#0e0e14',fillOpacity:.96};}
function styleCities(){return{className:'city-boundary',weight:.55,color:'#5f5868',fillColor:'#17121b',fillOpacity:.12};}
function onRegion(feature,layer){const name=regionName(feature);layer.on({click:()=>zoomRegion(layer,name),mouseover:e=>e.target.setStyle({fillColor:'#17131d',color:'#7657ff'}),mouseout:e=>{if(e.target!==selectedRegion)e.target.setStyle(styleRegion(feature));}});const c=regionCentroids[norm(name)];if(c)L.marker(c,{interactive:false,icon:L.divIcon({className:'region-label',html:name.replace('TRENTINO-ALTO ADIGE','TRENTINO').replace('FRIULI-VENEZIA GIULIA','FRIULI').replace('EMILIA-ROMAGNA','EMILIA'),iconSize:[80,16],iconAnchor:[40,8]})}).addTo(map);}
async function loadCitiesForRegion(code){if(!code||cityLoading||cityLoadedFor===code)return;cityLoading=true;try{const r=await fetch(MUNICIPALITIES_URL(code),{cache:'force-cache'});if(!r.ok)throw new Error('cities');const topo=await r.json();const objectName=Object.keys(topo.objects||{})[0];if(!objectName)throw new Error('cities-object');const geo=topojson.feature(topo,topo.objects[objectName]);cityLayer?.remove();cityLayer=L.geoJSON(geo,{style:styleCities,smoothFactor:1.1,interactive:false}).addTo(map);cityLayer.bringToFront();cityLoadedFor=code;}catch(e){}finally{cityLoading=false;}}
function zoomRegion(layer,name){selectedRegion=layer;selectedRegionCode=regionCode(layer.feature);regionLayer.eachLayer(x=>x.setStyle(styleRegion(x.feature)));layer.setStyle({fillColor:'#1b1421',color:'#ff27c7',weight:1.7});map.fitBounds(layer.getBounds(),{padding:[30,30],maxZoom:7.75,duration:.7});$('#mapTitle').textContent=name;$('#mapSub').textContent='Città delineate · zooma per esplorare';$('#reset').classList.add('show');loadCitiesForRegion(selectedRegionCode);}
function resetMap(){selectedRegion=null;selectedRegionCode=null;cityLoadedFor=null;cityLayer?.remove();cityLayer=null;regionLayer?.eachLayer(l=>l.setStyle(styleRegion(l.feature)));map.flyTo(ITALY_CENTER,ITALY_MIN_ZOOM,{duration:.65});map.setMaxBounds(ITALY_BOUNDS);$('#mapTitle').textContent='Tutta Italia';$('#mapSub').textContent='Tocca una regione per entrare';$('#reset').classList.remove('show');}
async function loadRegions(){try{const r=await fetch(REGION_URL,{cache:'force-cache'});if(!r.ok)throw Error();const data=await r.json();regionLayer=L.geoJSON(data,{style:styleRegion,onEachFeature:onRegion,smoothFactor:1.5}).addTo(map);map.setMaxBounds(ITALY_BOUNDS);}catch(e){$('#mapTitle').textContent='Mappa offline';$('#mapSub').textContent='Ricarica per visualizzare i confini regionali';}}
function locateUser(){if(!navigator.geolocation){alert('La posizione non è disponibile su questo browser.');return}navigator.geolocation.getCurrentPosition(pos=>{const ll=[pos.coords.latitude,pos.coords.longitude];locationMarker?.remove();locationCircle?.remove();locationMarker=L.marker(ll,{icon:markerIcon()}).addTo(map).bindTooltip('La tua zona',{className:'sona-tip'}).openTooltip();locationCircle=L.circle(ll,{radius:5000,color:'#ff27c7',weight:1,opacity:.45,fillColor:'#ff27c7',fillOpacity:.035}).addTo(map);map.flyTo(ll,Math.max(9,map.getZoom()),{duration:.8});$('#mapTitle').textContent='La tua zona';$('#mapSub').textContent='Raggio massimo 5 km';},()=>alert('Posizione non concessa. Puoi comunque cercare una città.'));}
function openSheet(){const saved=JSON.parse(localStorage.getItem('sonaProfile')||'null');if(saved){$('#ig').value=saved.ig||'';$('#city').value=saved.city||'';$$('[data-profile]').forEach(b=>b.classList.toggle('selected',(b.dataset.profile==='cat'?saved.categories:saved.genres)?.includes(b.dataset.value)));}$('#sheet').classList.remove('hidden');}
function closeSheet(){$('#sheet').classList.add('hidden');}
function saveProfile(){const cats=$$('[data-profile="cat"].selected').map(x=>x.dataset.value);const gs=$$('[data-profile="genre"].selected').map(x=>x.dataset.value);const ig=$('#ig').value.trim()||'@pashabeats';const city=$('#city').value.trim()||'Firenze';localStorage.setItem('sonaProfile',JSON.stringify({ig,city,categories:cats,genres:gs}));closeSheet();alert('Profilo salvato su questo dispositivo.');}
buildChips();renderProfiles();addMarkers();loadRegions();$('#search').addEventListener('input',renderProfiles);$('#reset').onclick=resetMap;$('#locate').onclick=locateUser;$('#profileOpen').onclick=openSheet;$('#joinOpen').onclick=openSheet;$('#closeSheet').onclick=closeSheet;$('#save').onclick=saveProfile;$('#sheet').addEventListener('click',e=>{if(e.target===e.currentTarget)closeSheet();});