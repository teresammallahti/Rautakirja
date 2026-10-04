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
  cog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.6 1.6 0 0 0 15 19.4a1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.09A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.09A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 .97-1.47V3a2 2 0 1 1 4 0v.09A1.6 1.6 0 0 0 15 4.6a1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9v0a1.6 1.6 0 0 0 1.47.97H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.47.97z"/></svg>',
  x:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ============ data ============ */
const KEY = "rautakirja.v1";
const STEPS = {tanko:2.5, "käsipaino":2, talja:2.5, laite:5, kehonpaino:1, smith:2.5, "lämmittely":0};
const EQUIPS = ["tanko","käsipaino","talja","laite","smith","kehonpaino","lämmittely"];

/* Aikapohjaiset liikkeet (unit "s"): toistojen paikalla sekunnit.
   Lämmittelyt (warm): kesto minuutteina + muokattava muistilista;
   eivät kuulu volyymiin, ennätyksiin eivätkä indekseihin. */
const isTime = x => !!x && x.unit === "s";
const isWarm = x => !!x && !!x.warm;
const repInc = x => isTime(x) ? 5 : 1;
const TIME_R = {rmin:30, rmax:45, autoRmin:30, autoRmax:60};

/* Liikepankki — lähde: Liikepankki.md projektikansiossa */
const LIB = [
  /* Lämmittely: RAMP-malli (nosta sykettä → aktivoi ja liikkuvuus → nousevat sarjat).
     Lähteet: Jeffreys 2007; O'Hanlon Performance; MacroFactor; IronMan (keppiliikkeet). */
  {g:"Alkulämmittely", items:[
    {n:"Kuntopyörä",e:"lämmittely",warm:1,min:8,list:["Satula: polvi jää alakäännössä hieman koukkuun","Kevyt vastus alkuun, nosta vähitellen","Tahti: hengästyttää, mutta pystyt puhumaan","Viimeinen minuutti reippaammin"]},
    {n:"Juoksumatto",e:"lämmittely",warm:1,min:8,list:["1–2 min kävellen","Nosta vauhtia tai kulmaa (5–10 %) vähitellen","Reipas ylämäkikävely tai kevyt hölkkä","Älä roiku kaiteissa"]},
    {n:"Soutulaite",e:"lämmittely",warm:1,min:6,list:["Vastus (damper) 3–5","Veto: jalat → vartalo → kädet, palautus päinvastoin","Selkä suorana, älä pyöristä","Tahti noin 20–24 vetoa minuutissa"]},
    {n:"Crosstrainer",e:"lämmittely",warm:1,min:8,list:[]},
    {n:"Porraskone",e:"lämmittely",warm:1,min:6,list:[]},
    {n:"Hyppynaru",e:"lämmittely",warm:1,min:3,list:[]},
    {n:"Dynaaminen kehonpainolämmittely",e:"lämmittely",warm:1,min:5,list:["Käsien pyöritys 10 eteen + 10 taakse","Jalan heilautus eteen–taakse ja sivuttain, 10 + 10 / jalka","Kehonpainokyykky 10","Askelkyykky + ylävartalon kierto 5 / puoli","World's greatest stretch 3 / puoli","Lantionnosto 10","Lapatukipunnerrus 10"]},
    {n:"Keppijumppa",e:"lämmittely",warm:1,min:5,list:["Läpivienti 10: suorat kädet, leveä ote, kavenna vähitellen","Hyvää huomenta 10: keppi niskan päällä, taivutus lantiosta","Yläkyykky kepillä 8","Vartalon kierto keppi hartioilla 10 / puoli","Sivutaivutus keppi ylhäällä 5 / puoli"]},
    {n:"Kuminauhalämmittely olkapäille",e:"lämmittely",warm:1,min:4,list:["Kuminauhan erotus (pull-apart) 15","Face pull kuminauhalla 15","Ulkokierto kuminauhalla 10 / puoli","Lapatukipunnerrus 10"]},
    {n:"Nousevat lämmittelysarjat",e:"lämmittely",warm:1,min:5,list:["Ensimmäiseen isoon liikkeeseen","Tyhjä tanko × 10","Noin 40 % työpainosta × 5","Noin 60 % × 5","Noin 80 % × 3","Ei uuvuteta — lyhyt tauko ja työsarjoihin"]}
  ]},
  {g:"Rinta", items:[{n:"Penkkipunnerrus tangolla",e:"tanko",sf:"penkki"}, {n:"Vinopenkkipunnerrus tangolla",e:"tanko",sf:"penkki"}, {n:"Penkkipunnerrus käsipainoilla",e:"käsipaino",sf:"kp"}, {n:"Vinopenkkipunnerrus käsipainoilla",e:"käsipaino",sf:"kp"}, {n:"Vipunosto penkillä käsipainoilla",e:"käsipaino"}, {n:"Ristikkäistalja ylhäältä",e:"talja"}, {n:"Ristikkäistalja keskeltä",e:"talja"}, {n:"Ristikkäistalja alhaalta",e:"talja"}, {n:"Punnerrus",e:"kehonpaino"}, {n:"Alaviistopenkkipunnerrus tangolla",e:"tanko",sf:"penkki"}, {n:"Rintaprässi laitteessa",e:"laite"}, {n:"Perhoslaite (pec deck)",e:"laite"}, {n:"Dippi rinnalle, eteen nojaten",e:"kehonpaino"}, {n:"Penkkipunnerrus Smith-laitteessa",e:"smith",sf:"smith"}, {n:"Vinopenkkipunnerrus Smith-laitteessa",e:"smith",sf:"smith"}, {n:"Alaviistopenkkipunnerrus Smith-laitteessa",e:"smith",sf:"smith"}]},
  {g:"Selkä — leveys (vetoliikkeet ylhäältä)", items:[{n:"Ylätalja myötäotteella",e:"talja"}, {n:"Pullover taljassa suoralla kahvalla",e:"talja"}, {n:"Ylätalja vastaotteella",e:"talja"}, {n:"Ylätalja kapealla kolmiokahvalla",e:"talja"}, {n:"Ylätalja yhdellä kädellä",e:"talja"}, {n:"Leuanveto myötäotteella",e:"kehonpaino"}, {n:"Leuanveto vastaotteella",e:"kehonpaino"}, {n:"Vetoliike laitteessa",e:"laite"}, {n:"Avustettu leuanveto laitteessa",e:"laite"}, {n:"Suorin käsin alasveto taljassa",e:"talja"}]},
  {g:"Selkä — paksuus (soutuliikkeet)", items:[{n:"Kulmasoutu tangolla",e:"tanko"}, {n:"Käsipainosoutu yhdellä kädellä",e:"käsipaino"}, {n:"Alatalja soutu, kolmiokahva",e:"talja"}, {n:"Alatalja soutu, leveä kahva",e:"talja"}, {n:"T-tankosoutu",e:"tanko"}, {n:"Soutu laitteessa rintatuella",e:"laite"}, {n:"Ylävartalon ojennus / selänojennus",e:"kehonpaino"}, {n:"Pendlay-soutu",e:"tanko"}, {n:"Rintatukisoutu käsipainoilla vinopenkillä",e:"käsipaino"}, {n:"Alatalja soutu yhdellä kädellä",e:"talja"}, {n:"Kehonpainosoutu tangon alla",e:"kehonpaino"}, {n:"Kulmasoutu Smith-laitteessa",e:"smith"}, {n:"Kehonpainosoutu Smith-tangon alla",e:"kehonpaino"}]},
  {g:"Hartiat", items:[{n:"Pystypunnerrus tangolla",e:"tanko",sf:"pysty"}, {n:"Pystypunnerrus käsipainoilla",e:"käsipaino"}, {n:"Olkapääpunnerrus laitteessa",e:"laite"}, {n:"Sivuvipunosto käsipainoilla",e:"käsipaino"}, {n:"Sivuvipunosto taljassa yhdellä kädellä",e:"talja"}, {n:"Takaolkapään vipunosto kumarassa",e:"käsipaino"}, {n:"Face pull taljassa",e:"talja"}, {n:"Etuvipunosto",e:"käsipaino"}, {n:"Arnold-punnerrus",e:"käsipaino"}, {n:"Sivuvipunosto laitteessa",e:"laite"}, {n:"Takaolkapää laitteessa (reverse pec deck)",e:"laite"}, {n:"Pystysoutu taljassa",e:"talja"}, {n:"Olankohautus käsipainoilla",e:"käsipaino"}, {n:"Olankohautus tangolla",e:"tanko"}, {n:"Pystypunnerrus Smith-laitteessa",e:"smith",sf:"smith"}, {n:"Pystysoutu Smith-laitteessa",e:"smith"}, {n:"Olankohautus Smith-laitteessa",e:"smith"}]},
  {g:"Hauis", items:[{n:"Hauiskääntö vinotangolla",e:"tanko"}, {n:"Bayesian curl",e:"talja"}, {n:"Hauiskääntö käsipainoilla",e:"käsipaino"}, {n:"Hauiskääntö vuorotellen kiertäen",e:"käsipaino"}, {n:"Vasarakääntö",e:"käsipaino"}, {n:"Hauiskääntö vinopenkissä",e:"käsipaino"}, {n:"Hauiskääntö taljassa suoralla kahvalla",e:"talja"}, {n:"Scott-penkki tangolla (preacher curl)",e:"tanko"}, {n:"Hauiskääntö laitteessa",e:"laite"}, {n:"Keskittynyt hauiskääntö",e:"käsipaino"}]},
  {g:"Ojentaja", items:[{n:"Ojentaja niskan takaa taljassa, suora kahva",e:"talja"}, {n:"Ojentajapunnerrus taljassa köydellä",e:"talja"}, {n:"Ojentajapunnerrus taljassa suoralla kahvalla",e:"talja"}, {n:"Ranskalainen punnerrus tangolla",e:"tanko",sf:"ranska"}, {n:"Ranskalainen punnerrus käsipainoilla",e:"käsipaino"}, {n:"Kapea penkkipunnerrus",e:"tanko",sf:"penkki"}, {n:"Dippi ojentajalle, pysty vartalo",e:"kehonpaino"}, {n:"Ojentajapunnerrus taljassa yhdellä kädellä",e:"talja"}, {n:"Ojentajan ojennus käsipainolla kumarassa (kickback)",e:"käsipaino"}, {n:"Dippilaite",e:"laite"}, {n:"Kapea penkkipunnerrus Smith-laitteessa",e:"smith",sf:"smith"}]},
  {g:"Etureisi", items:[{n:"Polven ojennus",e:"laite"}, {n:"Askelkyykkykävely",e:"käsipaino"}, {n:"Jalkaprässi",e:"laite",sf:"laite"}, {n:"Bulgarialainen askelkyykky",e:"käsipaino"}, {n:"Askelkyykky paikallaan",e:"käsipaino"}, {n:"Astuminen korokkeelle",e:"käsipaino"}, {n:"Goblet-kyykky",e:"käsipaino"}, {n:"Takakyykky",e:"tanko",sf:"kyykky"}, {n:"Etukyykky",e:"tanko",sf:"etukyykky"}, {n:"Kyykky turvatangolla (safety squat bar)",e:"tanko",sf:"kyykky"}, {n:"Hack-kyykky laitteessa",e:"laite",sf:"laite"}, {n:"Smith-kyykky",e:"smith",sf:"smith"}, {n:"Bulgarialainen askelkyykky Smith-laitteessa",e:"smith",sf:"smith"}, {n:"Askelkyykky Smith-laitteessa",e:"smith",sf:"smith"}, {n:"Etukyykky Smith-laitteessa",e:"smith",sf:"smith"}, {n:"Pendulum-kyykky laitteessa",e:"laite",sf:"laite"}]},
  {g:"Takareisi ja pakarat", items:[{n:"Romanialainen maastaveto",e:"tanko",sf:"veto"}, {n:"Polven koukistus maaten",e:"laite"}, {n:"Polven koukistus istuen",e:"laite"}, {n:"Maastaveto",e:"tanko",sf:"veto"}, {n:"Romanialainen maastaveto käsipainoilla",e:"käsipaino"}, {n:"Lantionnosto tangolla (hip thrust)",e:"tanko",sf:"thrust"}, {n:"Selänojennus / hyperextensio",e:"kehonpaino"}, {n:"Pakaran ojennus taljassa",e:"talja"}, {n:"Lonkan loitonnus laitteessa",e:"laite"}, {n:"Sumomaastaveto",e:"tanko",sf:"veto"}, {n:"Trap bar -maastaveto",e:"tanko",sf:"veto"}, {n:"Hyvää huomenta tangolla",e:"tanko",sf:"huomenta"}, {n:"Nordic-takareisi",e:"kehonpaino"}, {n:"Kahvakuulaheilautus",e:"käsipaino"}, {n:"Lantionnosto laitteessa",e:"laite"}, {n:"Lonkan lähennys laitteessa",e:"laite"}, {n:"Romanialainen maastaveto Smith-laitteessa",e:"smith"}, {n:"Lantionnosto Smith-laitteessa",e:"smith",sf:"thrust"}, {n:"Hyvää huomenta Smith-laitteessa",e:"smith",sf:"smith"}]},
  {g:"Pohkeet", items:[{n:"Pohjenousu seisten korokkeelta",e:"käsipaino"}, {n:"Pohjenousu laitteessa seisten",e:"laite"}, {n:"Pohjenousu istuen",e:"laite"}, {n:"Pohjenousu jalkaprässissä",e:"laite"}, {n:"Säären nosto (tibialis)",e:"kehonpaino"}, {n:"Pohjenousu Smith-laitteessa",e:"smith"}, {n:"Pohjenousu istuen Smith-laitteessa",e:"smith"}]},
  {g:"Keskivartalo", items:[{n:"Vatsarutistus taljassa polvillaan",e:"talja"}, {n:"Riipuntapolvennosto",e:"kehonpaino"}, {n:"Riipuntajalannosto suorin jaloin",e:"kehonpaino"}, {n:"Lankku",e:"kehonpaino",u:"s"}, {n:"Sivulankku",e:"kehonpaino",u:"s"}, {n:"Ab wheel -rullaus",e:"kehonpaino"}, {n:"Pallof press taljassa",e:"talja"}, {n:"Vatsaliike laitteessa",e:"laite"}, {n:"Farmarikävely",e:"käsipaino"}, {n:"Dead bug",e:"kehonpaino"}, {n:"Sivutaivutus käsipainolla",e:"käsipaino"}, {n:"Puunhakkuu taljassa (woodchop)",e:"talja"}, {n:"Vatsarutistus maaten",e:"kehonpaino"}]},
  {g:"Kyynärvarret ja ote", items:[{n:"Ranteen koukistus tangolla",e:"tanko"}, {n:"Ranteen ojennus tangolla",e:"tanko"}, {n:"Tangosta riippuminen",e:"kehonpaino",u:"s",st:2.5}, {n:"Ranteen koukistus käsipainoilla",e:"käsipaino"}, {n:"Levypito sormin",e:"kehonpaino",u:"s",st:2.5}]},
];
const MG = {};
LIB.forEach(g => g.items.forEach(i => { MG[i.n] = g.g; }));

/* Turvahuomiot riskialttiisiin liikkeisiin. Näkyvät treenissä liikkeen
   kohdalla ja korostettuna, kun tiedossa on maksimisarja.
   Lähteet: Barbell Logic (barbell safety guide), Strength Ambassadors
   (how to fail a squat safely). */
const SAFETY = {
  kyykky:    "Raskaat sarjat ja maksimit vain telineessä: turvaraudat hieman alimman kohdan alapuolelle. Jos toisto ei nouse, laske tanko raudoille — älä heitä sitä selästä.",
  etukyykky: "Turvaraudat hieman alimman kohdan alapuolelle. Epäonnistuessa irrota ote ja astu taakse, jolloin tanko putoaa eteen raudoille.",
  penkki:    "Raskaat sarjat telineessä turvaraudat juuri rinnan alapuolella tai avustajan kanssa. Peukalo aina tangon ympäri. Yksin ilman raudoja: ei lukkoja, jotta levyt voi kallistaa pois.",
  kp:        "Raskailla käsipainoilla avustaja tai laske painot hallitusti sivuille. Peukalo kahvan ympäri.",
  pysty:     "Pystypunnerrusta ei voi avustaa: raskaat sarjat telineessä turvaraudat noin olkapäiden korkeudella, ettei tanko osu päähän.",
  ranska:    "Tanko kulkee kasvojen yläpuolella: raskaat sarjat avustajan kanssa, peukalo tangon ympäri.",
  veto:      "Avustajaa ei tarvita — turva on tekniikka. Lopeta sarja heti, jos selkä alkaa pyöristyä.",
  huomenta:  "Pidä kuorma maltillisena, ei maksimeja. Telineessä turvaraudat hieman alimman kohdan alapuolelle.",
  thrust:    "Pehmuste tangon ja lantion väliin. Tanko vierii helposti: aloita kevyesti ja pidä ote koko sarjan ajan.",
  laite:     "Tarkista turvasalvat ennen sarjaa. Älä lukitse polvia suoriksi yläasennossa.",
  smith:     "Säädä Smith-laitteen turvastopparit hieman alimman kohdan alapuolelle ja varmista lukituskierto ennen raskaita sarjoja."
};
const SAFE = {};
LIB.forEach(g => g.items.forEach(i => { if(i.sf) SAFE[i.n] = SAFETY[i.sf]; }));

/* Turvahuomio treeninäkymään. Maksimisarja (MAX tai yhden toiston sarjat) korostaa sen. */
function safetyHint(x){
  const t = SAFE[x.name]; if(!t) return "";
  const maxDay = x.amrap || x.sets.some(s => s.a) || x.sets.every(s => (s.r || 0) === 1);
  return '<div class="hint safe'+(maxDay?' hot':'')+'"><span class="sflag">'+(maxDay?'Ennen maksimia':'Turvallisuus')+'</span>'+
         '<span>'+esc(t)+'</span></div>';
}


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

/* Ohjelman liike liikepankin rivistä. base = sarjat/toistot/paino oletuksiksi. */
function defFromLib(item, base){
  base = base || {sets:3, rmin:8, rmax:8, w:20};
  if(item.warm) return {id:uid("x"), name:item.n, equip:"lämmittely", warm:true, min:item.min || 5,
                        list:(item.list || []).slice(), sets:1, rmin:1, rmax:1, w:0, step:0};
  const d = {id:uid("x"), name:item.n, equip:item.e, step:item.st || STEPS[item.e] || 2.5,
             sets:base.sets, rmin:base.rmin, rmax:base.rmax, w:item.e === "kehonpaino" ? 0 : base.w};
  if(item.u === "s") Object.assign(d, {unit:"s"}, TIME_R);
  return d;
}

/* Yhden sarjan teksti: "87,5 kg × 8", "2,5 kg × 40 s", "40 s", "8 min". */
function fmtSet(x, t){
  if(isWarm(x)) return fmt(t.r || 0) + " min";
  if(isTime(x)) return (t.w ? fmt(t.w) + " kg × " : "") + fmt(t.r || 0) + " s";
  return fmt(t.w || 0) + " kg × " + fmt(t.r || 0);
}
const repUnit = x => isTime(x) ? " s" : "";

/* Harjoitusmallin asetukset. Staattinen = nykyinen käytös, käyttäjä
   säätää haarukat itse. Automaattinen = kaksoisprogressio, kahden kerran
   sääntö, sarjamäärän kasvatus ja deload-ehdotus. */
function defaultSettings(){
  return {
    mode: "staattinen",     /* "staattinen" | "automaattinen" */
    rmin: 8, rmax: 8,       /* staattisen tilan oletushaarukka */
    sets: 3,
    autoRmin: 6, autoRmax: 10,
    twoSession: true,       /* paino nousee vasta toisesta peräkkäisestä onnistumisesta */
    addSets: true,          /* sarjamäärä 3 -> 4 ajan myötä */
    maxSets: 4,
    amrap: true,            /* viimeinen sarja maksimiin (tekniseen asti) */
    deloadWeeks: 6,         /* 0 = ei kevennysviikkoja */
    cycleStart: null,       /* jakson alku; asetetaan kun automaattitila otetaan käyttöön */
    skipDeload: null        /* ohitetun kevennysviikon jakson numero */
  };
}

function seedPrograms(){
  return [
    {id:"p_jalka", name:"Jalkapäivä", est:"45–55 min", ex:[
      {id:uid("x"), name:"Romanialainen maastaveto", equip:"tanko", step:2.5, sets:3, rmin:8, rmax:8, w:140, noAmrap:true},
      {id:uid("x"), name:"Polven ojennus", equip:"laite", step:5, sets:3, rmin:8, rmax:8, w:100},
      {id:uid("x"), name:"Polven koukistus maaten", equip:"laite", step:5, sets:3, rmin:8, rmax:8, w:50},
      {id:uid("x"), name:"Pohjenousu seisten korokkeelta", equip:"käsipaino", step:1, sets:3, rmin:20, rmax:20, w:0, autoRmin:20, autoRmax:24},
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
    v:8,
    programs: seedPrograms(),
    sessions:[],
    active:null,
    meta:{lastBackup:null, backupCount:0},
    settings: defaultSettings()
  };
}

let S;
try{ const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : seed(); }
catch(e){ S = seed(); }
if(!S || !S.programs) S = seed();
if(!S.settings) S.settings = defaultSettings();

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

/* v5 → v6: harjoitusmallin asetukset. */
if(S.v < 6){
  S.settings = Object.assign(defaultSettings(), S.settings || {});
  S.v = 6; save();
}

/* v6 → v7: automaattitilan liikekohtaiset poikkeukset.
   - Pohjenousu: oma haarukka 20–24. Lähde: Teren alkuperäinen ohjelma
     (kuvakaappaus 2026-08-30: "Pohjenousu seisten korokkeelta 3 × 20–24").
     Yleinen 6–10 ei sovi pohkeille.
   - Maastavedot: ei AMRAP-sarjaa. Tekninen uupumus selkä pyöristyen
     140 kilolla on huono idea; AMRAP-ohjeistuksessa selän pyöristyminen
     maastavedossa on nimenomaan pysähtymisen merkki. */
if(S.v < 7){
  S.programs.forEach(p => p.ex.forEach(x => {
    if(/^pohjenousu/i.test(String(x.name).trim()) && !x.autoRmin){ x.autoRmin = 20; x.autoRmax = 24; }
    if(/maastaveto/i.test(String(x.name)) && x.noAmrap === undefined) x.noAmrap = true;
  }));
  if(S.settings.cycleStart === undefined) S.settings.cycleStart = null;
  if(S.settings.skipDeload === undefined) S.settings.skipDeload = null;
  S.v = 7; save();
}

/* v7 → v8: pitoliikkeet sekunteina. Tangosta riippuminen 2,5 kg askelin
   (lisäpaino vyöllä). Historiaan ei kosketa. */
if(S.v < 8){
  S.programs.forEach(p => p.ex.forEach(x => {
    const n = String(x.name).trim();
    if(/^(tangosta riippuminen|lankku|sivulankku)$/i.test(n) && !x.unit){
      Object.assign(x, {unit:"s"}, TIME_R);
      if(/riippuminen/i.test(n)) x.step = 2.5;
    }
  }));
  S.v = 8; save();
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
  let v=0; sess.ex.forEach(x => { if(isWarm(x) || isTime(x)) return;
    x.sets.forEach(s => { if(s.ok) v += (s.w||0)*(s.r||0); }); }); return v;
}
function setsDone(sess){
  let n=0; sess.ex.forEach(x => { if(isWarm(x)) return; x.sets.forEach(s => { if(s.ok) n++; }); }); return n;
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
      /* Pito- ja lämmittelyliikkeissä "paras" = pisin aika, koska e1RM ei sovi niihin. */
      const val = t => (isTime(x) || isWarm(x)) ? (t.r||0) : e1rm(t.w,t.r);
      const top = ok.reduce((a,b)=> val(b)>val(a)?b:a, ok[0]);
      out.push({date:s.date, sets:ok, top, e1:val(top), x:x});
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
  return {w: allMax ? nextWeight(exDef, lastW, 1) : lastW, up: allMax, last:L};
}

/* ============ automaattinen harjoitusmalli ============

   Perustuu tutkimukseen joka on kirjattu projektin muistiin:
   - KAKSOISPROGRESSIO: toistot nousevat haarukan sisällä, paino nousee kun
     kaikki sarjat yltävät ylärajaan, ja toistot palaavat alarajalle.
   - KAHDEN KERRAN SÄÄNTÖ (ACSM): paino nousee vasta toisesta peräkkäisestä
     onnistumisesta samalla painolla.
   - AMRAP: viimeinen sarja tekniseen uupumukseen. Jos se menee vähintään
     kolme toistoa yli ylärajan, paino nousee heti — tämä on AMRAP-datan
     varsinainen hyöty.
   - JAKSO: kevennysviikko jakson lopussa (sarjat puoleen, paino ennallaan,
     ei taukoa — täysi tauko heikensi voimakehitystä). Sarjamäärä nousee
     jakson jälkipuoliskolla.
   - TURVAVENTTIILI: kaksi peräkkäistä kertaa alle haarukan samalla painolla
     → paino kevenee askeleen.
   Päätökset lasketaan treenihistoriasta eikä erillisestä tilasta, joten ne
   eivät voi ajautua ristiriitaan todellisuuden kanssa. */

const isAuto = () => S.settings && S.settings.mode === "automaattinen";

function cycleInfo(){
  const st = S.settings;
  if(!isAuto() || !st.cycleStart) return null;
  const L = st.deloadWeeks || 0;
  const weeks = Math.max(0, Math.floor((Date.now() - new Date(st.cycleStart).getTime()) / (7 * 864e5)));
  if(!L) return {week: weeks + 1, len: 0, idx: 0, deload: false, ramp: false, skipped: false};
  const idx = Math.floor(weeks / L);
  const wk = (weeks % L) + 1;
  const isDeloadWeek = wk === L;
  const skipped = isDeloadWeek && st.skipDeload === idx;
  return {
    week: wk, len: L, idx: idx,
    deload: isDeloadWeek && !skipped,
    skipped: skipped,
    ramp: !!st.addSets && wk > Math.floor(L / 2) && wk < L
  };
}

function autoRange(x){
  const st = S.settings;
  const a = x.autoRmin || st.autoRmin, b = x.autoRmax || st.autoRmax;
  return [Math.min(a, b), Math.max(a, b)];
}

/* Liikkeen suoritukset uusimmasta vanhimpaan, kevennysviikot pois lukien —
   kevennys ei ole onnistuminen eikä epäonnistuminen. */
function exHistory(name, exceptId){
  const out = [];
  for(let i = S.sessions.length - 1; i >= 0; i--){
    const s = S.sessions[i];
    if(s.deload || (exceptId && s.id === exceptId)) continue;
    const x = s.ex.find(e => e.name === name && e.sets.length);
    if(x) out.push(x);
  }
  return out;
}
const workW  = x => x.sets.reduce((a, t) => Math.min(a, t.w || 0), Infinity);
const qualifies = x => x.sets.length >= (x.target || x.sets.length) && x.sets.every(t => (t.r || 0) >= (x.rmax || 0));
const underRange = x => x.sets.some(t => (t.r || 0) < (x.rmin || 0));

function autoPlan(def){
  const st = S.settings;
  const [rmin, rmax] = autoRange(def);
  const cyc = cycleInfo();
  const base = def.sets || st.sets || 3;
  let sets = cyc && cyc.ramp ? Math.min(Math.max(st.maxSets || base, base), base + 1) : base;
  const h = exHistory(def.name);
  let w, reps, reason, up = false, down = false;
  const fill = (n, v) => Array.from({length: n}, () => v);

  if(!h.length){
    w = def.w || 0;
    reps = fill(sets, rmin);
    reason = "Ensimmäinen kerta: aloita haarukan alarajalta.";
  } else {
    const last = h[0], wl = workW(last);
    const prev = h[1] && workW(h[1]) === wl ? h[1] : null;
    const q0 = qualifies(last), q1 = !!(prev && qualifies(prev));
    const ls = last.sets[last.sets.length - 1];
    const amrapBig = q0 && ls && ls.a && (ls.r || 0) >= (last.rmax || rmax) + (isTime(def) ? 15 : 3);

    if(q0 && (!st.twoSession || q1 || amrapBig)){
      w = nextWeight(def, wl, 1); reps = fill(sets, rmin); up = true;
      reason = (amrapBig && st.twoSession && !q1)
        ? "Viimeinen sarja meni reilusti yli: paino nousee heti."
        : "Yläraja saavutettu" + (st.twoSession ? " kahdesti peräkkäin" : "") + ": paino nousee.";
    } else if(underRange(last) && prev && underRange(prev)){
      w = nextWeight(def, wl, -1); down = true;
      /* Jos tällä painolla on jo tehty, jatketaan siitä mihin jäätiin eikä
         alarajalta — muuten iso askel (käsipaino 12,5 → 15) jättäisi
         kiertämään samaa kehää. */
      const known = h.find(x => workW(x) === w && !underRange(x));
      reps = known
        ? Array.from({length: sets}, (_, i) => Math.max(rmin, Math.min(rmax, known.sets[i] ? (known.sets[i].r || rmin) : rmin)))
        : fill(sets, rmin);
      reason = known ? "Kahdesti alle haarukan: takaisin edelliseen painoon, jatka siitä mihin jäit."
                     : "Kahdesti alle haarukan: paino kevenee askeleen.";
    } else {
      w = wl;
      reps = Array.from({length: sets}, (_, i) => {
        const t = last.sets[i] ? (last.sets[i].r || 0) + repInc(def) : rmin;
        return Math.max(rmin, Math.min(rmax, t));
      });
      reason = q0 ? "Yläraja saavutettu kerran — vielä kerran samalla painolla."
                  : isTime(def) ? "Sama paino, tavoite 5 sekuntia pidempään per sarja."
                  : "Sama paino, tavoite yksi toisto enemmän per sarja.";
    }
  }

  let deload = false;
  if(cyc && cyc.deload){
    deload = true;
    w = h.length ? workW(h[0]) : (def.w || 0);
    sets = Math.max(1, Math.ceil(base / 2));
    reps = fill(sets, rmin);
    up = false; down = false;
    reason = "Kevennysviikko: sarjat puoleen, paino ennallaan.";
  }

  return {
    w: w, rmin: rmin, rmax: rmax, sets: sets, reps: reps,
    up: up, down: down, reason: reason, deload: deload,
    amrap: !!st.amrap && !def.noAmrap && !deload
  };
}

/* Treenin liike-entry automaattisuunnitelmasta. */
function autoEntry(def){
  const pl = autoPlan(def);
  return {
    id: def.id || uid("x"), name: def.name, equip: def.equip, unit: def.unit,
    step: def.step || STEPS[def.equip] || 2.5,
    rmin: pl.rmin, rmax: pl.rmax, target: pl.sets,
    up: pl.up, down: pl.down, reason: pl.reason, amrap: pl.amrap, skip: false,
    sets: pl.reps.map((r, i) => ({w: pl.w, r: r, ok: false, a: pl.amrap && i === pl.reps.length - 1}))
  };
}

/* Treenin liike-entry ohjelman liikkeestä: lämmittely, automaatti tai staattinen. */
function makeEntry(def){
  if(isWarm(def)){
    const list = (def.list || []).slice();
    return {id: def.id || uid("x"), name: def.name, equip: "lämmittely", warm: true,
            list: list, chk: list.map(() => false), rmin: 1, rmax: 1, target: 1, skip: false,
            sets: [{w: 0, r: def.min || 5, ok: false}]};
  }
  if(isAuto()) return autoEntry(def);
  const sg = suggest(def);
  return {
    id: def.id || uid("x"), name: def.name, equip: def.equip, unit: def.unit,
    step: def.step || STEPS[def.equip] || 2.5,
    rmin: def.rmin, rmax: def.rmax, target: def.sets, up: sg.up, skip: false,
    sets: Array.from({length: def.sets}, () => ({w: sg.w, r: def.rmax, ok: false}))
  };
}

/* AMRAP-merkki kuuluu aina viimeiselle sarjalle, myös sarjoja lisättäessä. */
function reAmrap(x){
  x.sets.forEach((t, i) => { t.a = !!x.amrap && i === x.sets.length - 1; });
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
  if(isWarm(x)) return 0;
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
  if(isWarm(x) || isTime(x)) return 0;
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
      if(w > 0 && (!set || w > set.w)) set = {w:w, date:sess.date, sets:x.sets.length, reps:x.rmax, u:repUnit(x)};
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
    if(w > 0 && prev.set && w > prev.set.w) setPRs.push({name:x.name, w:w, sets:x.sets.length, reps:x.rmax, u:repUnit(x)});
    const m = maxSetWeight(x);
    if(m > 0 && prev.max && m > prev.max.w) maxPRs.push({name:x.name, w:m});
  });
  return {set:setPRs, max:maxPRs};
}

function summaryText(sess){
  const sets = setsDone(sess);
  const lifts = sess.ex.filter(x => !isWarm(x));
  const warms = sess.ex.filter(isWarm);
  const reps = lifts.reduce((a,x) => isTime(x) ? a : a + x.sets.reduce((b,s) => b + (s.r||0), 0), 0);
  const d = new Date(sess.date).toLocaleDateString("fi-FI", {day:"numeric", month:"numeric", year:"numeric"});
  const prs = prsFor(sess);
  const q = quoteFor(sess);

  let t = "RAUTAKIRJA — " + sess.name + ", " + d + "\n";
  if(warms.length) t += "Lämmittely: " + warms.map(x => x.name + " " + fmtSet(x, x.sets[0])).join(", ") + "\n";
  t += lifts.length + " liikettä, " + sets + " sarjaa, " + reps + " toistoa\n";
  t += "Nostettu yhteensä " + fmt(volume(sess)) + " kg\n";
  if(prs.set.length){
    t += "\nUudet sarjaennätykset:\n";
    prs.set.forEach(p => {
      t += "- " + p.name + " " + fmt(p.w) + " kg (" + p.sets + " × " + p.reps + (p.u||"") + ")\n";
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

/* ============ kehitysindeksit ============

   VOIMAINDEKSI: jokaiselle liikkeelle lasketaan arvioitu maksimi (e1RM),
   muunnetaan prosenttimuutokseksi sen OMAN lähtötason suhteen, ja näistä
   otetaan keskiarvo. Alkaa nollasta.
   Miksi prosenttimuutos eikä kilojen summa: muuten maastaveto 140 kg jyräisi
   hauiskäännön 32,5 kg, ja uuden liikkeen lisääminen hyppäyttäisi lukua
   ilman että mikään on parantunut.
   e1RM-kaavan iso absoluuttinen virhe ei haittaa, koska se on systemaattinen
   ja supistuu pois kun mitataan muutosta samalla kaavalla.

   TYÖMÄÄRÄINDEKSI: viikon kokonaisvolyymi (kg) suhteessa ensimmäiseen
   treeniviikkoon. Vain viikot joilla on treenattu — muuten tauko näkyisi
   sadan prosentin pudotuksena.

   Molemmat viikkotasolla, koska treenipäivien satunnainen sijoittelu tekisi
   treenikohtaisesta käyrästä sahaavan. */

function weekKey(iso){
  const d = new Date(iso);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;            /* ma=1 … su=7 */
  t.setUTCDate(t.getUTCDate() + 4 - day);    /* ISO: torstai ratkaisee vuoden */
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return t.getUTCFullYear() + "-" + String(wk).padStart(2, "0");
}

function weekLabel(key){
  return "vk " + String(parseInt(key.slice(5), 10));
}

/* Paras e1RM liikkeelle yhdessä treenissä. */
function bestE1(x){
  if(isWarm(x) || isTime(x)) return 0;
  return x.sets.reduce((a, s) => Math.max(a, e1rm(s.w || 0, s.r || 0)), 0);
}

/* Lihasryhmä kuvaajaa varten: liikepankin ryhmä ilman alaotsikkoa
   ("Selkä — leveys" → "Selkä"). Omat liikkeet → "Muut". */
const groupOf = name => (MG[name] || "Muut").split(" — ")[0];

/* Ryhmät joista on voimadataa (lämmittelyt ja pidot eivät kelpaa). */
function chartGroups(){
  const set = new Set();
  S.sessions.forEach(s => s.ex.forEach(x => { if(bestE1(x) > 0) set.add(groupOf(x.name)); }));
  return LIB.map(g => g.g.split(" — ")[0]).filter((g, i, a) => a.indexOf(g) === i && set.has(g))
            .concat(set.has("Muut") ? ["Muut"] : []);
}

/* mg = lihasryhmä tai tyhjä (kaikki). Ryhmänäkymässä mukana vain viikot,
   joilla ryhmää on treenattu — muuten väliviikko näkyisi −100 %:n työmääränä. */
function indexSeries(mg){
  if(!S.sessions.length) return [];
  /* Kevennysviikot pois: puolitetut sarjat alarajan toistoilla painaisivat
     sekä voima- että työmääräindeksiä, vaikka mikään ei ole heikentynyt. */
  const sorted = S.sessions.filter(s => !s.deload).sort((a, b) => new Date(a.date) - new Date(b.date));
  if(!sorted.length) return [];
  const inG = x => !mg || groupOf(x.name) === mg;

  /* viikko -> { vol, best: {liike: e1RM} } */
  const weeks = new Map();
  sorted.forEach(sess => {
    const xs = sess.ex.filter(inG);
    if(mg && !xs.some(x => bestE1(x) > 0)) return;
    const k = weekKey(sess.date);
    if(!weeks.has(k)) weeks.set(k, {key:k, vol:0, best:{}});
    const w = weeks.get(k);
    w.vol += volume({ex: xs});
    xs.forEach(x => {
      const e = bestE1(x);
      if(e > 0 && (!w.best[x.name] || e > w.best[x.name])) w.best[x.name] = e;
    });
  });

  const keys = [...weeks.keys()].sort();
  const base = {};        /* liike -> lähtötaso */
  const carry = {};       /* liike -> viimeisin tunnettu taso */
  let vol0 = 0;
  const out = [];

  keys.forEach((k, i) => {
    const w = weeks.get(k);
    Object.keys(w.best).forEach(n => {
      if(!base[n]) base[n] = w.best[n];
      carry[n] = w.best[n];
    });
    /* Liikkeet joita ei tehty tällä viikolla säilyttävät edellisen tasonsa,
       jottei indeksi putoa pelkän ohjelmakierron takia. */
    const names = Object.keys(base);
    let sum = 0, n = 0;
    names.forEach(nm => {
      if(carry[nm] && base[nm] > 0){ sum += (carry[nm] / base[nm] - 1) * 100; n++; }
    });
    if(i === 0) vol0 = w.vol;
    out.push({
      key: k,
      label: weekLabel(k),
      strength: n ? sum / n : 0,
      volume: vol0 > 0 ? (w.vol / vol0 - 1) * 100 : 0,
      rawVol: w.vol,
      lifts: n
    });
  });
  return out;
}

/* ============ kehityskuvaaja ============
   Kaksi sarjaa samalla akselilla, molemmat indeksoituna nollaan — siksi
   kaksi eri suuruusluokan mittaria mahtuu yhteen kuvaajaan ilman että
   tarvitaan kahta y-akselia.
   Värit on validoitu värisokeuserottelun ja kontrastin osalta erikseen
   vaalealle ja tummalle teemalle. */

const SER = [
  {k:"strength", name:"Voima",     light:"#C4441F", dark:"#E85E33"},
  {k:"volume",   name:"Työmäärä",  light:"#1F6FC4", dark:"#4694D6"}
];
const serColor = s => 'var(--ser-' + s.k + ')';

/* Akselin lukujen pyöristys siisteihin askeliin (1, 2, 2,5, 5, 10 × 10^n). */
function niceStep(raw){
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
const pct = v => (v >= 0 ? "+" : "−") + fmt(Math.round(Math.abs(v) * 10) / 10);
const shown = () => SER.filter(se => !(route.hideSer && route.hideSer[se.k]));

function chartSvg(pts){
  const W = 320, H = 170, L = 34, R = 12, T = 12, B = 26;
  const iw = W - L - R, ih = H - T - B;

  const sc = chartScale(pts);
  const lo = sc.lo, hi = sc.hi, step = sc.step;
  const X = i => L + (pts.length === 1 ? iw / 2 : iw * i / (pts.length - 1));
  const Y = v => T + ih * (1 - (v - lo) / (hi - lo));

  /* Ruudukko: nolla korostettuna, muut hillittyinä. */
  let grid = "";
  for(let v = lo; v <= hi + 0.0001; v += step){
    const y = Y(v);
    grid += '<line x1="'+L+'" y1="'+y.toFixed(1)+'" x2="'+(W-R)+'" y2="'+y.toFixed(1)+'" class="g-line"/>';
    grid += '<text x="'+(L-6)+'" y="'+(y+3.5).toFixed(1)+'" class="g-lab" text-anchor="end">'+
            (Math.round(v*10)/10)+'</text>';
  }
  if(lo <= 0 && hi >= 0){
    grid += '<line x1="'+L+'" y1="'+Y(0).toFixed(1)+'" x2="'+(W-R)+'" y2="'+Y(0).toFixed(1)+'" class="g-zero"/>';
  }

  let lines = "", dots = "";
  shown().forEach(se => {
    const d = pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p[se.k]).toFixed(1)).join(" ");
    lines += '<path d="'+d+'" fill="none" stroke="'+serColor(se)+'" stroke-width="2" '+
             'stroke-linejoin="round" stroke-linecap="round"/>';
    const last = pts[pts.length - 1];
    /* Viimeinen piste saa merkin ja suoran arvomerkinnän — ei numeroa joka pisteeseen. */
    dots += '<circle cx="'+X(pts.length-1).toFixed(1)+'" cy="'+Y(last[se.k]).toFixed(1)+'" r="4" '+
            'fill="'+serColor(se)+'" stroke="var(--surface)" stroke-width="2"/>';
  });

  const first = pts[0].label, last = pts[pts.length - 1].label;
  let xlab = '<text x="'+L+'" y="'+(H-8)+'" class="g-lab" text-anchor="start">'+esc(first)+'</text>';
  if(pts.length > 1) xlab += '<text x="'+(W-R)+'" y="'+(H-8)+'" class="g-lab" text-anchor="end">'+esc(last)+'</text>';

  /* Kosketusalueet: koko korkeuden levyiset kaistat, isommat kuin merkit. */
  let hits = "";
  pts.forEach((p, i) => {
    const bw = pts.length === 1 ? iw : iw / (pts.length - 1);
    hits += '<rect x="'+(X(i)-bw/2).toFixed(1)+'" y="'+T+'" width="'+bw.toFixed(1)+'" height="'+ih+'" '+
            'fill="transparent" data-pt="'+i+'"/>';
  });

  return '<svg viewBox="0 0 '+W+' '+H+'" class="chart" id="devchart" role="img" '+
         'aria-label="Kehitysindeksi viikoittain">'+
         grid + lines + dots + xlab +
         '<line id="cross" class="g-cross" x1="0" y1="'+T+'" x2="0" y2="'+(T+ih)+'" style="display:none"/>'+
         '<circle id="cd0" r="5" style="display:none" stroke="var(--surface)" stroke-width="2"/>'+
         '<circle id="cd1" r="5" style="display:none" stroke="var(--surface)" stroke-width="2"/>'+
         hits + '</svg>';
}

/* Skaala lasketaan vain näkyvistä sarjoista, jotta yhden sarjan
   piilottaminen levittää jäljelle jäävän koko korkeudelle. */
function chartScale(pts){
  const vis = shown();
  let lo = 0, hi = 0;
  pts.forEach(p => vis.forEach(se => { lo = Math.min(lo, p[se.k]); hi = Math.max(hi, p[se.k]); }));
  const span = Math.max(hi - lo, 4);
  const step = niceStep(span / 4);
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  if(hi - lo < step * 2) hi = lo + step * 2;
  return {lo, hi, step};
}

function viewChart(){
  const groups = chartGroups();
  if(route.mg && !groups.includes(route.mg)) route.mg = "";
  const mg = route.mg || "";
  const pts = indexSeries(mg);
  const c = el('<div class="card pad"></div>');
  const sel = groups.length > 1
    ? '<label class="f" style="margin:8px 0 2px"><span class="eyebrow">Lihasryhmä</span>'+
        '<select data-mg="1">'+
          '<option value="">Kaikki liikkeet</option>'+
          groups.map(g => '<option'+(g===mg?' selected':'')+'>'+esc(g)+'</option>').join("")+
        '</select></label>'
    : '';

  if(pts.length < 2){
    c.innerHTML = '<div class="eyebrow">Kehitys</div>'+sel+
      '<div class="empty" style="padding:22px 6px">Kuvaaja piirtyy kun '+(mg ? 'tätä lihasryhmää on treenattu' : 'treenejä on')+
      ' vähintään kahdelta eri viikolta.</div>';
    return c;
  }

  const last = pts[pts.length - 1];

  c.innerHTML =
    '<div class="eyebrow">Kehitys — indeksi, lähtötaso 0</div>'+sel+
    '<div class="legend">'+ SER.map(se => {
        const off = route.hideSer && route.hideSer[se.k];
        return '<button class="lg'+(off?' off':'')+'" data-ser="'+se.k+'" '+
               'aria-pressed="'+(off?'false':'true')+'">'+
               '<i style="background:'+serColor(se)+'"></i>'+se.name+
               ' <b class="num">'+pct(last[se.k])+' %</b></button>';
      }).join("") +
    '</div>'+
    chartSvg(pts)+
    '<div class="tip" id="ctip" hidden></div>'+
    '<button class="btn sm ghost" data-ctable="1" style="margin-top:10px">'+
      (route.ctable ? "Piilota taulukko" : "Näytä taulukkona")+'</button>'+
    (route.ctable
      ? '<div style="overflow-x:auto;margin-top:10px"><table class="dt">'+
        '<thead><tr><th>Viikko</th><th>Voima</th><th>Työmäärä</th><th>Volyymi</th></tr></thead><tbody>'+
        pts.map(p => '<tr><td>'+esc(p.label)+'</td><td class="num">'+pct(p.strength)+' %</td>'+
          '<td class="num">'+pct(p.volume)+' %</td><td class="num">'+fmt(Math.round(p.rawVol))+' kg</td></tr>').join("")+
        '</tbody></table></div>'
      : '')+
    '<p style="font-size:12.5px;color:var(--dim);margin:11px 0 0">'+
      (mg ? '<b>'+esc(mg)+':</b> vain tämän lihasryhmän liikkeet ja viikot, joilla niitä on tehty. ' : '')+
      'Voima = arvioidun maksimin keskimääräinen muutos liikkeittäin. '+
      'Työmäärä = viikon kokonaisvolyymi suhteessa ensimmäiseen treeniviikkoon.</p>';

  c._pts = pts;
  return c;
}

/* Ristikohdistin ja arvolaatikko. */
function chartHover(i){
  const svg = document.getElementById("devchart");
  const card = svg && svg.closest(".card");
  const tip = document.getElementById("ctip");
  if(!svg || !card || !card._pts || !tip) return;
  const pts = card._pts;
  if(i < 0 || i >= pts.length){ hideHover(); return; }

  const W = 320, L = 34, R = 12, T = 12, B = 26, H = 170;
  const iw = W - L - R, ih = H - T - B;
  const sc = chartScale(pts);
  const X = k => L + (pts.length === 1 ? iw / 2 : iw * k / (pts.length - 1));
  const Y = v => T + ih * (1 - (v - sc.lo) / (sc.hi - sc.lo));

  const cross = document.getElementById("cross");
  cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i));
  cross.style.display = "";
  SER.forEach((se, n) => {
    const d = document.getElementById("cd" + n);
    if(route.hideSer && route.hideSer[se.k]){ d.style.display = "none"; return; }
    d.setAttribute("cx", X(i)); d.setAttribute("cy", Y(pts[i][se.k]));
    d.setAttribute("fill", serColor(se));
    d.style.display = "";
  });

  const p = pts[i];
  tip.innerHTML = '<b>'+esc(p.label)+'</b>' +
    shown().map(se => '<span><i style="background:'+serColor(se)+'"></i>'+se.name+
      ' <span class="num">'+pct(p[se.k])+' %</span></span>').join("");
  tip.hidden = false;
}
function hideHover(){
  const c = document.getElementById("cross"); if(c) c.style.display = "none";
  ["cd0","cd1"].forEach(id => { const d = document.getElementById(id); if(d) d.style.display = "none"; });
  const t = document.getElementById("ctip"); if(t) t.hidden = true;
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
  const titles = {treeni: S.active ? S.active.name : "Rautakirja", historia:"Historia", ohjelmat:"Ohjelmat", data:"Asetukset"};
  bar.innerHTML = '<h1>'+esc(titles[route.tab])+'</h1>' + (route.tab==="treeni" && S.active ? '<span class="clock" id="clk">00:00</span>' : '');
  if(route.tab==="treeni" && S.active){
    const lifts = S.active.ex.filter(x => !isWarm(x));
    const tot = lifts.reduce((a,x)=> a + (x.skip?0:x.sets.length), 0);
    const dn  = setsDone(S.active);
    const curX = S.active.ex.find(x=>!x.skip && x.sets.some(s=>!s.ok));
    const cur = lifts.indexOf(curX);
    bp.innerHTML =
      '<div class="prog-track"><div class="prog-fill" style="width:'+(tot?dn/tot*100:0)+'%"></div></div>'+
      '<div class="bar-sub"><span>'+(isWarm(curX) ? 'Lämmittely' : 'Liike '+(cur<0?lifts.length:cur+1)+' / '+lifts.length)+'</span>'+
      '<span class="num">'+dn+' / '+tot+' sarjaa</span></div>';
    tick();
  } else bp.innerHTML = "";
}

function renderNav(){
  const items = [["treeni",I.bar,"Treeni"],["historia",I.hist,"Historia"],["ohjelmat",I.prog,"Ohjelmat"],["data",I.cog,"Asetukset"]];
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

  const cyc = cycleInfo();
  if(cyc && cyc.len){
    if(cyc.deload){
      wrap.appendChild(el(
        '<div class="card pad" style="border-left:3px solid var(--good)">'+
          '<div class="eyebrow">Kevennysviikko · jakso '+(cyc.idx+1)+'</div>'+
          '<p style="margin:6px 0 12px">Tämän viikon treenit ovat kevyempiä: sarjat puoleen, painot ennallaan, '+
          'ei maksimisarjoja. Palautuminen näkyy seuraavan jakson tuloksissa.</p>'+
          '<button class="btn wide ghost" data-skipdeload="1">Ohita tämä kevennys</button></div>'));
    } else {
      wrap.appendChild(el(
        '<div class="card pad" style="padding-top:11px;padding-bottom:11px">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'+
            '<span class="eyebrow">Automaattinen · jakso '+(cyc.idx+1)+'</span>'+
            '<span class="num" style="font-size:13.5px">viikko '+cyc.week+'/'+cyc.len+'</span>'+
          '</div>'+
          (cyc.ramp ? '<div style="font-size:13px;color:var(--dim);margin-top:5px">Sarjamäärä nostettu tälle viikolle.</div>' : '')+
          (cyc.skipped ? '<div style="font-size:13px;color:var(--dim);margin-top:5px">Kevennys ohitettu. '+
            '<button class="pill" data-undodeload="1">Peru</button></div>' : '')+
        '</div>'));
    }
  }

  if(S.sessions.length >= 4 && !S.active){
    const low = lowGroups(2);
    if(low.length){
      wrap.appendChild(el(
        '<div class="card pad" style="padding-top:11px;padding-bottom:11px">'+
          '<div class="eyebrow">Viikon volyymi</div>'+
          '<div style="font-size:13.5px;margin-top:4px">Alle 10 sarjaa viimeisen 7 päivän aikana: '+
            low.map(x => '<b>'+esc(x.g)+'</b> '+fmt(x.n)).join(', ')+'. '+
            '<button class="pill" data-quicklow="1">Pikaohjelma näille</button></div>'+
        '</div>'));
    }
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
        p.ex.filter(x=>!isWarm(x)).length+' liikettä · '+p.ex.reduce((a,x)=>a+(isWarm(x)?0:x.sets),0)+' sarjaa'+
        (p.ex.some(isWarm)?' · lämmittely':'')+
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
    ex: p.ex.map(makeEntry),
    note:""
  };
  if(isAuto()){
    const cyc = cycleInfo();
    S.active.mode = "auto";
    S.active.deload = !!(cyc && cyc.deload);
  }
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
      : isWarm(x) ? "Lämmittely · " + fmtSet(x, x.sets[0])
      : okSets.length ? okSets.map(s=>fmt(s.r)).join(" · ") + repUnit(x) + "  @ " + fmt(okSets[okSets.length-1].w) + " kg"
      : x.target + " × " + reps(x) + repUnit(x) + " · " + fmt(x.sets[0].w) + " kg";

    d.appendChild(el(
      '<button class="ex-head" data-open="'+i+'">'+
        '<span class="idx">'+(done && !x.skip ? "✓" : i+1)+'</span>'+
        '<span class="ex-name">'+esc(x.name)+
          '<span class="ex-meta"><span class="num">'+esc(summary)+'</span>'+
          (x.up && !okSets.length ? '<span class="pill accent">Nosta painoa</span>' : '')+
          (x.down && !okSets.length ? '<span class="pill">Kevennä</span>' : '')+'</span></span>'+
      '</button>'));

    if(open && !x.skip && isWarm(x)){
      const body = el('<div class="ex-body"></div>');
      const list = x.list || [];
      if(list.length){
        body.appendChild(el('<div class="wlist">'+list.map((it,j) =>
          '<button class="witem'+(x.chk && x.chk[j]?' on':'')+'" data-wchk="'+i+'" data-wj="'+j+'">'+
            '<span class="wbox">'+(x.chk && x.chk[j]?I.check:'')+'</span><span>'+esc(it)+'</span></button>').join("")+'</div>'));
      } else {
        body.appendChild(el('<div class="hint"><span>Ei muistilistaa. Voit lisätä sen ohjelman muokkauksessa.</span></div>'));
      }
      const s0 = x.sets[0];
      body.appendChild(el(
        '<div class="setrow first one'+(s0.ok?" ok":"")+'" data-ex="'+i+'" data-set="0">'+
          '<div class="sn">1</div>'+
          '<div class="field"><span>Kesto min</span><div class="stepper">'+
            '<button class="step" data-d="-1" data-f="r" aria-label="Vähennä minuutteja">−</button>'+
            '<input inputmode="decimal" data-f="r" value="'+fmt(s0.r)+'">'+
            '<button class="step" data-d="1" data-f="r" aria-label="Lisää minuutteja">+</button></div></div>'+
          '<button class="chk" data-chk="1" aria-label="Merkitse lämmittely tehdyksi">'+I.check+'</button>'+
        '</div>'));
      body.appendChild(el('<div class="rowtools"><button class="btn sm ghost" data-skip="'+i+'" style="margin-left:auto">Ohita</button></div>'));
      d.appendChild(body);
    }
    else if(open && !x.skip){
      const body = el('<div class="ex-body"></div>');
      const L = lastFor(x.name, A.id);
      if(x.reason){
        body.appendChild(el('<div class="hint'+(x.up?" up":x.down?" down":"")+'">'+
          '<span class="num">'+x.sets.length+' × '+(x.rmin===x.rmax?x.rmin:x.rmin+'–'+x.rmax)+repUnit(x)+'</span>'+
          '<span>'+esc(x.reason)+'</span>'+
          (L ? '<span style="width:100%;font-size:12.5px">Viimeksi: <span class="num">'+
                L.ex.sets.filter(t=>t.ok).map(t=>fmt(t.r)).join(" · ")+repUnit(x)+' × '+
                fmt(L.ex.sets.filter(t=>t.ok).slice(-1)[0].w)+' kg</span></span>' : '')+
          (x.amrap ? '<span style="width:100%;font-size:12.5px"><b>Viimeinen sarja:</b> '+
            (isTime(x) ? 'niin pitkään kuin ote ja tekniikka kestävät.' : 'niin monta kuin tekniikka kestää.')+'</span>' : '')+
        '</div>'));
      } else if(L){
        const ok = L.ex.sets.filter(t=>t.ok);
        body.appendChild(el('<div class="hint'+(x.up?" up":"")+'">'+
          '<span>Viimeksi '+dateFi(L.sess.date).toLowerCase()+':</span>'+
          '<span class="num">'+ok.map(t=>fmt(t.r)).join(" · ")+repUnit(x)+' × '+fmt(ok[ok.length-1].w)+' kg</span>'+
          (x.up?'<b>↑ tavoite täynnä, nosta painoa</b>':'')+'</div>'));
      } else {
        body.appendChild(el('<div class="hint"><span>Tavoite</span><span class="num">'+x.target+' × '+reps(x)+repUnit(x)+'</span></div>'));
      }

      const sh = safetyHint(x); if(sh) body.appendChild(el(sh));
      x.sets.forEach((s,j) => {
        body.appendChild(el(
          '<div class="setrow'+(j===0?" first":"")+(s.ok?" ok":"")+(s.a?" amrap":"")+'" data-ex="'+i+'" data-set="'+j+'">'+
            '<div class="sn">'+(s.a?'<span class="max">MAX</span>':(j+1))+'</div>'+
            '<div class="field"><span>'+(x.equip==="kehonpaino"?"Lisäpaino kg":"Paino kg")+(x.equip==="käsipaino"?" / käsi":"")+'</span><div class="stepper">'+
              '<button class="step" data-d="-1" data-f="w" aria-label="Vähennä painoa">−</button>'+
              '<input inputmode="decimal" data-f="w" value="'+fmt(s.w)+'">'+
              '<button class="step" data-d="1" data-f="w" aria-label="Lisää painoa">+</button></div></div>'+
            '<div class="field"><span>'+(isTime(x)?"Sekunnit":"Toistot")+'</span><div class="stepper">'+
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

  if(route.hsub!=="liikkeet"){ wrap.appendChild(viewChart()); wrap.appendChild(volumeCard()); }

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
        const tag = isWarm(last.x) ? 'lämmittely'
                  : rec.set ? 'sarjaennätys '+fmt(rec.set.w)+' kg'
                  : rec.max ? 'maksimi '+fmt(rec.max.w)+' kg'
                  : isTime(last.x) ? 'pisin '+fmt(best.e1)+' s'
                  : 'ei vielä ennätystä';
        return '<button class="rowlink" data-exname="'+esc(n)+'">'+
          '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(n)+'</div>'+
          '<div style="font-size:13px;color:var(--dim)">Viimeksi '+fmtSet(last.x, last.top)+
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
/* ============ pikaohjelma ============

   Arpoo ohjelman valituista lihasryhmistä. Säännöt ja niiden perusteet:
   - YHDISTELMÄLIIKE ENSIN joka ryhmästä, eristävät perään. Järjestys ei
     vaikuta lihaskasvuun mutta ensimmäisenä tehty liike kehittyy voimassa
     eniten (Nunes ym. 2021, meta-analyysi) — siksi iso liike ensin.
   - SARJAKATTO per lihasryhmä per treeni noin 8–10: sen yli laatu laskee
     ja lisäsarjat kannattaa siirtää toiseen treeniin. Viikkotasolla
     10–20 sarjaa/lihasryhmä on tuottava alue (Schoenfeld 2017; Pelland
     ym. 2025). Sarjat per liike mitoitetaan niin, että koko treeni on
     noin 20–24 sarjaa ja ryhmän summa pysyy katon alla.
   - TOISTOT: yhdistelmäliikkeet matalammalla haarukalla, eristävät
     korkeammalla; pohkeet ja keskivartalo korkeimmalla.
   - PEILAUS HISTORIAAN: tutut liikkeet (joista on painot tiedossa) ovat
     arvonnassa etusijalla; viime treenissä tehtyjä vältetään vaihtelun
     vuoksi; alle 48 h sitten raskaasti treenattu ryhmä saa yhden sarjan
     vähemmän; aloituspaino tulee viimeisimmästä työpainosta. */

const QG = ["Rinta","Selkä","Hartiat","Hauis","Ojentaja","Etureisi","Takareisi ja pakarat","Pohkeet","Keskivartalo","Kyynärvarret ja ote"];
const BIG = ["Selkä","Etureisi","Takareisi ja pakarat","Rinta","Hartiat"];
const isCompound = n => /kyykky|maastaveto|soutu|leuanveto|ylätalja|alasveto|jalkaprässi|dippi|lantionnosto|hyvää huomenta|prässi|vetoliike|punnerrus|askel|astuminen|heilautus/i.test(n)
                        && !/ojentajapunnerrus|ranskalainen|kickback|pullover/i.test(n);
const QREPS = {                          /* [staattinen rmin,rmax, auto rmin,rmax] */
  compound:  [6, 8, 6, 10],
  isolation: [10, 12, 10, 15],
  high:      [15, 20, 15, 25]            /* pohkeet, keskivartalo */
};

/* Ryhmän sarjat tällä viikolla ja viimeisin treenipäivä (lämmittelyt pois). */
function groupStats(g){
  const wk = weekKey(new Date().toISOString());
  let week = 0, last = null, lastSets = 0;
  S.sessions.forEach(sess => {
    let n = 0;
    sess.ex.forEach(x => { if(!isWarm(x) && groupOf(x.name) === g) n += x.sets.filter(t => t.ok).length; });
    if(!n) return;
    if(weekKey(sess.date) === wk) week += n;
    if(!last || new Date(sess.date) > new Date(last)){ last = sess.date; lastSets = n; }
  });
  return {week: week, last: last, lastSets: lastSets,
          recent: !!last && (Date.now() - new Date(last).getTime()) < 48 * 36e5 && lastSets >= 6};
}

/* ---- viikkovolyymi lihasryhmittäin ----
   Suorat sarjat = liikkeen oma ryhmä. Epäsuorat = yhdistelmäliikkeen
   toissijaiset lihakset puolikkaana sarjana (yleinen käytäntö mm. RP:n
   volyymiohjeissa): penkki → ojentaja ja hartiat, vedot ja soudut → hauis,
   pystypunnerrukset → ojentaja, kyykyt ja prässit → takareisi ja pakarat,
   maastavedot → selkä, dipit → rinta. Liukuva 7 päivää, ei kalenteriviikko,
   jotta maanantaina ei näy tyhjää taulua. */
const SECONDARY = [
  [/penkkipunnerrus|rintaprässi|^punnerrus|dippi rinnalle/i, ["Ojentaja", "Hartiat"]],
  [/ylätalja|leuanveto|alasveto|soutu|vetoliike/i,            ["Hauis"]],
  [/pystypunnerrus|arnold|olkapääpunnerrus|pystysoutu/i,      ["Ojentaja"]],
  [/kyykky|jalkaprässi|askelkyykky|astuminen/i,               ["Takareisi ja pakarat"]],
  [/^maastaveto|sumomaastaveto|trap bar/i,                    ["Selkä"]],
  [/dippi ojentajalle|dippilaite/i,                           ["Rinta"]]
];
function weekVolume(days){
  const since = Date.now() - (days || 7) * 864e5;
  const out = {}; QG.forEach(g => { out[g] = {direct: 0, indirect: 0}; });
  S.sessions.forEach(sess => {
    if(new Date(sess.date).getTime() < since) return;
    sess.ex.forEach(x => {
      if(isWarm(x)) return;
      const n = x.sets.filter(t => t.ok).length; if(!n) return;
      const g = groupOf(x.name);
      if(out[g]) out[g].direct += n;
      SECONDARY.forEach(([re, gs]) => { if(re.test(x.name)) gs.forEach(sg => { if(sg !== g && out[sg]) out[sg].indirect += n * 0.5; }); });
    });
  });
  return out;
}
/* Ryhmät joita käyttäjä on joskus treenannut — niistä puhutaan, ei muista. */
function trainedGroups(){
  const set = new Set();
  S.sessions.forEach(s => s.ex.forEach(x => { if(!isWarm(x) && x.sets.some(t => t.ok)) set.add(groupOf(x.name)); }));
  return QG.filter(g => set.has(g));
}
/* Vähiten treenatut ryhmät viimeiseltä 7 päivältä (suorat + epäsuorat), alle 10 sarjaa. */
function lowGroups(max){
  const v = weekVolume(7);
  return trainedGroups().map(g => ({g: g, n: v[g].direct + v[g].indirect}))
    .filter(x => x.n < 10).sort((a, b) => a.n - b.n).slice(0, max || 3);
}
function volumeCard(){
  const v = weekVolume(7);
  const groups = trainedGroups();
  const c = el('<div class="card pad"></div>');
  if(!groups.length){
    c.innerHTML = '<div class="eyebrow">Viikon sarjat lihasryhmittäin</div><div class="empty" style="padding:18px 6px">Näkyy kun treenejä on kirjattu.</div>';
    return c;
  }
  const rows = QG.filter(g => groups.includes(g) || v[g].direct + v[g].indirect > 0).map(g => {
    const d = v[g].direct, i = v[g].indirect, tot = d + i;
    const pd = Math.min(100, d / 25 * 100), pi = Math.min(100 - pd, i / 25 * 100);
    const cls = tot >= 10 && tot <= 20 ? "in" : tot > 20 ? "over" : "";
    return '<div class="vrow">'+
      '<span class="vname">'+esc(g)+'</span>'+
      '<span class="vbar"><i class="vband"></i><i class="vd '+cls+'" style="width:'+pd+'%"></i><i class="vi" style="left:'+pd+'%;width:'+pi+'%"></i></span>'+
      '<span class="num vnum">'+fmt(d)+(i ? ' <small>+'+fmt(i)+'</small>' : '')+'</span></div>';
  }).join("");
  c.innerHTML =
    '<div class="eyebrow">Viikon sarjat lihasryhmittäin · 7 pv</div>'+
    '<div class="vlist">'+rows+'</div>'+
    '<p style="font-size:12.5px;color:var(--dim);margin:10px 0 0">Harmaa kaista = tuottava alue 10–20 sarjaa viikossa. '+
      'Pieni luku on epäsuoria sarjoja: yhdistelmäliike lasketaan toissijaiselle lihakselle puolikkaana '+
      '(penkki → ojentaja ja hartiat, vedot → hauis, kyykyt → takareisi ja pakarat).</p>';
  return c;
}

function quickGenerate(groups, n, withWarm){
  groups = QG.filter(g => groups.includes(g));
  if(!groups.length || n < 1) return null;
  const done = new Set();                                  /* tehty historiassa */
  S.sessions.forEach(s => s.ex.forEach(x => { if(x.sets.some(t => t.ok)) done.add(x.name); }));
  const lastSess = S.sessions[S.sessions.length - 1];
  const lastNames = new Set(lastSess ? lastSess.ex.map(x => x.name) : []);

  /* 1. Liikkeiden jako ryhmille: tasan, loput isoille ryhmille. */
  const per = {}; groups.forEach(g => { per[g] = Math.floor(n / groups.length); });
  let rest = n - groups.length * Math.floor(n / groups.length);
  [...groups].sort((a, b) => (BIG.indexOf(a) + 1 || 99) - (BIG.indexOf(b) + 1 || 99)).forEach(g => { if(rest > 0){ per[g]++; rest--; } });

  const pool = g => LIB.flatMap(gr => gr.g.split(" — ")[0] === g ? gr.items.map(i => Object.assign({sub: gr.g}, i)) : [])
                       .filter(i => !i.warm);
  const fam = nm => nm.toLowerCase().replace(/ (smith-laitteessa|tangolla|käsipainoilla|taljassa|laitteessa).*$/, "").split(/[ ,]/)[0];
  const draw = (cands, used, usedFam) => {
    const ok = cands.filter(i => !used.has(i.n) && !usedFam.has(fam(i.n)));
    const c = ok.length ? ok : cands.filter(i => !used.has(i.n));
    if(!c.length) return null;
    /* painotus: tuttu liike ×3, viime treenissä tehty ×0,3, pelkkä kehonpaino ×0,5 */
    const w = c.map(i => (done.has(i.n) ? 3 : 1) * (lastNames.has(i.n) ? 0.3 : 1) * (i.e === "kehonpaino" ? 0.5 : 1));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for(let k = 0; k < c.length; k++){ r -= w[k]; if(r <= 0) return c[k]; }
    return c[c.length - 1];
  };

  const picks = [];
  groups.forEach(g => {
    const k = per[g]; if(!k) return;
    const P = pool(g), used = new Set(), usedFam = new Set();
    const st = groupStats(g);
    /* Treenin kokonaismäärä noin 20–24 sarjaa, ryhmän summa enintään 9. */
    let sets = Math.min(4, Math.max(2, Math.round(22 / n)), Math.max(2, Math.floor(9 / k)));
    if(st.recent) sets = Math.max(2, sets - 1);
    const subs = [...new Set(P.map(i => i.sub))];                /* Selkä: leveys / paksuus vuorotellen */
    for(let j = 0; j < k; j++){
      const sub = subs[j % subs.length];
      let cands = P.filter(i => i.sub === sub);
      let item = j === 0 || (subs.length > 1 && j < subs.length)
        ? (draw(cands.filter(i => isCompound(i.n)), used, usedFam) || draw(cands, used, usedFam))
        : (draw(cands.filter(i => !isCompound(i.n)), used, usedFam) || draw(cands, used, usedFam));
      if(!item) item = draw(P, used, usedFam);
      if(!item) break;
      used.add(item.n); usedFam.add(fam(item.n));
      const comp = isCompound(item.n);
      const kind = (g === "Pohkeet" || g === "Keskivartalo") ? "high" : comp ? "compound" : "isolation";
      const q = QREPS[kind];
      const L = lastFor(item.n);
      const lastW = L ? L.ex.sets.filter(t => t.ok).slice(-1)[0].w : 0;
      const def = defFromLib(item, {sets: sets, rmin: q[0], rmax: q[1], w: lastW});
      if(!isTime(def)){ def.autoRmin = q[2]; def.autoRmax = q[3]; }
      def.sets = sets;
      picks.push({def: def, g: g, comp: comp, big: BIG.includes(g), known: done.has(item.n),
                  why: (comp ? "yhdistelmäliike" : kind === "high" ? "korkeat toistot" : "eristävä") +
                       (done.has(item.n) ? " · painot tiedossa" : " · uusi liike") +
                       (st.recent ? " · ryhmä treenattu alle 48 h sitten, −1 sarja" : "")});
    }
  });

  /* 2. Järjestys: isojen ryhmien yhdistelmäliikkeet, muut yhdistelmät,
        eristävät, lopuksi pohkeet ja keskivartalo. */
  const rank = p => (p.g === "Pohkeet" || p.g === "Keskivartalo" || p.g === "Kyynärvarret ja ote") ? 3 : p.comp ? (p.big ? 0 : 1) : 2;
  picks.sort((a, b) => rank(a) - rank(b));
  const ex = picks.map(p => p.def);
  if(withWarm){
    const w = LIB[0].items.find(i => i.n === "Dynaaminen kehonpainolämmittely");
    if(w) ex.unshift(defFromLib(w));
  }
  const totalSets = ex.reduce((a, x) => a + (isWarm(x) ? 0 : x.sets), 0);
  const mins = Math.round((totalSets * 2.5 + ex.filter(x => !isWarm(x)).length * 2 + (withWarm ? 5 : 0)) / 5) * 5;
  return {
    program: {id: uid("p"), name: "Pika: " + groups.map(g => g.split(" ")[0]).join(", "),
              est: "noin " + mins + " min", ex: ex},
    picks: picks, totalSets: totalSets
  };
}

function viewPrograms(v){
  const wrap = el('<div class="stack"></div>');
  const c = el('<div class="card"></div>');
  c.innerHTML = S.programs.map(p =>
    '<button class="rowlink" data-editp="'+p.id+'">'+
      '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(p.name)+'</div>'+
      '<div style="font-size:13px;color:var(--dim)">'+p.ex.length+' liikettä · '+esc(p.est||"")+'</div></div>'+
      '<span class="chev">'+I.chev+'</span></button>').join("");
  wrap.appendChild(c);
  wrap.appendChild(el('<div class="grid2">'+
    '<button class="btn" data-newp="1">+ Uusi ohjelma</button>'+
    '<button class="btn primary" data-quick="1">Pikaohjelma</button></div>'));
  wrap.appendChild(el('<div class="card pad" style="font-size:13.5px;color:var(--dim)">'+
    '<div class="eyebrow" style="margin-bottom:6px">Painon askel</div>'+
    'Askel määrää paljonko + ja − muuttavat painoa. Oletukset: tanko 2,5 kg · talja 2,5 kg · laite 5 kg · Smith 2,5 kg · kehonpaino 1 kg. Käsipainoilla askel on kiinteä: 1 kg kymmeneen kiloon asti, sen jälkeen 2,5 kg. Käsipainojen paino tarkoittaa aina painoa per käsi. Smith-laitteen tangon paino vaihtelee laitteittain — kirjaa se aina samalla tavalla, esim. pelkät levyt.</div>'));
  v.appendChild(wrap);
}

/* Lyhyt selitys valitusta harjoitusmallista Asetukset-välilehdelle.
   Teksti seuraa asetuksia, jotta se ei lupaa mitään mitä moottori ei tee. */
function modeInfo(st, auto){
  const li = t => '<li>'+t+'</li>';
  let rows;
  if(!auto){
    rows = [
      'Sarjat ja toistot pysyvät samoina, kunnes muutat niitä itse.',
      'Paino nousee yhden askeleen, kun kaikki sarjat yltävät toistotavoitteeseen.',
      'Ei kevennysviikkoja eikä automaattista painon laskua.',
      '<b>Sopii, kun</b> haluat seurata valmista ohjelmaa sellaisenaan.'
    ];
  } else {
    const L = st.deloadWeeks;
    rows = [
      'Jokaisella liikkeellä on toistohaarukka (oletus '+st.autoRmin+'–'+st.autoRmax+'). '+
        'Paino pysyy, kunnes toistot nousevat haarukan yläpäähän.',
      'Paino nousee, kun kaikki sarjat yltävät yläpäähän '+
        (st.twoSession ? 'kahdella peräkkäisellä kerralla.' : '.')+
        ' Sen jälkeen toistot laskevat ja alkavat taas nousta.',
      st.amrap ? 'Viimeinen sarja tehdään maksimiin (<b>MAX</b>). Jos toistoja tulee 3 yli ylärajan, paino nousee heti.' : '',
      L ? L+' viikon jaksossa '+(st.addSets ? 'loppupuolelle tulee yksi sarja lisää ja ' : '')+
          'viimeinen viikko on kevennys (puolet sarjoista, sama paino).' : '',
      'Jos jäät kahdesti peräkkäin haarukan alle, paino laskee askeleen.',
      '<b>Sopii, kun</b> haluat, että appi päättää painot ja sarjat puolestasi.'
    ].filter(Boolean);
  }
  return '<div class="infobox"><div class="eyebrow">'+(auto ? 'Automaattinen malli' : 'Staattinen malli')+'</div>'+
         '<ul>'+rows.map(li).join('')+'</ul></div>';
}

/* ============ DATA ============ */
function viewData(v){
  const wrap = el('<div class="stack"></div>');
  const since = S.sessions.length - (S.meta.backupCount||0);
  const st = S.settings || defaultSettings();
  const auto = st.mode === "automaattinen";

  /* --- Harjoitusmalli --- */
  const modeCard = el('<div class="card pad"></div>');
  modeCard.innerHTML =
    '<div class="eyebrow">Harjoitusmalli</div>'+
    '<div class="grid2" style="margin:9px 0 4px">'+
      '<button class="btn'+(auto?'':' primary')+'" data-mode="staattinen">Staattinen</button>'+
      '<button class="btn'+(auto?' primary':'')+'" data-mode="automaattinen">Automaattinen</button>'+
    '</div>'+
    (auto
      ? modeInfo(st, true)+
        '<div class="grid2" style="margin-top:11px">'+
          '<label class="f"><span class="eyebrow">Toistot väh.</span><input inputmode="numeric" data-set="autoRmin" value="'+st.autoRmin+'"></label>'+
          '<label class="f"><span class="eyebrow">Toistot enint.</span><input inputmode="numeric" data-set="autoRmax" value="'+st.autoRmax+'"></label>'+
        '</div>'+
        '<div class="kv"><span>Kahden kerran sääntö</span>'+
          '<button class="pill '+(st.twoSession?'good':'')+'" data-tog="twoSession">'+(st.twoSession?'Päällä':'Pois')+'</button></div>'+
        '<div class="kv"><span>Sarjamäärä kasvaa '+st.sets+' → '+st.maxSets+'</span>'+
          '<button class="pill '+(st.addSets?'good':'')+'" data-tog="addSets">'+(st.addSets?'Päällä':'Pois')+'</button></div>'+
        '<div class="kv"><span>Viimeinen sarja maksimiin</span>'+
          '<button class="pill '+(st.amrap?'good':'')+'" data-tog="amrap">'+(st.amrap?'Päällä':'Pois')+'</button></div>'+
        '<div class="kv"><span>Jakson pituus</span>'+
          '<select data-dw="1" style="width:auto;padding:6px 8px">'+
            [0,4,5,6,8].map(n => '<option value="'+n+'"'+(n===st.deloadWeeks?' selected':'')+'>'+
              (n ? n+' vk' : 'ei jaksoa')+'</option>').join('')+
          '</select></div>'+
        (function(){
          const c = cycleInfo();
          if(!c || !c.len) return '<p style="font-size:12.5px;color:var(--dim);margin:9px 0 0">Ilman jaksoa ei kevennysviikkoja '+
            'eikä sarjamäärän kasvatusta.</p>';
          return '<div class="kv"><span>Nyt</span><span class="num">jakson viikko '+c.week+'/'+c.len+
            (c.deload?' · kevennys':c.ramp?' · '+(st.maxSets)+' sarjaa':'')+'</span></div>';
        })()+
        '<button class="btn wide ghost" data-newcycle="1" style="margin-top:11px">Aloita uusi jakso</button>'+
        '<p style="font-size:12.5px;color:var(--dim);margin:10px 0 0">Liikekohtaiset poikkeukset — oma haarukka '+
          'tai viimeisen sarjan maksimi pois — säädetään Ohjelmat-välilehdellä.</p>'
      : modeInfo(st, false)+
        '<div class="grid3" style="margin-top:11px">'+
          '<label class="f"><span class="eyebrow">Sarjat</span><input inputmode="numeric" data-set="sets" value="'+st.sets+'"></label>'+
          '<label class="f"><span class="eyebrow">Toistot väh.</span><input inputmode="numeric" data-set="rmin" value="'+st.rmin+'"></label>'+
          '<label class="f"><span class="eyebrow">Toistot enint.</span><input inputmode="numeric" data-set="rmax" value="'+st.rmax+'"></label>'+
        '</div>'+
        '<p style="font-size:12.5px;color:var(--dim);margin:9px 0 11px">Nämä ovat uusien liikkeiden oletukset. '+
          'Yksittäisen liikkeen arvot muutat Ohjelmat-välilehdellä.</p>'+
        '<button class="btn wide" data-applyall="1">Aseta nämä kaikkiin liikkeisiin</button>');
  wrap.appendChild(modeCard);

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
          '<span class="num">'+fmtSet(x, t)+'</span></div>').join("")+
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
    const hx = h.length ? h[h.length-1].x : null;
    if(SAFE[s.name]) body.appendChild(el('<div class="hint safe" style="margin:0"><span class="sflag">Turvallisuus</span><span>'+esc(SAFE[s.name])+'</span></div>'));
    if(!isWarm(hx)) body.appendChild(el('<div class="grid2">'+
      card('Sarjaennätys', rec.set, r => r.sets+' × '+r.reps+(r.u||'')+' · '+dateFi(r.date))+
      (isTime(hx)
        ? '<div class="card pad"><div class="eyebrow">Pisin pito</div>'+
            (h.length ? '<div class="num" style="font-size:24px;margin-top:2px">'+fmt(Math.max(...h.map(r=>r.e1)))+' s</div>'
                      : '<div style="font-size:14px;color:var(--faint);margin-top:6px">Ei vielä</div>')+'</div>'
        : card('Maksimiennätys', rec.max, r => '1 toisto · '+dateFi(r.date)))+
    '</div>'));
    const c = el('<div class="card"></div>');
    c.innerHTML = [...h].reverse().map(r =>
      '<div class="pad" style="border-top:1px solid var(--line);display:flex;gap:12px;align-items:baseline">'+
        '<div style="flex:none;width:74px;font-size:13px;color:var(--dim)">'+dateFi(r.date)+'</div>'+
        '<div class="num" style="flex:1">'+r.sets.map(t=> isWarm(r.x)||isTime(r.x) ? fmtSet(r.x,t) : fmt(t.w)+"×"+t.r).join("   ")+'</div>'+
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
      const head =
          '<div style="display:flex;align-items:center;gap:8px">'+
            '<span class="idx">'+(i+1)+'</span>'+
            '<button class="btn sm ghost" data-mv="'+i+'" data-dir="-1" '+(p.ex.length<2?"disabled":"")+' aria-label="'+(i===0?"Siirrä viimeiseksi":"Siirrä ylös")+'">↑</button>'+
            '<button class="btn sm ghost" data-mv="'+i+'" data-dir="1" '+(p.ex.length<2?"disabled":"")+' aria-label="'+(i===p.ex.length-1?"Siirrä ensimmäiseksi":"Siirrä alas")+'">↓</button>'+
            '<button class="btn sm ghost" data-delex="'+i+'" style="margin-left:auto">Poista</button>'+
          '</div>'+
          '<label class="f"><span class="eyebrow">'+(isWarm(x)?'Lämmittely':'Liike'+(MG[x.name]?" · "+esc(MG[x.name]):""))+'</span>'+
            '<div style="display:flex;gap:8px"><input data-x="name" value="'+esc(x.name)+'">'+
            '<button class="btn sm" data-swap="'+i+'" style="flex:none">Vaihda</button></div></label>';
      if(isWarm(x)){
        body.appendChild(el(
          '<div class="card pad stack" data-exi="'+i+'">'+head+
            '<div class="grid2">'+
              '<label class="f"><span class="eyebrow">Väline</span><select data-x="equip">'+
                EQUIPS.map(q=>'<option '+(q===x.equip?"selected":"")+'>'+q+'</option>').join("")+'</select></label>'+
              '<label class="f"><span class="eyebrow">Kesto min</span><input inputmode="decimal" data-x="min" value="'+fmt(x.min||5)+'"></label>'+
            '</div>'+
            '<label class="f"><span class="eyebrow">Muistilista · yksi kohta per rivi</span>'+
              '<textarea data-x="list" rows="'+Math.max(3,(x.list||[]).length+1)+'" placeholder="esim. Käsien pyöritys 10 + 10">'+
              esc((x.list||[]).join("\n"))+'</textarea></label>'+
          '</div>'));
        return;
      }
      const tl = isTime(x) ? "Sekunnit" : "Toistot";
      body.appendChild(el(
        '<div class="card pad stack" data-exi="'+i+'">'+
          head+
          '<div class="grid2">'+
            '<label class="f"><span class="eyebrow">Väline</span><select data-x="equip">'+
              EQUIPS.map(q=>'<option '+(q===x.equip?"selected":"")+'>'+q+'</option>').join("")+'</select></label>'+
            '<label class="f"><span class="eyebrow">Askel kg</span><input inputmode="decimal" data-x="step" value="'+fmt(x.step||STEPS[x.equip]||2.5)+'"></label>'+
          '</div>'+
          '<div class="grid2">'+
            '<label class="f"><span class="eyebrow">Sarjat</span><input inputmode="numeric" data-x="sets" value="'+x.sets+'"></label>'+
            '<label class="f"><span class="eyebrow">'+(x.equip==="kehonpaino"?"Lisäpaino kg":"Aloituspaino kg")+(x.equip==="käsipaino"?" / käsi":"")+'</span><input inputmode="decimal" data-x="w" value="'+fmt(x.w)+'"></label>'+
          '</div>'+
          '<div class="grid2">'+
            '<label class="f"><span class="eyebrow">'+tl+' väh.</span><input inputmode="numeric" data-x="rmin" value="'+x.rmin+'"></label>'+
            '<label class="f"><span class="eyebrow">'+tl+' enint.</span><input inputmode="numeric" data-x="rmax" value="'+x.rmax+'"></label>'+
          '</div>'+
          '<label class="f"><span class="eyebrow">Mittari</span><select data-x="unit">'+
            '<option value=""'+(isTime(x)?'':' selected')+'>toistot</option>'+
            '<option value="s"'+(isTime(x)?' selected':'')+'>sekunnit (pito)</option></select></label>'+
          (isAuto()
            ? '<div class="autobox">'+
                '<div class="eyebrow">Automaattitila</div>'+
                '<div class="grid2">'+
                  '<label class="f"><span class="eyebrow">Oma haarukka väh.</span>'+
                    '<input inputmode="numeric" data-x="autoRmin" placeholder="'+S.settings.autoRmin+'" value="'+(x.autoRmin||'')+'"></label>'+
                  '<label class="f"><span class="eyebrow">Oma haarukka enint.</span>'+
                    '<input inputmode="numeric" data-x="autoRmax" placeholder="'+S.settings.autoRmax+'" value="'+(x.autoRmax||'')+'"></label>'+
                '</div>'+
                '<label class="chkrow"><input type="checkbox" data-xc="amrap"'+(x.noAmrap?'':' checked')+'>'+
                  '<span>Viimeinen sarja maksimiin</span></label>'+
              '</div>'
            : '')+
        '</div>'));
    });
    body.appendChild(el('<div class="grid2">'+
      '<button class="btn" data-addex="1">+ Liikepankista</button>'+
      '<button class="btn ghost" data-addcustom="1">+ Oma liike</button></div>'));
    body.appendChild(el('<button class="btn wide primary" data-savep="1">Tallenna ohjelma</button>'));
    body.appendChild(el('<button class="btn wide ghost" data-delp="1">Poista ohjelma</button>'));
  }


  if(s.type==="quick"){
    const q = route.quick = route.quick || {groups:(lowGroups(3).map(x => x.g).length ? lowGroups(3).map(x => x.g) : ["Rinta","Selkä"]), n:6, warm:true, out:null};
    bar.innerHTML = '<h2>Pikaohjelma</h2><button class="btn sm ghost" data-close="1">'+I.x+'</button>';
    body.appendChild(el(
      '<div class="card pad">'+
        '<div class="eyebrow">Lihasryhmät</div>'+
        '<p style="font-size:13px;color:var(--dim);margin:4px 0 10px">Suluissa viimeisen 7 päivän sarjat (epäsuorat puolikkaina). '+
          'Tuottava alue on noin 10–20 sarjaa viikossa per lihasryhmä. Vähiten treenatut on esivalittu.</p>'+
        '<div class="qgrid">'+(function(){ const v = weekVolume(7); return QG.map(g => { const n = v[g].direct + v[g].indirect;
          return '<label class="chkrow"><input type="checkbox" data-qg="'+esc(g)+'"'+(q.groups.includes(g)?' checked':'')+'>'+
            '<span>'+esc(g)+' <span class="num" style="color:var(--dim);font-size:12.5px">('+fmt(n)+')</span></span></label>'; }).join(""); })()+
        '</div>'+
        '<div class="grid2" style="margin-top:12px">'+
          '<label class="f"><span class="eyebrow">Liikkeitä</span><input inputmode="numeric" data-qn="1" value="'+q.n+'"></label>'+
          '<label class="chkrow" style="align-self:end;padding-bottom:10px"><input type="checkbox" data-qw="1"'+(q.warm?' checked':'')+'><span>Lämmittely alkuun</span></label>'+
        '</div>'+
        '<button class="btn wide primary" data-qgen="1" style="margin-top:12px">'+(q.out ? 'Arvo uudelleen' : 'Arvo ohjelma')+'</button>'+
      '</div>'));
    if(q.out){
      const o = q.out;
      const c = el('<div class="card"></div>');
      c.innerHTML = '<div class="pad" style="padding-bottom:6px"><div class="eyebrow">'+esc(o.program.name)+' · '+esc(o.program.est)+' · '+o.totalSets+' sarjaa</div></div>'+
        o.program.ex.map((x, i) => {
          const pk = o.picks.find(p => p.def === x);
          return '<div class="pad" style="border-top:1px solid var(--line);display:flex;gap:10px;align-items:flex-start">'+
            '<span class="idx">'+(i+1)+'</span>'+
            '<div style="flex:1;min-width:0"><div style="font-weight:600">'+esc(x.name)+'</div>'+
            '<div style="font-size:12.5px;color:var(--dim)">'+
              (isWarm(x) ? 'lämmittely · '+x.min+' min' :
                '<span class="num">'+x.sets+' × '+(isAuto() && x.autoRmin ? x.autoRmin+'–'+x.autoRmax : reps(x))+repUnit(x)+
                (x.w ? ' · '+fmt(x.w)+' kg' : '')+'</span>'+(pk ? ' · '+esc(pk.g.split(" ")[0])+' · '+esc(pk.why) : ''))+
            '</div></div></div>';
        }).join("");
      body.appendChild(c);
      body.appendChild(el('<button class="btn wide primary" data-qsave="1">Tallenna ja muokkaa</button>'));
      body.appendChild(el('<p style="font-size:12.5px;color:var(--dim);margin:0 4px">Painot tulevat liikkeen omasta historiasta. '+
        'Uusissa liikkeissä paino on 0 — aseta se muokkauksessa tai ensimmäisessä treenissä. Ohjelmaa voi muokata kuten muitakin.</p>'));
    }
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
        (have.has(i.n) ? '<span class="pill good">Ohjelmassa</span>' : '<span class="pill">'+esc(i.u==="s" ? i.e+" · s" : i.e)+'</span>')+
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
  if(d.quick){ route.quick = null; route.sheet={type:"quick"}; openSheet(); return; }
  if(d.quicklow){ route.quick = {groups:lowGroups(3).map(x => x.g), n:6, warm:true, out:null}; route.tab = "ohjelmat"; route.sheet={type:"quick"}; render(); openSheet(); return; }
  if(d.qgen){
    const q = route.quick; const root = document.getElementById("sheetbg");
    q.groups = [...root.querySelectorAll("[data-qg]:checked")].map(i => i.dataset.qg);
    q.n = Math.min(14, Math.max(1, parseInt(root.querySelector("[data-qn]").value, 10) || 6));
    q.warm = root.querySelector("[data-qw]").checked;
    if(!q.groups.length){ toast("Valitse ainakin yksi lihasryhmä."); return; }
    q.out = quickGenerate(q.groups, q.n, q.warm);
    openSheet(); return;
  }
  if(d.qsave){
    const q = route.quick; if(!q || !q.out) return;
    S.programs.push(q.out.program); save();
    route.sheet = {type:"program", id:q.out.program.id}; route.quick = null;
    render(); openSheet(); toast("Pikaohjelma tallennettu."); return;
  }
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
  if(d.wchk!==undefined){
    const x = S.active.ex[+d.wchk], j = +d.wj;
    x.chk = x.chk || (x.list||[]).map(()=>false);
    x.chk[j] = !x.chk[j]; save(); render(); return;
  }
  if(d.addset!==undefined){ const x=S.active.ex[+d.addset]; const last=x.sets[x.sets.length-1]; x.sets.push({w:last?last.w:0, r:last?last.r:x.rmax, ok:false}); reAmrap(x); save(); render(); return; }
  if(d.delset!==undefined){ const x=S.active.ex[+d.delset]; for(let i=x.sets.length-1;i>=0;i--){ if(!x.sets[i].ok){ x.sets.splice(i,1); break; } } reAmrap(x); save(); render(); return; }
  if(d.skip!==undefined){ S.active.ex[+d.skip].skip=true; route.openEx=null; save(); render(); return; }
  if(d.unskip!==undefined){ S.active.ex[+d.unskip].skip=false; save(); render(); return; }
  if(d.finish){
    const left = S.active.ex.reduce((a,x)=> a + (x.skip?0:x.sets.filter(s=>!s.ok).length), 0);
    if(left && !await ask(left+" sarjaa on vielä kirjaamatta. Lopetetaanko treeni silti?","Lopeta")) return;
    finishWorkout(); return;
  }
  if(d.cancel){ if(await ask("Hylätäänkö treeni? Kirjatut sarjat katoavat.","Hylkää")){ S.active=null; save(); render(); releaseWake(); } return; }

  /* --- ohjelmaeditori --- */
  if(d.mv!==undefined){
    const p=curProg(), n=p.ex.length, i=+d.mv, dir=+d.dir;
    if(n<2) return;
    readProgForm(p);
    /* Reunalla liike kiertää toiseen päähän: viimeinen alas → ensimmäiseksi,
       ensimmäinen ylös → viimeiseksi. Muuten lisätty liike pitäisi nytkyttää
       ylös pykälä kerrallaan. */
    const j = (i + dir + n) % n;
    if(Math.abs(j - i) === 1) [p.ex[i], p.ex[j]] = [p.ex[j], p.ex[i]];
    else p.ex.splice(j, 0, p.ex.splice(i, 1)[0]);
    save(); openSheet();
    /* Näkymä piirtyy uudelleen ylhäältä — viedään siirretty liike takaisin näkyviin. */
    const moved = document.querySelector('#sheetbg [data-exi="'+j+'"]');
    if(moved) moved.scrollIntoView({block:"center"});
    return;
  }
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
        const st = S.settings;
        S.active.ex.push(makeEntry(defFromLib(item, {sets:st.sets||3, rmin:st.rmin, rmax:st.rmax, w:0})));
        route.openEx = S.active.ex.length - 1;
        save();
      }
      closeSheet(); route.sheet = null; render();
      toast(item ? item.n + " lisätty treeniin." : "Liikettä ei löytynyt.");
      return;
    }

    const p = S.programs.find(x=>x.id===st.back.id);
    if(p && item){
      if(st.exi===null){ p.ex.push(defFromLib(item)); }
      else {
        const x = p.ex[st.exi];
        if(x){
          /* Lajityyppi vaihtuu (lämmittely ↔ liike, toistot ↔ sekunnit) → uudet oletukset. */
          if(!!item.warm !== isWarm(x) || (item.u==="s") !== isTime(x)){
            p.ex[st.exi] = Object.assign(defFromLib(item, {sets:x.sets||3, rmin:x.rmin||8, rmax:x.rmax||8, w:x.w||0}), {id:x.id});
          } else if(item.warm){ x.name = item.n; x.min = item.min || x.min; x.list = (item.list||[]).slice(); }
          else { x.name=item.n; x.equip=item.e; x.step=item.st || STEPS[item.e] || 2.5; }
        }
      }
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
  if(d.mode){
    S.settings.mode = d.mode;
    if(d.mode === "automaattinen" && !S.settings.cycleStart){
      S.settings.cycleStart = new Date().toISOString(); S.settings.skipDeload = null;
    }
    save(); render(); return;
  }
  if(d.newcycle){
    if(!await ask("Aloitetaanko uusi jakso tästä päivästä? Viikkolaskuri nollautuu.","Aloita")) return;
    S.settings.cycleStart = new Date().toISOString(); S.settings.skipDeload = null;
    save(); render(); toast("Uusi jakso aloitettu."); return;
  }
  if(d.skipdeload){
    const c = cycleInfo(); if(c){ S.settings.skipDeload = c.idx; save(); render(); toast("Kevennys ohitettu tältä jaksolta."); }
    return;
  }
  if(d.undodeload){ S.settings.skipDeload = null; save(); render(); return; }
  if(d.tog){ S.settings[d.tog] = !S.settings[d.tog]; save(); render(); return; }
  if(d.ctable){ route.ctable = !route.ctable; render(); return; }
  if(d.ser){
    route.hideSer = route.hideSer || {};
    const off = !route.hideSer[d.ser];
    if(off && SER.filter(x => !(route.hideSer[x.k]) && x.k !== d.ser).length === 0){
      toast("Ainakin yksi sarja on pidettävä näkyvissä.");
      return;
    }
    route.hideSer[d.ser] = off; render(); return;
  }
  if(d.applyall){
    const st = S.settings;
    if(!await ask("Asetetaanko "+st.sets+" × "+(st.rmin===st.rmax?st.rmin:st.rmin+"–"+st.rmax)+
                  " kaikkiin liikkeisiin kaikissa ohjelmissa?","Aseta")) return;
    S.programs.forEach(p => p.ex.forEach(x => { if(isWarm(x) || isTime(x)) return; x.sets = st.sets; x.rmin = st.rmin; x.rmax = st.rmax; }));
    save(); render(); toast("Asetettu kaikkiin liikkeisiin.");
    return;
  }
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
  val = f==="w" ? nextWeight(x, val, dir) : Math.max(0, val + dir * repInc(x));
  s[f] = val; inp.value = f==="w" ? fmt(val) : val;
  save();
});

/* kuvaajan ristikohdistin */
document.addEventListener("pointermove", e => {
  const hit = e.target.closest && e.target.closest("[data-pt]");
  if(hit) chartHover(+hit.dataset.pt);
});
document.addEventListener("pointerdown", e => {
  const hit = e.target.closest && e.target.closest("[data-pt]");
  if(hit) chartHover(+hit.dataset.pt);
});
document.addEventListener("pointerleave", e => {
  if(e.target && e.target.id === "devchart") hideHover();
}, true);

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
  if(inp.dataset && inp.dataset.mg){ route.mg = inp.value; render(); return; }
  if(inp.dataset && inp.dataset.dw){
    S.settings.deloadWeeks = parseInt(inp.value, 10) || 0; save(); render(); return;
  }
  if(inp.dataset && inp.dataset.set){
    let v = parseInt(String(inp.value).replace(/[^0-9]/g, ""), 10);
    if(isNaN(v) || v < 1) v = 1;
    if(v > 50) v = 50;
    S.settings[inp.dataset.set] = v;
    if(S.settings.rmax < S.settings.rmin) S.settings.rmax = S.settings.rmin;
    if(S.settings.autoRmax < S.settings.autoRmin) S.settings.autoRmax = S.settings.autoRmin;
    save(); render();
    return;
  }
  if(inp.dataset && (inp.dataset.x === "equip" || inp.dataset.x === "unit") && route.sheet && route.sheet.type === "program"){
    const p = curProg(); if(!p) return;
    const box = inp.closest("[data-exi]"); const x = box && p.ex[+box.dataset.exi];
    const wasTime = isTime(x), wasWarm = isWarm(x);
    readProgForm(p);
    if(x && wasWarm && !isWarm(x)) Object.assign(x, {sets:3, rmin:8, rmax:8, w:0, step:STEPS[x.equip] || 2.5});
    /* Toistoista sekunteihin: 8 sekunnin pito ei ole järkevä tavoite. */
    if(x && isTime(x) && !wasTime && x.rmax <= 20) Object.assign(x, TIME_R);
    if(x && !isTime(x) && wasTime && x.rmin >= 20){ x.rmin = 8; x.rmax = 8; delete x.autoRmin; delete x.autoRmax; }
    save(); openSheet(); return;
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
      else if(k==="unit"){ if(i.value === "s") x.unit = "s"; else delete x.unit; }
      else if(k==="list") x.list = i.value.split("\n").map(t => t.trim()).filter(Boolean);
      else { let v = parseFloat(String(i.value).replace(",",".")); x[k] = isNaN(v)?0:v; }
    });
    box.querySelectorAll("[data-xc]").forEach(i => {
      if(i.dataset.xc === "amrap") x.noAmrap = !i.checked;
    });
    if(x.equip === "lämmittely"){
      x.warm = true; delete x.unit;
      x.min = Math.max(1, x.min || 5); x.list = x.list || [];
      x.sets = 1; x.rmin = 1; x.rmax = 1; x.w = 0; x.step = 0;
      return;
    }
    delete x.warm; delete x.min; delete x.list;
    if(x.equip === "käsipaino"){ x.w = snapDumbbell(x.w); x.step = 1; }
    if(!x.step) x.step = STEPS[x.equip] || 2.5;
    x.sets = Math.max(1, Math.round(x.sets));
    x.rmin = Math.max(1, Math.round(x.rmin)); x.rmax = Math.max(x.rmin, Math.round(x.rmax));
    /* Tyhjä oma haarukka = käytetään yleistä. Molemmat tai ei kumpaakaan. */
    x.autoRmin = Math.round(x.autoRmin || 0); x.autoRmax = Math.round(x.autoRmax || 0);
    if(!x.autoRmin || !x.autoRmax){ delete x.autoRmin; delete x.autoRmax; }
    else if(x.autoRmax < x.autoRmin) x.autoRmax = x.autoRmin;
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
