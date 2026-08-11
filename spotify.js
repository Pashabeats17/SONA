(()=>{
  const KEY='sonaSpotifyTracks';
  const $=s=>document.querySelector(s);
  const getTracks=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]').slice(0,3)}catch{return[]}};
  const saveTracks=tracks=>localStorage.setItem(KEY,JSON.stringify(tracks.filter(Boolean).slice(0,3)));
  const trackId=url=>{const m=String(url||'').match(/(?:track\/|spotify:track:)([A-Za-z0-9]{22})/);return m?m[1]:''};
  const embed=id=>`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
  function addSection(){
    const sheet=$('.sheet'), radius=$('.radius-choice'); if(!sheet||!radius||$('#spotifySection'))return;
    const section=document.createElement('section'); section.id='spotifySection'; section.className='spotify-section';
    section.innerHTML=`<div class="label">BRANI SPOTIFY <small>max 3</small></div>
      <p class="spotify-help">Mostra fino a 3 brani direttamente sul tuo profilo SONA.</p>
      <div class="spotify-search"><input id="spotifySearch" placeholder="Cerca un brano su Spotify…"><button id="spotifySearchBtn">CERCA</button></div>
      <div class="spotify-note">La ricerca si apre su Spotify. Copia il link del brano e incollalo qui sotto.</div>
      <div id="spotifyInputs"></div>`;
    radius.parentNode.insertBefore(section,radius); renderInputs();
    $('#spotifySearchBtn').onclick=()=>{const q=$('#spotifySearch').value.trim();if(q)window.open('https://open.spotify.com/search/'+encodeURIComponent(q),'_blank','noopener,noreferrer')};
  }
  function renderInputs(){const box=$('#spotifyInputs');if(!box)return;const tracks=getTracks();box.innerHTML=[0,1,2].map(i=>`<div class="spotify-row"><input data-track-input="${i}" value="${tracks[i]||''}" placeholder="https://open.spotify.com/track/…"><span>${i+1}</span></div>`).join('');}
  function capture(){const tracks=[...document.querySelectorAll('[data-track-input]')].map(i=>i.value.trim()).filter(u=>trackId(u));saveTracks(tracks);}
  function addToProfile(){
    const profiles=$('#profiles'); if(!profiles)return; const tracks=getTracks(); if(!tracks.length)return;
    let card=[...profiles.querySelectorAll('.profile')].find(x=>x.textContent.includes('@pashabeats'));
    if(!card)return; let old=card.querySelector('.spotify-mini'); if(old)old.remove();
    const box=document.createElement('div');box.className='spotify-mini';box.innerHTML=tracks.map(u=>{const id=trackId(u);return id?`<iframe src="${embed(id)}" loading="lazy" title="Spotify track" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`:''}).join('');
    card.appendChild(box);
  }
  function init(){
    addSection();
    const save=$('#save'); if(save)save.addEventListener('click',()=>{capture();setTimeout(addToProfile,30)});
    const sheet=$('#sheet'); if(sheet)new MutationObserver(()=>{if(!sheet.classList.contains('hidden')){addSection();renderInputs()}}).observe(sheet,{attributes:true,attributeFilter:['class']});
    addToProfile();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();