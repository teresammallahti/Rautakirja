"use strict";

/* ============ ikonit ============ */
const I = {
  bar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>',
  hist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/></svg>',
  prog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h3"/></svg>',
  data:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 11l4 4 4-4M4 17v3h16v-3"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>',
  chev:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  back:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  x:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ============ data ============ */
const KEY = "rautakirja.v1";
const STEPS = {tanko:2.5, "käsipaino":2, talja:2.5, laite:5, kehonpaino:1};
const EQUIPS = ["tanko","käsipaino","talja","laite","kehonpaino"];

/* Liikepankki — lähde: Liikepankki.md projektikansiossa */
const LIB = [
  {g:"Rinta", items:[{n:"Penkkipunnerrus tangolla",e:"tanko"}, {n:"Vinopenkkipunnerrus tangolla",e:"tanko"}, {n:"Penkkipunnerrus käsipainoilla",e:"käsipaino"}, {n:"Vinopenkkipunnerrus käsipainoilla",e:"käsipaino"}, {n:"Vipunosto penkillä käsipainoilla",e:"käsipaino"}, {n:"Ristikkäistalja ylhäältä",e:"talja"}, {n:"Ristikkäistalja keskeltä",e:"talja"}, {n:"Ristikkäistalja alhaalta",e:"talja"}, {n:"Punnerrus",e:"kehonpaino"}]},
  {g:"Selkä — leveys (vetoliikkeet ylhäältä)", items:[{n:"Ylätalja myötäotteella",e:"talja"}, {n:"Pullover taljassa suoralla kahvalla",e:"talja"}, {n:"Ylätalja vastaotteella",e:"talja"}, {n:"Ylätalja kapealla kolmiokahvalla",e:"talja"}, {n:"Ylätalja yhdellä kädellä",e:"talja"}, {n:"Leuanveto myötäotteella",e:"kehonpaino"}, {n:"Leuanveto vastaotteella",e:"kehonpaino"}, {n:"Vetoliike laitteessa",e:"laite"}]},
  {g:"Selkä — paksuus (soutuliikkeet)", items:[{n:"Kulmasoutu tangolla",e:"tanko"}, {n:"Käsipainosoutu yhdellä kädellä",e:"käsipaino"}, {n:"Alatalja soutu, kolmiokahva",e:"talja"}, {n:"Alatalja soutu, leveä kahva",e:"talja"}, {n:"T-tankosoutu",e:"tanko"}, {n:"Soutu laitteessa rintatuella",e:"laite"}, {n:"Ylävartalon ojennus / selänojennus",e:"kehonpaino"}]},
  {g:"Hartiat", items:[{n:"Pystypunnerrus tangolla",e:"tanko"}, {n:"Pystypunnerrus käsipainoilla",e:"käsipaino"}, {n:"Olkapääpunnerrus laitteessa",e:"laite"}, {n:"Sivuvipunosto käsipainoilla",e:"käsipaino"}, {n:"Sivuvipunosto taljassa yhdellä kädellä",e:"talja"}, {n:"Takaolkapään vipunosto kumarassa",e:"käsipaino"}, {n:"Face pull taljassa",e:"talja"}, {n:"Etuvipunosto",e:"käsipaino"}]},
  {g:"Hauis", items:[{n:"Hauiskääntö vinotangolla",e:"tanko"}, {n:"Bayesian curl",e:"talja"}, {n:"Hauiskääntö käsipainoilla",e:"käsipaino"}, {n:"Hauiskääntö vuorotellen kiertäen",e:"käsipaino"}, {n:"Vasarakääntö",e:"käsipaino"}, {n:"Hauiskääntö vinopenkissä",e:"käsipaino"}, {n:"Hauiskääntö taljassa suoralla kahvalla",e:"talja"}]},
  {g:"Ojentaja", items:[{n:"Ojentaja niskan takaa taljassa, suora kahva",e:"talja"}, {n:"Ojentajapunnerrus taljassa köydellä",e:"talja"}, {n:"Ojentajapunnerrus taljassa suoralla kahvalla",e:"talja"}, {n:"Ranskalainen punnerrus tangolla",e:"tanko"}, {n:"Ranskalainen punnerrus käsipainoilla",e:"käsipaino"}, {n:"Kapea penkkipunnerrus",e:"tanko"}, {n:"Dippi ojentajalle, pysty vartalo",e:"kehonpaino"}]},
  {g:"Etureisi", items:[{n:"Polven ojennus",e:"laite"}, {n:"Askelkyykkykävely",e:"käsipaino"}, {n:"Jalkaprässi",e:"laite"}, {n:"Bulgarialainen askelkyykky",e:"käsipaino"}, {n:"Askelkyykky paikallaan",e:"käsipaino"}, {n:"Astuminen korokkeelle",e:"käsipaino"}, {n:"Goblet-kyykky",e:"käsipaino"}]},
  {g:"Takareisi ja pakarat", items:[{n:"Romanialainen maastaveto",e:"tanko"}, {n:"Polven koukistus maaten",e:"laite"}, {n:"Polven koukistus istuen",e:"laite"}, {n:"Maastaveto",e:"tanko"}, {n:"Romanialainen maastaveto käsipainoilla",e:"käsipaino"}, {n:"Lantionnosto tangolla (hip thrust)",e:"tanko"}, {n:"Selänojennus / hyperextensio",e:"kehonpaino"}, {n:"Pakaran ojennus taljassa",e:"talja"}, {n:"Lonkan loitonnus laitteessa",e:"laite"}]},
  {g:"Pohkeet", items:[{n:"Pohjenousu seisten korokkeelta",e:"käsipaino"}, {n:"Pohjenousu laitteessa seisten",e:"laite"}, {n:"Pohjenousu istuen",e:"laite"}, {n:"Pohjenousu jalkaprässissä",e:"laite"}]},
  {g:"Keskivartalo", items:[{n:"Vatsarutistus taljassa polvillaan",e:"talja"}, {n:"Riipuntapolvennosto",e:"kehonpaino"}, {n:"Riipuntajalannosto suorin jaloin",e:"kehonpaino"}, {n:"Lankku",e:"kehonpaino"}, {n:"Sivulankku",e:"kehonpaino"}, {n:"Ab wheel -rullaus",e:"kehonpaino"}, {n:"Pallof press taljassa",e:"talja"}, {n:"Vatsaliike laitteessa",e:"laite"}, {n:"Farmarikävely",e:"käsipaino"}]},
  {g:"Kyynärvarret ja ote", items:[{n:"Ranteen koukistus tangolla",e:"tanko"}, {n:"Ranteen ojennus tangolla",e:"tanko"}, {n:"Tangosta riippuminen",e:"kehonpaino"}]},
];
const MG = {};
LIB.forEach(g => g.items.forEach(i => { MG[i.n] = g.g; }));


function uid(p){ return p + Math.random().toString(36).slice(2,9); }

/* Käsipainojen painot kulkevat omaa ruudukkoaan: 1 kg välein 1–10 kg,
   sen jälkeen 2,5 kg välein (10 → 12,5 → 15 → …). Muilla välineillä
   käytetään liikkeen omaa askelta.
   Ruudukon ulkopuolelle jäänyt vanha arvo napsahtaa ruudukkoon
   ensimmäisellä painalluksella: 17 kg → ylös 17,5 / alas 15. */
function nextWeight(x, cur, dir){
  if(x.equip !== "käsipaino") return Math.max(0, cur + dir * (x.step || 2.5));
  if(dir > 0){
    if(cur < 10) return Math.floor(cur) + 1;
    return Math.floor(cur / 2.5) * 2.5 + 2.5;
  }
  if(cur <= 10) return Math.max(0, Math.ceil(cur) - 1);
  const p = Math.ceil(cur / 2.5) * 2.5 - 2.5;
  return p < 10 ? 10 : p;
}

/* Vanhan arvon pyöristys ruudukkoon alaspäin — ei koskaan ehdota
   enemmän kuin mitä on oikeasti nostettu. 17 → 15, 19 → 17,5, 21 → 20. */
function snapDumbbell(w){
  if(!(w > 0)) return 0;
  if(w <= 10) return Math.floor(w);
  return Math.max(10, Math.floor(w / 2.5) * 2.5);
}

function seedPrograms(){
  return [
    {id:"p_jalka", name:"Jalkapäivä", est:"45–55 min", ex:[
      {id:uid("x"), name:"Romanialainen maastaveto", equip:"tanko", step:2.5, sets:3, rmin:8, rmax:8, w:140},
      {id:uid("x"), name:"Polven ojennus", equip:"laite", step:5, sets:3, rmin:8, rmax:8, w:100},
      {id:uid("x"), name:"Polven koukistus maaten", equip:"laite", step:5, sets:3, rmin:8, rmax:8, w:50},
      {id:uid("x"), name:"Pohjenousu seisten korokkeelta", equip:"käsipaino", step:1, sets:3, rmin:20, rmax:20, w:0},
      {id:uid("x"), name:"Askelkyykkykävely", equip:"käsipaino", step:1, sets:3, rmin:8, rmax:8, w:15}
    ]},
    {id:"p_yla", name:"Yläkroppa", est:"60–70 min", ex:[
      {id:uid("x"), name:"Penkkipunnerrus tangolla", equip:"tanko", step:2.5, sets:3, rmin:8, rmax:8, w:87.5},
      {id:uid("x"), name:"Pullover taljassa suoralla kahvalla", equip:"talja", step:2.5, sets:3, rmin:8, rmax:8, w:46},
      {id:uid("x"), name:"Ylätalja myötäotteella", equip:"talja", step:2.5, sets:3, rmin:8, rmax:8, w:100},
      {id:uid("x"), name:"Pystypunnerrus tangolla", equip:"tanko", step:2.5, sets:3, rmin:8, rmax:8, w:47.5},
      {id:uid("x"), name:"Hauiskääntö vinotangolla", equip:"tanko", step:2.5, sets:3, rmin:8, rmax:8, w:32.5},
      {id:uid("x"), name:"Ojentaja niskan takaa taljassa, suora kahva", equip:"talja", step:2.5, sets:3, rmin:8, rmax:8, w:55},
      {id:uid("x"), name:"Bayesian curl", equip:"talja", step:2.5, sets:3, rmin:8, rmax:8, w:27.5}
    ]}
  ];
}

function seed(){
  return {
    v:5,
    programs: seedPrograms(),
    sessions:[],
    active:null,
    meta:{lastBackup:null, backupCount:0}
  };
}

let S;
try{ const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : seed(); }
catch(e){ S = seed(); }
if(!S || !S.programs) S = seed();

/* v1 → v2: liikepankki käyttöön + korjatut oletusohjelmat.
   Ohjelmat päivitetään vain jos treenejä ei ole vielä kirjattu. */
if((S.v||1) < 2){
  if(!S.sessions.length && !S.active) S.programs = seedPrograms();
  S.v = 2; save();
}

/* v2 → v3: kiinteä 3 × 8 kaikissa ohjelmien liikkeissä. Ei kosketa treenihistoriaan. */
if(S.v < 3){
  S.programs.forEach(p => p.ex.forEach(x => { x.sets = 3; x.rmin = 8; x.rmax = 8; }));
  S.v = 3; save();
}

/* v3 → v4: pohjenousu takaisin 20 toistoon. */
if(S.v < 4){
  S.programs.forEach(p => p.ex.forEach(x => {
    if(/^pohjenousu seisten korokkeelta$/i.test(String(x.name).trim())){ x.rmin = 20; x.rmax = 20; }
  }));
  S.v = 4; save();
}

/* v4 → v5: käsipainojen aloituspainot ruudukkoon (1 kg alle 10, sitten 2,5 kg).
   Treenihistoriaan ei kosketa — se on tallenne siitä mitä oikeasti tehtiin. */
if(S.v < 5){
  S.programs.forEach(p => p.ex.forEach(x => {
    if(x.equip === "käsipaino"){ x.w = snapDumbbell(x.w); x.step = 1; }
  }));
  S.v = 5; save();
}

function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast("Tallennus ei onnistunut — muisti täynnä?"); } }

/* ============ apurit ============ */
const fmt = n => (Math.round(n*100)/100).toLocaleString("fi-FI",{maximumFractionDigits:2});
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const el = h => { const t=document.createElement("template"); t.innerHTML=h.trim(); return t.content.firstElementChild; };
const reps = e => e.rmin===e.rmax ? String(e.rmin) : e.rmin+"–"+e.rmax;

function dateFi(iso){
  const d = new Date(iso), now = new Date();
  const dd = new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const nn = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const diff = Math.round((nn-dd)/864e5);
  if(diff===0) return "Tänään";
  if(diff===1) return "Eilen";
  return d.toLocaleDateString("fi-FI",{day:"numeric",month:"numeric",year:"2-digit"});
}
function dur(ms){
  const m = Math.max(0,Math.round(ms/6e4));
  return m<60 ? m+" min" : Math.floor(m/60)+" h "+String(m%60).padStart(2,"0")+" min";
}
function clock(ms){
  const s = Math.max(0,Math.floor(ms/1000));
  return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
}
function e1rm(w,r){ return w>0 ? w*(1+r/30) : 0; }
function volume(sess){
  let v=0; sess.ex.forEach(x => x.sets.forEach(s => { if(s.ok) v += (s.w||0)*(s.r||0); })); return v;
}
function setsDone(sess){
  let n=0; sess.ex.forEach(x => x.sets.forEach(s => { if(s.ok) n++; })); return n;
}

/* vahvistusdialogi — natiivi confirm() ei toimi upotetussa kehyksessä */
function ask(msg, yesLabel){
  return new Promise(res => {
    const bg = el('<div class="sheet-bg" style="align-items:center;z-index:90;padding:16px">'+
      '<div class="card pad" style="max-width:400px;margin:0 auto">'+
      '<p style="margin:0 0 15px;line-height:1.45">'+esc(msg)+'</p>'+
      '<div class="grid2"><button class="btn ghost" data-ans="0">Peruuta</button>'+
      '<button class="btn primary" data-ans="1">'+esc(yesLabel||"Jatka")+'</button></div></div></div>');
    bg.addEventListener("click", ev => {
      const b = ev.target.closest("[data-ans]");
      if(!b){ if(ev.target===bg){ ev.stopPropagation(); bg.remove(); res(false); } return; }
      ev.stopPropagation(); bg.remove(); res(b.dataset.ans==="1");
    });
    document.body.appendChild(bg);
  });
}

let toastT;
function toast(msg){
  document.querySelectorAll(".toast").forEach(n=>n.remove());
  const t = el('<div class="toast">'+esc(msg)+'</div>');
  document.body.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(()=>t.remove(), 2600);
}

/* viimeisin tehty suoritus liikkeelle (nimen perusteella) */
function lastFor(name, beforeId){
  for(let i=S.sessions.length-1;i>=0;i--){
    const s = S.sessions[i];
    if(beforeId && s.id===beforeId) continue;
    const x = s.ex.find(e => e.name===name && e.sets.some(t=>t.ok));
    if(x) return {sess:s, ex:x};
  }
  return null;
}
/* kaikki tehdyt suoritukset liikkeelle, vanhimmasta uusimpaan */
function historyFor(name){
  const out=[];
  S.sessions.forEach(s => {
    const x = s.ex.find(e => e.name===name && e.sets.some(t=>t.ok));
    if(x){
      const ok = x.sets.filter(t=>t.ok);
      const top = ok.reduce((a,b)=> e1rm(b.w,b.r)>e1rm(a.w,a.r)?b:a, ok[0]);
      out.push({date:s.date, sets:ok, top, e1:e1rm(top.w,top.r)});
    }
  });
  return out;
}
/* painoehdotus: jos viimeksi kaikki sarjat ylsivät toistotavoitteen ylärajaan → +askel */
function suggest(exDef){
  const L = lastFor(exDef.name);
  if(!L) return {w:exDef.w, up:false, last:null};
  const ok = L.ex.sets.filter(t=>t.ok);
  const lastW = ok[ok.length-1].w;
  const allMax = ok.length >= (L.ex.target||ok.length) && ok.every(t => t.r >= exDef.rmax);
  return {w: allMax ? lastW + (exDef.step||2.5) : lastW, up: allMax, last:L};
}

/* ============ Google Drive -varmuuskopiointi ============

   Käytössä on drive.appdata: piilotettu kansio käyttäjän omassa Drivessa,
   jonka vain tämä sovellus näkee. Appi ei pääse käsiksi mihinkään muuhun
   tiedostoon. Tunnus ei ole salaisuus — selainsovelluksissa se on aina
   julkinen, ja turvan hoitaa sallittu origin Google Cloudin puolella. */

const GOOGLE_CLIENT_ID = "";   /* <-- liitä tähän Google Cloudista saatu OAuth-tunnus */

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const DRIVE_FILE  = "rautakirja.json";

let gTok = null, gExp = 0, gClient = null, gBusy = false;

const driveConfigured = () => !!GOOGLE_CLIENT_ID;
const gisLoaded = () => !!(window.google && window.google.accounts && window.google.accounts.oauth2);

function driveMsg(e){
  const k = (e && e.message) || "";
  const M = {
    no_client_id:"Google Drive -yhteyttä ei ole vielä määritetty tähän sovellukseen.",
    gis_not_loaded:"Googlen kirjautuminen ei latautunut. Tarkista verkkoyhteys ja lataa sivu uudelleen.",
    popup_closed:"Kirjautuminen keskeytyi.",
    popup_failed_to_open:"Selain esti kirjautumisikkunan. Salli ponnahdusikkunat tälle sivustolle.",
    access_denied:"Käyttöoikeutta ei myönnetty.",
    unauthorized:"Yhteys vanheni. Yhdistä Google Drive uudelleen.",
    no_token:"Kirjautuminen ei tuottanut käyttöoikeutta. Yritä uudelleen."
  };
  if(M[k]) return M[k];
  if(/^http_/.test(k)) return "Google Drive vastasi virheellä (" + k.slice(5) + "). Yritä hetken päästä uudelleen.";
  return "Google Drive -toiminto ei onnistunut" + (k ? ": " + k : ".");
}

function getToken(interactive){
  return new Promise((resolve, reject) => {
    if(gTok && Date.now() < gExp - 60000) return resolve(gTok);
    if(!driveConfigured()) return reject(new Error("no_client_id"));
    if(!gisLoaded()) return reject(new Error("gis_not_loaded"));
    if(!gClient){
      gClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID, scope: DRIVE_SCOPE, callback: () => {}
      });
    }
    gClient.callback = resp => {
      if(resp && resp.access_token){
        gTok = resp.access_token;
        gExp = Date.now() + ((resp.expires_in || 3600) * 1000);
        resolve(gTok);
      } else reject(new Error((resp && resp.error) || "no_token"));
    };
    gClient.error_callback = err => reject(new Error((err && err.type) || "no_token"));
    try{ gClient.requestAccessToken(interactive ? {} : {prompt:""}); }
    catch(e){ reject(e); }
  });
}

async function dFetch(path, opts, token){
  const o = Object.assign({}, opts || {});
  o.headers = Object.assign({Authorization:"Bearer " + token}, o.headers || {});
  const r = await fetch("https://www.googleapis.com/" + path, o);
  if(r.status === 401){ gTok = null; gExp = 0; throw new Error("unauthorized"); }
  if(!r.ok) throw new Error("http_" + r.status);
  return r;
}

async function driveFind(token){
  const q = encodeURIComponent("name='" + DRIVE_FILE + "' and trashed=false");
  const r = await dFetch("drive/v3/files?spaces=appDataFolder&q=" + q +
                         "&fields=files(id,appProperties,modifiedTime)", {}, token);
  const j = await r.json();
  return (j.files && j.files[0]) || null;
}

async function driveDownload(token, id){
  const r = await dFetch("drive/v3/files/" + id + "?alt=media", {}, token);
  return await r.json();
}

async function driveUpload(token, file){
  const payload = Object.assign({}, S, {active:null});
  payload.savedAt = new Date().toISOString();
  const body = JSON.stringify(payload);
  const props = {sessions:String(S.sessions.length), savedAt:payload.savedAt};

  if(file){
    await dFetch("upload/drive/v3/files/" + file.id + "?uploadType=media",
      {method:"PATCH", headers:{"Content-Type":"application/json"}, body:body}, token);
    await dFetch("drive/v3/files/" + file.id,
      {method:"PATCH", headers:{"Content-Type":"application/json"},
       body:JSON.stringify({appProperties:props})}, token);
    return file.id;
  }
  const meta = {name:DRIVE_FILE, parents:["appDataFolder"], appProperties:props};
  const b = "rk" + Math.random().toString(36).slice(2);
  const multipart =
    "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(meta) +
    "\r\n--" + b + "\r\nContent-Type: application/json\r\n\r\n" + body +
    "\r\n--" + b + "--";
  const r = await dFetch("upload/drive/v3/files?uploadType=multipart&fields=id",
    {method:"POST", headers:{"Content-Type":"multipart/related; boundary=" + b}, body:multipart}, token);
  return (await r.json()).id;
}

function applyRemote(data){
  if(!data || !Array.isArray(data.programs) || !Array.isArray(data.sessions)) return false;
  S = Object.assign(seed(), data, {active:null});
  S.meta = S.meta || {};
  S.meta.drive = true;
  S.meta.driveAt = new Date().toISOString();
  S.meta.driveCount = S.sessions.length;
  S.meta.driveNote = null; S.meta.driveErr = null;
  save();
  return true;
}

/* Varmuuskopiointi pilveen. Ei koskaan ylikirjoita pilveä, jossa on
   ENEMMÄN treenejä kuin tällä laitteella — muuten uudella puhelimella
   avattu tyhjä appi pyyhkisi koko historian. */
async function driveSync(quiet){
  if(gBusy) return false;
  if(!driveConfigured()){ if(!quiet) toast(driveMsg(new Error("no_client_id"))); return false; }
  gBusy = true; if(!quiet) render();
  try{
    const token = await getToken(!quiet);
    const file = await driveFind(token);
    const remoteN = file && file.appProperties ? +file.appProperties.sessions : -1;
    if(remoteN > S.sessions.length){
      S.meta.driveNote = "Pilvessä on " + remoteN + " treeniä, tällä laitteella " + S.sessions.length +
        ". Varmuuskopiointi keskeytettiin, jottei pilven data korvaudu. Palauta pilvestä tai jatka käsin.";
      S.meta.driveErr = null; save(); gBusy = false; render();
      if(!quiet) toast(S.meta.driveNote);
      return false;
    }
    await driveUpload(token, file);
    S.meta.drive = true;
    S.meta.driveAt = new Date().toISOString();
    S.meta.driveCount = S.sessions.length;
    S.meta.driveNote = null; S.meta.driveErr = null;
    save(); gBusy = false; render();
    if(!quiet) toast("Varmuuskopio tallennettu Google Driveen.");
    return true;
  }catch(e){
    gBusy = false;
    if(!quiet){ S.meta.driveErr = driveMsg(e); save(); render(); toast(S.meta.driveErr); }
    else render();
    return false;
  }
}

async function driveConnect(){
  if(!driveConfigured()){ toast(driveMsg(new Error("no_client_id"))); return; }
  try{
    const token = await getToken(true);
    S.meta.drive = true; S.meta.driveErr = null; save();
    const file = await driveFind(token);
    const remoteN = file && file.appProperties ? +file.appProperties.sessions : -1;
    if(remoteN > S.sessions.length){
      render();
      const yes = await ask("Pilvestä löytyi " + remoteN + " treeniä, tällä laitteella " + S.sessions.length +
                            ". Palautetaanko pilven data tähän laitteeseen?", "Palauta");
      if(yes){
        const data = await driveDownload(token, file.id);
        if(applyRemote(data)){ render(); toast("Data palautettu: " + S.sessions.length + " treeniä."); return; }
        toast("Pilven tiedostoa ei voitu lukea.");
      }
      render(); return;
    }
    await driveSync(true);
    toast("Google Drive yhdistetty.");
  }catch(e){
    S.meta.driveErr = driveMsg(e); save(); toast(S.meta.driveErr);
  }
  render();
}

async function driveRestore(){
  if(!driveConfigured()){ toast(driveMsg(new Error("no_client_id"))); return; }
  try{
    const token = await getToken(true);
    const file = await driveFind(token);
    if(!file){ toast("Pilvestä ei löytynyt varmuuskopiota."); return; }
    const data = await driveDownload(token, file.id);
    if(!data || !Array.isArray(data.sessions)){ toast("Pilven tiedosto ei ole kelvollinen varmuuskopio."); return; }
    const yes = await ask("Pilvessä on " + data.sessions.length + " treeniä, tällä laitteella " +
                          S.sessions.length + ". Laitteen data korvataan pilven datalla.", "Palauta");
    if(!yes) return;
    if(applyRemote(data)){ render(); toast("Data palautettu: " + S.sessions.length + " treeniä."); }
    else toast("Pilven tiedostoa ei voitu lukea.");
  }catch(e){
    S.meta.driveErr = driveMsg(e); save(); render(); toast(S.meta.driveErr);
  }
}

async function driveDisconnect(){
  if(!await ask("Katkaistaanko yhteys Google Driveen? Pilvessä oleva varmuuskopio säilyy.", "Katkaise")) return;
  try{ if(gTok && gisLoaded()) window.google.accounts.oauth2.revoke(gTok, ()=>{}); }catch(_){}
  gTok = null; gExp = 0;
  S.meta.drive = false; S.meta.driveNote = null; S.meta.driveErr = null;
  save(); render(); toast("Yhteys katkaistu.");
}

/* ============ treenin tiivistelmä jaettavaksi ============ */

/* Elokuvarepliikit ja Arnoldin omat sitaatit. Alkukielellä, koska ne
   tunnistetaan siitä — käännettynä ne menettäisivät tehonsa. */
const ARNOLD = [
  ['I\'ll be back.', 'T-800, The Terminator (1984)'],
  ['Hasta la vista, baby.', 'T-800, Terminator 2 (1991)'],
  ['Come with me if you want to live.', 'T-800, Terminator 2 (1991)'],
  ['Get to the chopper!', 'Dutch, Predator (1987)'],
  ['If it bleeds, we can kill it.', 'Dutch, Predator (1987)'],
  ['I eat Green Berets for breakfast.', 'John Matrix, Commando (1985)'],
  ['Let off some steam, Bennett.', 'John Matrix, Commando (1985)'],
  ['Consider that a divorce.', 'Douglas Quaid, Total Recall (1990)'],
  ['It\'s not a tumor!', 'John Kimble, Kindergarten Cop (1990)'],
  ['You\'re luggage.', 'John Kruger, Eraser (1996)'],
  ['Crush your enemies, see them driven before you.', 'Conan, Conan the Barbarian (1982)'],
  ['Milk is for babies. When you grow up you have to drink beer.', 'Arnold, Pumping Iron (1977)'],
  ['The last three or four reps is what makes the muscle grow.', 'Arnold Schwarzenegger'],
  ['This area of pain divides a champion from someone who is not a champion.', 'Arnold Schwarzenegger'],
  ['The mind is the limit. As long as the mind can envision that you can do something, you can do it.', 'Arnold Schwarzenegger'],
  ['Strength does not come from winning. Your struggles develop your strengths.', 'Arnold Schwarzenegger'],
  ['You can\'t climb the ladder of success with your hands in your pockets.', 'Arnold Schwarzenegger'],
  ['What is the point of being on this Earth if you are going to be like everyone else?', 'Arnold Schwarzenegger'],
  ['There is no such thing as a self-made man.', 'Arnold Schwarzenegger'],
  ['The worst thing I can be is the same as everybody else.', 'Arnold Schwarzenegger'],
  ['Positive thinking can be contagious.', 'Arnold Schwarzenegger'],
  ['Training gives us an outlet for suppressed energies created by stress.', 'Arnold Schwarzenegger'],

  ['I need your clothes, your boots, and your motorcycle.', 'T-800, Terminator 2 (1991)'],
  ['No problemo.', 'T-800, Terminator 2 (1991)'],
  ['It\'s in your nature to destroy yourselves.', 'T-800, Terminator 2 (1991)'],
  ['Your clothes. Give them to me.', 'T-800, The Terminator (1984)'],
  ['Talk to the hand.', 'T-850, Terminator 3 (2003)'],
  ['Stick around.', 'Dutch, Predator (1987)'],
  ['Knock knock.', 'Dutch, Predator (1987)'],
  ['Remember when I promised to kill you last? I lied.', 'John Matrix, Commando (1985)'],
  ['Don\'t disturb my friend, he\'s dead tired.', 'John Matrix, Commando (1985)'],
  ['See you at the party, Richter!', 'Douglas Quaid, Total Recall (1990)'],
  ['Get your ass to Mars.', 'Total Recall (1990)'],
  ['You\'ve just been erased.', 'John Kruger, Eraser (1996)'],
  ['Who is your daddy, and what does he do?', 'John Kimble, Kindergarten Cop (1990)'],
  ['Big mistake.', 'Jack Slater, Last Action Hero (1993)'],
  ['Put that cookie down!', 'Howard Langston, Jingle All the Way (1996)'],
  ['Crom, I have never prayed to you before.', 'Conan, Conan the Barbarian (1982)'],
  ['Here is Subzero, now plain zero.', 'Ben Richards, The Running Man (1987)'],
  ['Ice to see you.', 'Mr. Freeze, Batman & Robin (1997)'],
  ['Have you ever killed anyone? Yeah, but they were all bad.', 'Harry Tasker, True Lies (1994)'],

  ['Trust yourself.', 'Arnold Schwarzenegger, kuusi menestyksen sääntöä'],
  ['Break the rules.', 'Arnold Schwarzenegger, kuusi menestyksen sääntöä'],
  ['Don\'t be afraid to fail.', 'Arnold Schwarzenegger, kuusi menestyksen sääntöä'],
  ['Don\'t listen to the naysayers.', 'Arnold Schwarzenegger, kuusi menestyksen sääntöä'],
  ['Work your butt off.', 'Arnold Schwarzenegger, kuusi menestyksen sääntöä'],
  ['Give something back.', 'Arnold Schwarzenegger, kuusi menestyksen sääntöä'],
  ['Everybody pities the weak; jealousy you have to earn.', 'Arnold Schwarzenegger'],
  ['There are no shortcuts — everything is reps, reps, reps.', 'Arnold Schwarzenegger'],
  ['For me life is continuously being hungry.', 'Arnold Schwarzenegger'],
  ['Start wide, expand further, and never look back.', 'Arnold Schwarzenegger'],
  ['The resistance you fight in the gym and the resistance you fight in life can only build a strong character.', 'Arnold Schwarzenegger'],
  ['If you need more sleep, sleep faster.', 'Arnold Schwarzenegger'],
  ['Bodybuilding is much like any other sport. To be successful you must dedicate yourself 100%.', 'Arnold Schwarzenegger'],
  ['Money doesn\'t make you happy. I now have $50 million but I was just as happy when I had $48 million.', 'Arnold Schwarzenegger']
];

/* Lainaus lukitaan treeniin ensimmäisellä katselukerralla ja tallennetaan
   sen mukana. Näin sama treeni näyttää aina saman lainauksen, myös
   historiassa selatessa ja varmuuskopion palautuksen jälkeen. */
function quoteFor(sess){
  if(Array.isArray(sess.q) && sess.q.length === 2) return sess.q;
  const q = ARNOLD[Math.floor(Math.random() * ARNOLD.length)];
  sess.q = q;
  save();
  return q;
}

/* ---- Kaksi erillistä ennätystyyppiä ----

   SARJAENNÄTYS: liike on viety läpi täydellä sarjamäärällä ja täysillä
   toistoilla. Ennätyspaino on se paino joka kannettiin KAIKKIEN sarjojen
   läpi, eli sarjojen kevyin. Yksikin vajaa sarja mitätöi suorituksen.

   MAKSIMIENNÄTYS: liikkeen jokaisessa sarjassa on täsmälleen yksi toisto.
   Tällöin kyse on maksimiyrityksestä, ja ennätys on raskain nostettu paino.

   Ehdot sulkevat toisensa pois, joten maksimipäivä ei voi rikkoa
   sarjaennätystä eikä normaali treeni maksimiennätystä.

   Ensimmäinen hyväksytty suoritus asettaa lähtötason eikä ole vielä
   ennätys — ennätys syntyy vasta kun aiempi taso ylitetään. */

function workSetWeight(x){
  const sets = x.sets || [];
  if(!sets.length) return 0;
  const target = x.target || sets.length;
  if(sets.length < target) return 0;
  const need = x.rmax || 0;
  if(need <= 0) return 0;
  if(!sets.every(s => (s.r||0) >= need)) return 0;
  return sets.reduce((a,s) => Math.min(a, s.w||0), Infinity) || 0;
}

function maxSetWeight(x){
  const sets = x.sets || [];
  if(!sets.length) return 0;
  if(!sets.every(s => (s.r||0) === 1)) return 0;
  return sets.reduce((a,s) => Math.max(a, s.w||0), 0);
}

/* Liikkeen ennätykset kaikista treeneistä, valinnaisesti yksi treeni pois lukien. */
function recordsFor(name, exceptId){
  let set = null, max = null;
  S.sessions.forEach(sess => {
    if(exceptId && sess.id === exceptId) return;
    sess.ex.forEach(x => {
      if(x.name !== name) return;
      const w = workSetWeight(x);
      if(w > 0 && (!set || w > set.w)) set = {w:w, date:sess.date, sets:x.sets.length, reps:x.rmax};
      const m = maxSetWeight(x);
      if(m > 0 && (!max || m > max.w)) max = {w:m, date:sess.date, sets:x.sets.length};
    });
  });
  return {set:set, max:max};
}

function prsFor(sess){
  const setPRs = [], maxPRs = [];
  sess.ex.forEach(x => {
    const prev = recordsFor(x.name, sess.id);
    const w = workSetWeight(x);
    if(w > 0 && prev.set && w > prev.set.w) setPRs.push({name:x.name, w:w, sets:x.sets.length, reps:x.rmax});
    const m = maxSetWeight(x);
    if(m > 0 && prev.max && m > prev.max.w) maxPRs.push({name:x.name, w:m});
  });
  return {set:setPRs, max:maxPRs};
}

function summaryText(sess){
  const sets = setsDone(sess);
  const reps = sess.ex.reduce((a,x) => a + x.sets.reduce((b,s) => b + (s.r||0), 0), 0);
  const d = new Date(sess.date).toLocaleDateString("fi-FI", {day:"numeric", month:"numeric", year:"numeric"});
  const prs = prsFor(sess);
  const q = quoteFor(sess);

  let t = "RAUTAKIRJA — " + sess.name + ", " + d + "\n";
  t += sess.ex.length + " liikettä, " + sets + " sarjaa, " + reps + " toistoa\n";
  t += "Nostettu yhteensä " + fmt(volume(sess)) + " kg\n";
  if(prs.set.length){
    t += "\nUudet sarjaennätykset:\n";
    prs.set.forEach(p => {
      t += "- " + p.name + " " + fmt(p.w) + " kg (" + p.sets + " × " + p.reps + ")\n";
    });
  }
  if(prs.max.length){
    t += "\nUudet maksimiennätykset:\n";
    prs.max.forEach(p => { t += "- " + p.name + " " + fmt(p.w) + " kg\n"; });
  }
  t += "\n“" + q[0] + "”\n- " + q[1];
  return t;
}

async function copyText(text, btn){
  let ok = false;
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(text); ok = true;
    }
  }catch(_){}
  if(!ok){
    /* Varalla vanha keino: valitaan teksti kentästä ja kopioidaan. */
    try{
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      ok = document.execCommand("copy");
      ta.remove();
    }catch(_){}
  }
  if(ok){
    toast("Tiivistelmä kopioitu leikepöydälle.");
    if(btn){ const old = btn.textContent; btn.textContent = "Kopioitu"; setTimeout(()=>{ btn.textContent = old; }, 1800); }
  } else {
    toast("Kopiointi ei onnistunut. Maalaa teksti ja kopioi käsin.");
  }
}

/* Kortti jossa tiivistelmä näkyy sellaisena kuin se kopioituu. */
function shareCard(sess){
  const text = summaryText(sess);
  const c = el('<div class="card pad"></div>');
  c.innerHTML =
    '<div class="eyebrow">Jaettava tiivistelmä</div>'+
    '<pre class="share-text">'+esc(text)+'</pre>'+
    '<button class="btn wide" data-copy="'+esc(sess.id)+'">Kopioi teksti</button>';
  c._text = text;
  return c;
}

/* ============ näkymä ============ */
let route = {tab:"treeni", sheet:null};
let installPrompt = null;

function render(){
  renderBar(); renderNav();
  const v = document.getElementById("view");
  v.innerHTML = "";
  if(route.tab==="treeni")  S.active ? viewWorkout(v) : viewHome(v);
  if(route.tab==="historia") viewHistory(v);
  if(route.tab==="ohjelmat") viewPrograms(v);
  if(route.tab==="data") viewData(v);
}

function renderBar(){
  const bar = document.getElementById("bar"), bp = document.getElementById("barprog");
  const titles = {treeni: S.active ? S.active.name : "Rautakirja", historia:"Historia", ohjelmat:"Ohjelmat", data:"Data"};
  bar.innerHTML = '<h1>'+esc(titles[route.tab])+'</h1>' + (route.tab==="treeni" && S.active ? '<span class="clock" id="clk">00:00</span>' : '');
  if(route.tab==="treeni" && S.active){
    const tot = S.active.ex.reduce((a,x)=> a + (x.skip?0:x.sets.length), 0);
    const dn  = setsDone(S.active);
    const cur = S.active.ex.findIndex(x=>!x.skip && x.sets.some(s=>!s.ok));
    bp.innerHTML =
      '<div class="prog-track"><div class="prog-fill" style="width:'+(tot?dn/tot*100:0)+'%"></div></div>'+
      '<div class="bar-sub"><span>Liike '+(cur<0?S.active.ex.length:cur+1)+' / '+S.active.ex.length+'</span>'+
      '<span class="num">'+dn+' / '+tot+' sarjaa</span></div>';
    tick();
  } else bp.innerHTML = "";
}

function renderNav(){
  const items = [["treeni",I.bar,"Treeni"],["historia",I.hist,"Historia"],["ohjelmat",I.prog,"Ohjelmat"],["data",I.data,"Data"]];
  document.getElementById("nav").innerHTML = items.map(([k,ic,lab]) =>
    '<button class="navbtn'+(route.tab===k?" on":"")+'" data-tab="'+k+'">'+ic+
    (k==="treeni"&&S.active?'<i class="dot"></i>':'')+'<span>'+lab+'</span></button>').join("");
}

let clkT;
function tick(){
  clearInterval(clkT);
  const upd = () => { const c=document.getElementById("clk"); if(c && S.active) c.textContent = clock(Date.now()-S.active.startedAt); };
  upd(); clkT = setInterval(upd, 1000);
}

/* ============ KOTI ============ */
function viewHome(v){
  const wrap = el('<div class="stack"></div>');

  if(installPrompt){
    wrap.appendChild(el(
      '<div class="card pad"><div class="eyebrow">Asennus</div>'+
      '<p style="margin:6px 0 12px">Lisää Rautakirja aloitusnäytölle, niin se avautuu omana sovelluksenaan ilman selainpalkkeja — ja toimii myös ilman verkkoa.</p>'+
      '<button class="btn wide primary" data-install="1">Lisää aloitusnäytölle</button></div>'));
  }

  const sinceBackup = S.sessions.length - (S.meta.backupCount||0);
  if(sinceBackup >= 3){
    wrap.appendChild(el(
      '<div class="card warn pad"><div class="eyebrow">Varmuuskopio</div>'+
      '<p style="margin:6px 0 12px">Viimeisimmän varmuuskopion jälkeen on kertynyt <b>'+sinceBackup+' treeniä</b>. '+
      'Vie data OneDriveen ennen kuin puhelimen selaimen muisti tyhjenee.</p>'+
      '<button class="btn wide" data-backup="1">Varmuuskopioi nyt</button></div>'));
  }

  // seuraava vuorossa: se ohjelma jota on treenattu vähiten viimeksi
  const lastIdx = S.programs.map(p => {
    for(let i=S.sessions.length-1;i>=0;i--) if(S.sessions[i].programId===p.id) return i;
    return -1;
  });
  const next = lastIdx.indexOf(Math.min(...lastIdx));

  S.programs.forEach((p,i) => {
    const L = (() => { for(let k=S.sessions.length-1;k>=0;k--) if(S.sessions[k].programId===p.id) return S.sessions[k]; return null; })();
    const c = el('<div class="card pad"></div>');
    c.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">'+
        (i===next?'<span class="pill accent">Vuorossa</span>':'')+
        '<span class="eyebrow">'+esc(p.est||"")+'</span></div>'+
      '<h2 style="margin:4px 0 6px">'+esc(p.name)+'</h2>'+
      '<div style="font-size:13.5px;color:var(--dim);margin-bottom:12px">'+
        p.ex.length+' liikettä · '+p.ex.reduce((a,x)=>a+x.sets,0)+' sarjaa'+
        (L?' · viimeksi '+dateFi(L.date).toLowerCase():' · ei vielä treenattu')+'</div>'+
      '<button class="btn wide '+(i===next?"primary":"")+'" data-start="'+p.id+'">Aloita treeni</button>';
    wrap.appendChild(c);
  });

  const recent = S.sessions.slice(-3).reverse();
  if(recent.length){
    const c = el('<div class="card"></div>');
    c.innerHTML = '<div class="pad" style="padding-bottom:8px"><div class="eyebrow">Viimeisimmät</div></div>' +
      recent.map(s =>
        '<button class="rowlink" data-sess="'+s.id+'">'+
        '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(s.name)+'</div>'+
        '<div style="font-size:13px;color:var(--dim)">'+dateFi(s.date)+' · '+setsDone(s)+' sarjaa · '+fmt(volume(s))+' kg volyymi</div></div>'+
        '<span class="chev">'+I.chev+'</span></button>').join("");
    wrap.appendChild(c);
  } else {
    wrap.appendChild(el('<div class="card"><div class="empty">Ei vielä treenejä.<br>Aloita ylhäältä — appi täyttää painot itse ensi kerralla.</div></div>'));
  }
  v.appendChild(wrap);
}

/* ============ TREENI ============ */
function startWorkout(pid){
  const p = S.programs.find(x=>x.id===pid); if(!p) return;
  S.active = {
    id: uid("s"), programId:p.id, name:p.name, date:new Date().toISOString(), startedAt:Date.now(),
    ex: p.ex.map(e => {
      const sg = suggest(e);
      return {
        id:e.id, name:e.name, equip:e.equip, step:e.step||STEPS[e.equip]||2.5,
        rmin:e.rmin, rmax:e.rmax, target:e.sets, up:sg.up, skip:false,
        sets: Array.from({length:e.sets}, () => ({w:sg.w, r:e.rmax, ok:false}))
      };
    }),
    note:""
  };
  save(); route.tab="treeni"; render(); wakeLock();
}

function viewWorkout(v){
  const A = S.active;
  const curIdx = A.ex.findIndex(x => !x.skip && x.sets.some(s=>!s.ok));
  const card = el('<div class="card"></div>');

  A.ex.forEach((x,i) => {
    const done = x.skip || x.sets.every(s=>s.ok);
    const open = i===curIdx || i===route.openEx;
    const d = el('<div class="ex'+(open?" active":"")+(done?" done":"")+'"></div>');

    const okSets = x.sets.filter(s=>s.ok);
    const summary = x.skip ? "Ohitettu"
      : okSets.length ? okSets.map(s=>fmt(s.r)).join(" · ") + "  @ " + fmt(okSets[okSets.length-1].w) + " kg"
      : x.target + " × " + reps(x) + " · " + fmt(x.sets[0].w) + " kg";

    d.appendChild(el(
      '<button class="ex-head" data-open="'+i+'">'+
        '<span class="idx">'+(done && !x.skip ? "✓" : i+1)+'</span>'+
        '<span class="ex-name">'+esc(x.name)+
          '<span class="ex-meta"><span class="num">'+esc(summary)+'</span>'+
          (x.up && !okSets.length ? '<span class="pill accent">Nosta painoa</span>' : '')+'</span></span>'+
      '</button>'));

    if(open && !x.skip){
      const body = el('<div class="ex-body"></div>');
      const L = lastFor(x.name, A.id);
      if(L){
        const ok = L.ex.sets.filter(t=>t.ok);
        body.appendChild(el('<div class="hint'+(x.up?" up":"")+'">'+
          '<span>Viimeksi '+dateFi(L.sess.date).toLowerCase()+':</span>'+
          '<span class="num">'+ok.map(t=>fmt(t.r)).join(" · ")+' × '+fmt(ok[ok.length-1].w)+' kg</span>'+
          (x.up?'<b>↑ tavoite täynnä, nosta painoa</b>':'')+'</div>'));
      } else {
        body.appendChild(el('<div class="hint"><span>Tavoite</span><span class="num">'+x.target+' × '+reps(x)+'</span></div>'));
      }

      x.sets.forEach((s,j) => {
        body.appendChild(el(
          '<div class="setrow'+(j===0?" first":"")+(s.ok?" ok":"")+'" data-ex="'+i+'" data-set="'+j+'">'+
            '<div class="sn">'+(j+1)+'</div>'+
            '<div class="field"><span>Paino kg'+(x.equip==="käsipaino"?" / käsi":"")+'</span><div class="stepper">'+
              '<button class="step" data-d="-1" data-f="w" aria-label="Vähennä painoa">−</button>'+
              '<input inputmode="decimal" data-f="w" value="'+fmt(s.w)+'">'+
              '<button class="step" data-d="1" data-f="w" aria-label="Lisää painoa">+</button></div></div>'+
            '<div class="field"><span>Toistot</span><div class="stepper">'+
              '<button class="step" data-d="-1" data-f="r" aria-label="Vähennä toistoja">−</button>'+
              '<input inputmode="numeric" data-f="r" value="'+s.r+'">'+
              '<button class="step" data-d="1" data-f="r" aria-label="Lisää toistoja">+</button></div></div>'+
            '<button class="chk" data-chk="1" aria-label="Merkitse sarja tehdyksi">'+I.check+'</button>'+
          '</div>'));
      });

      body.appendChild(el(
        '<div class="rowtools">'+
          '<button class="btn sm ghost" data-addset="'+i+'">+ Sarja</button>'+
          (x.sets.length>1?'<button class="btn sm ghost" data-delset="'+i+'">− Sarja</button>':'')+
          '<button class="btn sm ghost" data-skip="'+i+'" style="margin-left:auto">Ohita liike</button>'+
        '</div>'));
      d.appendChild(body);
    }
    if(open && x.skip){
      d.appendChild(el('<div class="ex-body"><button class="btn sm ghost" data-unskip="'+i+'">Palauta liike</button></div>'));
    }
    card.appendChild(d);
  });

  v.appendChild(el('<div class="stack"></div>')).append(card,
    el('<button class="btn wide" data-addwex="1">+ Lisää liike treeniin</button>'),
    el('<button class="btn wide primary" data-finish="1" style="margin-top:2px">Lopeta treeni</button>'),
    el('<button class="btn wide ghost" data-cancel="1">Hylkää treeni</button>'));
}

function finishWorkout(){
  const A = S.active;
  A.ex.forEach(x => { x.sets = x.sets.filter(s=>s.ok); });
  A.ex = A.ex.filter(x => x.sets.length);
  A.finishedAt = Date.now();
  if(!A.ex.length){ S.active=null; save(); render(); toast("Treeni hylättiin — ei kirjattuja sarjoja."); return; }
  S.sessions.push(A);
  const done = A;
  S.active = null; save();
  route.sheet = {type:"summary", id:done.id};
  render(); openSheet();
  releaseWake();
  if(S.meta.drive && driveConfigured()) driveSync(true);
}

/* ============ HISTORIA ============ */
function viewHistory(v){
  const wrap = el('<div class="stack"></div>');
  wrap.appendChild(el(
    '<div class="grid2">'+
      '<button class="btn '+(route.hsub!=="liikkeet"?"primary":"")+'" data-hsub="treenit">Treenit</button>'+
      '<button class="btn '+(route.hsub==="liikkeet"?"primary":"")+'" data-hsub="liikkeet">Liikkeet</button>'+
    '</div>'));

  if(route.hsub==="liikkeet"){
    const names = [...new Set(S.sessions.flatMap(s => s.ex.map(e=>e.name)))].sort((a,b)=>a.localeCompare(b,"fi"));
    if(!names.length){ wrap.appendChild(el('<div class="card"><div class="empty">Ei vielä dataa liikkeistä.</div></div>')); }
    else {
      const c = el('<div class="card"></div>');
      c.innerHTML = names.map(n => {
        const h = historyFor(n); const last = h[h.length-1];
        const best = h.reduce((a,b)=> b.e1>a.e1?b:a, h[0]);
        const vals = h.slice(-8).map(x=>x.e1); const mx = Math.max(...vals,1);
        const rec = recordsFor(n);
        const tag = rec.set ? 'sarjaennätys '+fmt(rec.set.w)+' kg'
                  : rec.max ? 'maksimi '+fmt(rec.max.w)+' kg'
                  : 'ei vielä ennätystä';
        return '<button class="rowlink" data-exname="'+esc(n)+'">'+
          '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(n)+'</div>'+
          '<div style="font-size:13px;color:var(--dim)">Viimeksi '+fmt(last.top.w)+' kg × '+last.top.r+
          ' · '+tag+'</div></div>'+
          '<div class="spark" style="width:56px">'+vals.map(x=>'<i style="height:'+Math.max(8,x/mx*100)+'%"></i>').join("")+'</div>'+
          '<span class="chev">'+I.chev+'</span></button>';
      }).join("");
      wrap.appendChild(c);
    }
  } else {
    if(!S.sessions.length){ wrap.appendChild(el('<div class="card"><div class="empty">Ei vielä treenejä.</div></div>')); }
    else {
      const byMonth = {};
      [...S.sessions].reverse().forEach(s => {
        const k = new Date(s.date).toLocaleDateString("fi-FI",{month:"long",year:"numeric"});
        (byMonth[k] = byMonth[k] || []).push(s);
      });
      Object.entries(byMonth).forEach(([m,list]) => {
        const c = el('<div class="card"></div>');
        c.innerHTML = '<div class="pad" style="padding-bottom:8px"><div class="eyebrow">'+esc(m)+' · '+list.length+' treeniä</div></div>'+
          list.map(s => '<button class="rowlink" data-sess="'+s.id+'">'+
            '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(s.name)+'</div>'+
            '<div style="font-size:13px;color:var(--dim)">'+dateFi(s.date)+' · '+
            (s.finishedAt?dur(s.finishedAt-s.startedAt)+' · ':'')+setsDone(s)+' sarjaa · '+fmt(volume(s))+' kg</div></div>'+
            '<span class="chev">'+I.chev+'</span></button>').join("");
        wrap.appendChild(c);
      });
    }
  }
  v.appendChild(wrap);
}

/* ============ OHJELMAT ============ */
function viewPrograms(v){
  const wrap = el('<div class="stack"></div>');
  const c = el('<div class="card"></div>');
  c.innerHTML = S.programs.map(p =>
    '<button class="rowlink" data-editp="'+p.id+'">'+
      '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(p.name)+'</div>'+
      '<div style="font-size:13px;color:var(--dim)">'+p.ex.length+' liikettä · '+esc(p.est||"")+'</div></div>'+
      '<span class="chev">'+I.chev+'</span></button>').join("");
  wrap.appendChild(c);
  wrap.appendChild(el('<button class="btn wide" data-newp="1">+ Uusi ohjelma</button>'));
  wrap.appendChild(el('<div class="card pad" style="font-size:13.5px;color:var(--dim)">'+
    '<div class="eyebrow" style="margin-bottom:6px">Painon askel</div>'+
    'Askel määrää paljonko + ja − muuttavat painoa. Oletukset: tanko 2,5 kg · talja 2,5 kg · laite 5 kg · kehonpaino 1 kg. Käsipainoilla askel on kiinteä: 1 kg kymmeneen kiloon asti, sen jälkeen 2,5 kg. Käsipainojen paino tarkoittaa aina painoa per käsi.</div>'));
  v.appendChild(wrap);
}

/* ============ DATA ============ */
function viewData(v){
  const wrap = el('<div class="stack"></div>');
  const since = S.sessions.length - (S.meta.backupCount||0);

  /* --- Google Drive --- */
  const dConn = !!S.meta.drive;
  const dSince = S.sessions.length - (S.meta.driveCount||0);
  let dBody;
  if(!driveConfigured()){
    dBody = '<div class="hint" style="margin:10px 0 0">Drive-yhteyttä ei ole vielä määritetty tähän sovellukseen. '+
            'Se vaatii kertaluontoisen tunnuksen Google Cloudista.</div>';
  } else if(!dConn){
    dBody = '<p style="font-size:13.5px;color:var(--dim);margin:6px 0 12px">Varmuuskopio tallentuu automaattisesti '+
            'treenin jälkeen omaan Driveesi piilotettuun kansioon, jonka vain tämä appi näkee. '+
            'Uudella puhelimella data palautuu kirjautumalla.</p>'+
            '<button class="btn wide primary" data-dconnect="1">Yhdistä Google Drive</button>';
  } else {
    dBody =
      '<div class="kv"><span>Viimeisin tallennus</span><span class="num">'+
        (S.meta.driveAt ? dateFi(S.meta.driveAt) : "ei vielä")+'</span></div>'+
      '<div class="kv"><span>Treenejä sen jälkeen</span><span class="num">'+Math.max(0,dSince)+'</span></div>'+
      (S.meta.driveNote ? '<div class="hint" style="margin:12px 0 0;border-left-color:var(--gold)">'+esc(S.meta.driveNote)+'</div>' : '')+
      (S.meta.driveErr ? '<div class="hint" style="margin:12px 0 0;border-left-color:var(--gold)">'+esc(S.meta.driveErr)+'</div>' : '')+
      '<button class="btn wide primary" data-dsync="1" style="margin-top:13px"'+(gBusy?' disabled':'')+'>'+
        (gBusy?'Tallennetaan…':'Tallenna pilveen')+'</button>'+
      '<div class="grid2" style="margin-top:9px">'+
        '<button class="btn" data-drestore="1">Palauta pilvestä</button>'+
        '<button class="btn ghost" data-ddisconnect="1">Katkaise</button>'+
      '</div>';
  }
  wrap.appendChild(el(
    '<div class="card pad">'+
      '<div class="eyebrow">Pilvi</div>'+
      '<h2 style="margin:5px 0 4px">Google Drive</h2>'+
      dBody+
    '</div>'));

  wrap.appendChild(el(
    '<div class="card pad">'+
      '<div class="eyebrow">Varmuuskopio</div>'+
      '<h2 style="margin:5px 0 8px">Vie tiedostona</h2>'+
      '<div class="kv"><span>Viimeisin varmuuskopio</span><span class="num">'+
        (S.meta.lastBackup ? dateFi(S.meta.lastBackup) : "ei koskaan")+'</span></div>'+
      '<div class="kv"><span>Treenejä sen jälkeen</span><span class="num">'+since+'</span></div>'+
      '<div class="kv"><span>Treenejä yhteensä</span><span class="num">'+S.sessions.length+'</span></div>'+
      '<button class="btn wide primary" data-backup="1" style="margin-top:13px">Varmuuskopioi</button>'+
      '<p style="font-size:13px;color:var(--dim);margin:11px 0 0">Puhelin avaa jakovalikon: valitse <b>OneDrive</b> ja kansio '+
        esc(OD_PARENT)+' → '+esc(OD_FOLDER)+'. OneDrive muistaa kansion, joten seuraavilla kerroilla se on valmiina. '+
        'Kansio synkkaa myös koneellesi.</p>'+
    '</div>'));
  wrap.appendChild(el(
    '<div class="card pad">'+
      '<div class="eyebrow">Palautus</div>'+
      '<h2 style="margin:5px 0 8px">Tuo varmuuskopiosta</h2>'+
      '<p style="font-size:13.5px;color:var(--dim);margin:0 0 11px">Korvaa kaiken nykyisen datan. Tee varmuuskopio ensin.</p>'+
      '<label class="btn wide" style="margin-bottom:9px">Valitse tiedosto<input type="file" accept=".json,application/json" id="imp" style="display:none"></label>'+
      '<details><summary style="font-size:13.5px;color:var(--dim);cursor:pointer;padding:6px 0">Tai liitä sisältö tekstinä</summary>'+
      '<textarea id="impText" rows="4" placeholder="Liitä varmuuskopion sisältö tähän" style="margin:8px 0"></textarea>'+
      '<button class="btn wide sm" data-imptext="1">Tuo liitetty data</button></details>'+
    '</div>'));
  wrap.appendChild(el(
    '<div class="card pad">'+
      '<div class="eyebrow">Vaarallinen alue</div>'+
      '<button class="btn wide ghost" data-wipe="1" style="margin-top:9px">Tyhjennä kaikki data</button>'+
    '</div>'));
  v.appendChild(wrap);
}

const OD_PARENT = "08 Tekoälykansio";
const OD_FOLDER = "01 Kuntosaliäppi";

async function doBackup(){
  const name = "kuntosali-" + new Date().toISOString().slice(0,10) + ".json";
  const json = JSON.stringify(Object.assign({}, S, {active:null}), null, 1);
  const blob = new Blob([json], {type:"application/json"});
  const mark = () => {
    S.meta.lastBackup = new Date().toISOString();
    S.meta.backupCount = S.sessions.length;
    save(); render();
  };
  /* Ensisijaisesti Androidin jakovalikko: yksi napautus OneDriveen. */
  try{
    const file = new File([blob], name, {type:"application/json"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title:"Rautakirja \u2013 varmuuskopio"});
      mark();
      toast("Varmuuskopio jaettu. Valitse OneDrive \u2192 " + OD_PARENT + " \u2192 " + OD_FOLDER + ".");
      return;
    }
  }catch(e){
    if(e && (e.name === "AbortError" || e.name === "NotAllowedError")) return;
    /* muut virheet: pudotaan lataukseen */
  }
  /* Varalla tavallinen lataus (työpöytäselaimet). */
  try{
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    mark();
    toast("Varmuuskopio ladattu. Siirr\u00e4 se OneDrive-kansioon.");
  }catch(e){
    toast("Varmuuskopiointi ei onnistunut t\u00e4ss\u00e4 selaimessa.");
  }
}

function applyImport(text){
  let d;
  try{ d = JSON.parse(text); }catch(e){ toast("Tiedosto ei ole kelvollinen varmuuskopio."); return; }
  if(!d || !Array.isArray(d.programs) || !Array.isArray(d.sessions)){ toast("Tiedostosta ei löydy treenidataa."); return; }
  S = Object.assign(seed(), d, {active:null});
  save(); render(); toast("Data tuotu: " + S.sessions.length + " treeniä.");
}

/* ============ SHEET (treenin yhteenveto / detaljit / editori) ============ */
function openSheet(){
  closeSheet();
  const s = route.sheet; if(!s) return;
  const bg = el('<div class="sheet-bg" id="sheetbg"><div class="sheet"><div class="sheet-bar"></div><div class="sheet-body stack"></div></div></div>');
  const bar = bg.querySelector(".sheet-bar"), body = bg.querySelector(".sheet-body");

  if(s.type==="summary" || s.type==="session"){
    const sess = S.sessions.find(x=>x.id===s.id);
    if(!sess){ return; }
    bar.innerHTML = '<h2>'+esc(sess.name)+'</h2><button class="btn sm ghost" data-close="1">'+I.x+'</button>';
    body.appendChild(el(
      '<div class="card pad">'+
        '<div class="eyebrow">'+dateFi(sess.date)+'</div>'+
        '<div class="grid3" style="margin-top:10px">'+
          '<div><div class="eyebrow">Kesto</div><div class="num" style="font-size:19px">'+(sess.finishedAt?dur(sess.finishedAt-sess.startedAt):"—")+'</div></div>'+
          '<div><div class="eyebrow">Sarjat</div><div class="num" style="font-size:19px">'+setsDone(sess)+'</div></div>'+
          '<div><div class="eyebrow">Volyymi</div><div class="num" style="font-size:19px">'+fmt(volume(sess))+' kg</div></div>'+
        '</div></div>'));
    const c = el('<div class="card"></div>');
    c.innerHTML = sess.ex.map(x =>
      '<div class="pad" style="border-top:1px solid var(--line)">'+
        '<div style="font-weight:600;margin-bottom:5px">'+esc(x.name)+'</div>'+
        x.sets.map((t,j)=>'<div class="kv"><span class="num" style="color:var(--faint)">'+(j+1)+'</span>'+
          '<span class="num">'+fmt(t.w)+' kg × '+t.r+'</span></div>').join("")+
      '</div>').join("");
    body.appendChild(c);
    body.appendChild(shareCard(sess));
    if(s.type==="summary"){
      body.appendChild(el('<button class="btn wide" data-backup="1">Varmuuskopioi OneDriveen</button>'));
      body.appendChild(el('<button class="btn wide primary" data-close="1">Valmis</button>'));
    }
    else body.appendChild(el('<button class="btn wide ghost" data-delsess="'+sess.id+'">Poista treeni</button>'));
  }

  if(s.type==="exercise"){
    const h = historyFor(s.name);
    bar.innerHTML = '<h2>'+esc(s.name)+'</h2><button class="btn sm ghost" data-close="1">'+I.x+'</button>';
    const rec = recordsFor(s.name);
    const card = (title, r, sub) =>
      '<div class="card pad">'+
        '<div class="eyebrow">'+title+'</div>'+
        (r ? '<div class="num" style="font-size:24px;margin-top:2px">'+fmt(r.w)+' kg</div>'+
             '<div style="font-size:12.5px;color:var(--dim)">'+sub(r)+'</div>'
           : '<div style="font-size:14px;color:var(--faint);margin-top:6px">Ei vielä</div>')+
      '</div>';
    body.appendChild(el('<div class="grid2">'+
      card('Sarjaennätys', rec.set, r => r.sets+' × '+r.reps+' · '+dateFi(r.date))+
      card('Maksimiennätys', rec.max, r => '1 toisto · '+dateFi(r.date))+
    '</div>'));
    const c = el('<div class="card"></div>');
    c.innerHTML = [...h].reverse().map(r =>
      '<div class="pad" style="border-top:1px solid var(--line);display:flex;gap:12px;align-items:baseline">'+
        '<div style="flex:none;width:74px;font-size:13px;color:var(--dim)">'+dateFi(r.date)+'</div>'+
        '<div class="num" style="flex:1">'+r.sets.map(t=>fmt(t.w)+"×"+t.r).join("   ")+'</div>'+
      '</div>').join("");
    body.appendChild(c);
  }

  if(s.type==="program"){
    const p = S.programs.find(x=>x.id===s.id);
    if(!p) return;
    bar.innerHTML = '<h2>Muokkaa ohjelmaa</h2><button class="btn sm ghost" data-close="1">'+I.x+'</button>';
    body.appendChild(el(
      '<div class="card pad stack">'+
        '<label class="f"><span class="eyebrow">Ohjelman nimi</span><input data-p="name" value="'+esc(p.name)+'"></label>'+
        '<label class="f"><span class="eyebrow">Arvioitu kesto</span><input data-p="est" value="'+esc(p.est||"")+'" placeholder="esim. 45–55 min"></label>'+
      '</div>'));
    p.ex.forEach((x,i) => {
      body.appendChild(el(
        '<div class="card pad stack" data-exi="'+i+'">'+
          '<div style="display:flex;align-items:center;gap:8px">'+
            '<span class="idx">'+(i+1)+'</span>'+
            '<button class="btn sm ghost" data-mv="'+i+'" data-dir="-1" '+(i===0?"disabled":"")+' aria-label="Siirrä ylös">↑</button>'+
            '<button class="btn sm ghost" data-mv="'+i+'" data-dir="1" '+(i===p.ex.length-1?"disabled":"")+' aria-label="Siirrä alas">↓</button>'+
            '<button class="btn sm ghost" data-delex="'+i+'" style="margin-left:auto">Poista</button>'+
          '</div>'+
          '<label class="f"><span class="eyebrow">Liike'+(MG[x.name]?" · "+esc(MG[x.name]):"")+'</span>'+
            '<div style="display:flex;gap:8px"><input data-x="name" value="'+esc(x.name)+'">'+
            '<button class="btn sm" data-swap="'+i+'" style="flex:none">Vaihda</button></div></label>'+
          '<div class="grid2">'+
            '<label class="f"><span class="eyebrow">Väline</span><select data-x="equip">'+
              EQUIPS.map(q=>'<option '+(q===x.equip?"selected":"")+'>'+q+'</option>').join("")+'</select></label>'+
            '<label class="f"><span class="eyebrow">Askel kg</span><input inputmode="decimal" data-x="step" value="'+fmt(x.step||STEPS[x.equip]||2.5)+'"></label>'+
          '</div>'+
          '<div class="grid2">'+
            '<label class="f"><span class="eyebrow">Sarjat</span><input inputmode="numeric" data-x="sets" value="'+x.sets+'"></label>'+
            '<label class="f"><span class="eyebrow">Aloituspaino kg'+(x.equip==="käsipaino"?" / käsi":"")+'</span><input inputmode="decimal" data-x="w" value="'+fmt(x.w)+'"></label>'+
          '</div>'+
          '<div class="grid2">'+
            '<label class="f"><span class="eyebrow">Toistot väh.</span><input inputmode="numeric" data-x="rmin" value="'+x.rmin+'"></label>'+
            '<label class="f"><span class="eyebrow">Toistot enint.</span><input inputmode="numeric" data-x="rmax" value="'+x.rmax+'"></label>'+
          '</div>'+
        '</div>'));
    });
    body.appendChild(el('<div class="grid2">'+
      '<button class="btn" data-addex="1">+ Liikepankista</button>'+
      '<button class="btn ghost" data-addcustom="1">+ Oma liike</button></div>'));
    body.appendChild(el('<button class="btn wide primary" data-savep="1">Tallenna ohjelma</button>'));
    body.appendChild(el('<button class="btn wide ghost" data-delp="1">Poista ohjelma</button>'));
  }

  if(s.type==="picker"){
    const ptitle = s.target === "workout" ? "Lisää liike treeniin"
                 : (s.exi === null ? "Lisää liike" : "Vaihda liike");
    bar.innerHTML = '<button class="btn sm ghost" data-pickback="1" aria-label="Takaisin">'+
      (s.target === "workout" ? I.x : I.back)+'</button><h2>'+ptitle+'</h2>';
    body.appendChild(el('<input id="pq" placeholder="Hae liikettä tai lihasryhmää" autocomplete="off" autocapitalize="off">'));
    body.appendChild(el('<div class="card" id="picklist"></div>'));
  }

  document.body.appendChild(bg);
  if(s.type==="picker") drawPicker("");
}

function drawPicker(q){
  const list = document.getElementById("picklist"); if(!list) return;
  const st = route.sheet;
  let have;
  if(st.target === "workout"){
    have = new Set((S.active ? S.active.ex : []).map(e => e.name));
  } else {
    const p = S.programs.find(x => x.id === st.back.id);
    have = new Set(p ? p.ex.map(e=>e.name) : []);
  }
  const needle = (q||"").toLowerCase().trim();
  let html = "", n = 0;
  LIB.forEach(g => {
    const items = g.items.filter(i =>
      !needle || i.n.toLowerCase().includes(needle) || g.g.toLowerCase().includes(needle));
    if(!items.length) return;
    html += '<div style="padding:12px 14px 5px;border-top:1px solid var(--line)"><div class="eyebrow">'+esc(g.g)+'</div></div>';
    items.forEach(i => {
      n++;
      html += '<button class="rowlink" style="border-top:0;padding-top:10px;padding-bottom:10px" data-pick="'+esc(i.n)+'">'+
        '<span style="flex:1;min-width:0;font-weight:600;line-height:1.25">'+esc(i.n)+'</span>'+
        (have.has(i.n) ? '<span class="pill good">Ohjelmassa</span>' : '<span class="pill">'+esc(i.e)+'</span>')+
        '</button>';
    });
  });
  list.innerHTML = n ? html : '<div class="empty">Ei osumia haulla.<br>Voit lisätä oman liikkeen edellisestä näkymästä.</div>';
}

function closeSheet(){ const b=document.getElementById("sheetbg"); if(b) b.remove(); }

/* ============ tapahtumat ============ */
document.addEventListener("click", async e => {
  const t = e.target.closest("button, [data-tab], label.btn");
  if(!t) return;
  const d = t.dataset;
  if(d.ans !== undefined) return;

  if(d.tab){ route.tab=d.tab; route.openEx=null; closeSheet(); route.sheet=null; render(); return; }
  if(d.go){ route.tab=d.go; render(); return; }
  if(d.close){ closeSheet(); route.sheet=null; render(); return; }
  if(d.start){ startWorkout(d.start); return; }
  if(d.hsub!==undefined && d.hsub){ route.hsub=d.hsub; render(); return; }

  if(d.sess){ route.sheet={type:"session", id:d.sess}; openSheet(); return; }
  if(d.exname){ route.sheet={type:"exercise", name:d.exname}; openSheet(); return; }
  if(d.editp){ route.sheet={type:"program", id:d.editp}; openSheet(); return; }
  if(d.newp){
    const p = {id:uid("p"), name:"Uusi ohjelma", est:"", ex:[]};
    S.programs.push(p); save(); route.sheet={type:"program", id:p.id}; render(); openSheet(); return;
  }
  if(d.delsess){
    if(!await ask("Poistetaanko tämä treeni pysyvästi?","Poista")) return;
    S.sessions = S.sessions.filter(x=>x.id!==d.delsess);
    save(); closeSheet(); route.sheet=null; render(); return;
  }

  /* --- treeninäkymä --- */
  if(d.open!==undefined && d.open!==""){ route.openEx = (route.openEx===+d.open) ? -1 : +d.open; render(); return; }
  if(d.chk){
    const row = t.closest(".setrow"), x = S.active.ex[+row.dataset.ex], s = x.sets[+row.dataset.set];
    row.querySelectorAll("input").forEach(inp => {
      const val = parseFloat(String(inp.value).replace(",","."));
      if(!isNaN(val)) s[inp.dataset.f] = val;
    });
    s.ok = !s.ok;
    if(s.ok){ try{ navigator.vibrate && navigator.vibrate(28); }catch(_){} }
    if(x.sets.every(q=>q.ok)) route.openEx = null;
    save(); render(); return;
  }
  if(d.addset!==undefined){ const x=S.active.ex[+d.addset]; const last=x.sets[x.sets.length-1]; x.sets.push({w:last?last.w:0, r:last?last.r:x.rmax, ok:false}); save(); render(); return; }
  if(d.delset!==undefined){ const x=S.active.ex[+d.delset]; for(let i=x.sets.length-1;i>=0;i--){ if(!x.sets[i].ok){ x.sets.splice(i,1); break; } } save(); render(); return; }
  if(d.skip!==undefined){ S.active.ex[+d.skip].skip=true; route.openEx=null; save(); render(); return; }
  if(d.unskip!==undefined){ S.active.ex[+d.unskip].skip=false; save(); render(); return; }
  if(d.finish){
    const left = S.active.ex.reduce((a,x)=> a + (x.skip?0:x.sets.filter(s=>!s.ok).length), 0);
    if(left && !await ask(left+" sarjaa on vielä kirjaamatta. Lopetetaanko treeni silti?","Lopeta")) return;
    finishWorkout(); return;
  }
  if(d.cancel){ if(await ask("Hylätäänkö treeni? Kirjatut sarjat katoavat.","Hylkää")){ S.active=null; save(); render(); releaseWake(); } return; }

  /* --- ohjelmaeditori --- */
  if(d.mv!==undefined){ const p=curProg(); const i=+d.mv, j=i+ +d.dir; if(j<0||j>=p.ex.length) return; readProgForm(p); [p.ex[i],p.ex[j]]=[p.ex[j],p.ex[i]]; save(); openSheet(); return; }
  if(d.delex!==undefined){ const p=curProg(); readProgForm(p); p.ex.splice(+d.delex,1); save(); openSheet(); return; }
  if(d.addcustom){ const p=curProg(); readProgForm(p); p.ex.push({id:uid("x"), name:"", equip:"tanko", step:2.5, sets:3, rmin:8, rmax:8, w:20}); save(); openSheet(); return; }
  if(d.addex){ const p=curProg(); readProgForm(p); save(); route.sheet={type:"picker", back:{type:"program", id:p.id}, exi:null}; openSheet(); return; }
  if(d.swap!==undefined){ const p=curProg(); readProgForm(p); save(); route.sheet={type:"picker", back:{type:"program", id:p.id}, exi:+d.swap}; openSheet(); return; }
  if(d.addwex){ route.sheet = {type:"picker", target:"workout", back:null}; openSheet(); return; }
  if(d.pickback){
    if(route.sheet && route.sheet.back){ route.sheet = route.sheet.back; openSheet(); }
    else { closeSheet(); route.sheet = null; render(); }
    return;
  }
  if(d.pick!==undefined){
    const st = route.sheet;
    const item = LIB.reduce((a,g)=> a || g.items.find(i=>i.n===d.pick), null);

    /* Liike kesken treenin: lisätään vain tähän treeniin, ei ohjelmaan. */
    if(st.target === "workout"){
      if(item && S.active){
        const step = STEPS[item.e] || 2.5;
        const sg = suggest({name:item.n, equip:item.e, step:step, rmax:8, w:0});
        S.active.ex.push({
          id: uid("x"), name: item.n, equip: item.e, step: step,
          rmin: 8, rmax: 8, target: 3, up: sg.up, skip: false,
          sets: Array.from({length:3}, () => ({w: sg.w, r: 8, ok: false}))
        });
        route.openEx = S.active.ex.length - 1;
        save();
      }
      closeSheet(); route.sheet = null; render();
      toast(item ? item.n + " lisätty treeniin." : "Liikettä ei löytynyt.");
      return;
    }

    const p = S.programs.find(x=>x.id===st.back.id);
    if(p && item){
      const step = STEPS[item.e] || 2.5;
      if(st.exi===null){ p.ex.push({id:uid("x"), name:item.n, equip:item.e, step:step, sets:3, rmin:8, rmax:8, w:20}); }
      else { const x = p.ex[st.exi]; if(x){ x.name=item.n; x.equip=item.e; x.step=step; } }
      save();
    }
    route.sheet = st.back; openSheet(); return;
  }
  if(d.savep){ const p=curProg(); readProgForm(p); save(); closeSheet(); route.sheet=null; render(); toast("Ohjelma tallennettu."); return; }
  if(d.delp){ if(!await ask("Poistetaanko ohjelma? Treenihistoria säilyy.","Poista")) return; S.programs=S.programs.filter(x=>x.id!==route.sheet.id); save(); closeSheet(); route.sheet=null; render(); return; }

  /* --- data --- */
  if(d.copy){
    const card = t.closest(".card");
    const text = (card && card._text) || "";
    if(text) copyText(text, t);
    return;
  }
  if(d.dconnect){ driveConnect(); return; }
  if(d.dsync){ driveSync(false); return; }
  if(d.drestore){ driveRestore(); return; }
  if(d.ddisconnect){ driveDisconnect(); return; }
  if(d.backup){ doBackup(); return; }
  if(d.install){
    const p = installPrompt; installPrompt = null; render();
    if(p) try{ p.prompt(); }catch(_){}
    return;
  }
  if(d.imptext){
    const ta=document.getElementById("impText"); if(!ta || !ta.value.trim()) return;
    if(!await ask("Tuonti korvaa kaiken nykyisen datan. Jatketaanko?","Tuo")) return;
    applyImport(ta.value); return;
  }
  if(d.wipe){
    if(!await ask("Tyhjennetäänkö KAIKKI treenidata? Tätä ei voi perua — tee varmuuskopio ensin.","Tyhjennä")) return;
    S = seed(); save(); render(); toast("Data tyhjennetty.");
  }
});

/* steppers: päivitä suoraan kenttään ilman uudelleenpiirtoa */
document.addEventListener("click", e => {
  const b = e.target.closest(".step"); if(!b) return;
  const row = b.closest(".setrow"); if(!row) return;
  const f = b.dataset.f, dir = +b.dataset.d;
  const x = S.active.ex[+row.dataset.ex], s = x.sets[+row.dataset.set];
  const inp = row.querySelector('input[data-f="'+f+'"]');
  let val = parseFloat(String(inp.value).replace(",",".")); if(isNaN(val)) val = 0;
  val = f==="w" ? nextWeight(x, val, dir) : Math.max(0, val + dir);
  s[f] = val; inp.value = f==="w" ? fmt(val) : val;
  save();
});

/* liikepankin haku */
document.addEventListener("input", e => { if(e.target.id==="pq") drawPicker(e.target.value); });

/* kenttien muokkaus */
document.addEventListener("change", async e => {
  const inp = e.target;
  if(inp.id==="imp" && inp.files && inp.files[0]){
    const f = inp.files[0]; inp.value = "";
    if(!await ask('Tuodaanko "'+f.name+'"? Se korvaa kaiken nykyisen datan.',"Tuo")) return;
    const fr = new FileReader(); fr.onload = () => applyImport(fr.result); fr.readAsText(f); return;
  }
  const row = inp.closest && inp.closest(".setrow");
  if(row && inp.dataset.f){
    const x = S.active.ex[+row.dataset.ex], s = x.sets[+row.dataset.set];
    let val = parseFloat(String(inp.value).replace(",",".")); if(isNaN(val)) val = 0;
    s[inp.dataset.f] = Math.max(0,val); inp.value = inp.dataset.f==="w" ? fmt(s.w) : s.r;
    save();
  }
});

function curProg(){ return S.programs.find(x=>x.id===route.sheet.id); }
function readProgForm(p){
  const root = document.getElementById("sheetbg"); if(!root) return;
  root.querySelectorAll("[data-p]").forEach(i => { p[i.dataset.p] = i.value; });
  root.querySelectorAll("[data-exi]").forEach(box => {
    const x = p.ex[+box.dataset.exi]; if(!x) return;
    box.querySelectorAll("[data-x]").forEach(i => {
      const k = i.dataset.x;
      if(k==="name" || k==="equip") x[k] = i.value;
      else { let v = parseFloat(String(i.value).replace(",",".")); x[k] = isNaN(v)?0:v; }
    });
    if(!x.step) x.step = STEPS[x.equip] || 2.5;
    x.sets = Math.max(1, Math.round(x.sets));
    x.rmin = Math.max(1, Math.round(x.rmin)); x.rmax = Math.max(x.rmin, Math.round(x.rmax));
  });
}

/* näyttö päälle treenin ajaksi */
let wl = null;
async function wakeLock(){
  try{ if("wakeLock" in navigator) wl = await navigator.wakeLock.request("screen"); }catch(_){}
}
function releaseWake(){ try{ wl && wl.release(); }catch(_){} wl=null; }
document.addEventListener("visibilitychange", () => { if(document.visibilityState==="visible" && S.active && !wl) wakeLock(); });

if(S.active) wakeLock();
render();

/* Palvelutyöntekijä: appi latautuu myös ilman verkkoa. */
if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

/* Asennuskehote aloitusnäytölle */
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); installPrompt = e;
  if(route.tab === "treeni") render();
});
window.addEventListener("appinstalled", () => { installPrompt = null; render(); });
