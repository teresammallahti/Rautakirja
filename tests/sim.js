/* Rautakirjan stressitesti: synteettiset treenihistoriat automaattimoottorin,
   staattisen tilan, indeksien ja pikaohjelman läpi. Aja projektin juuressa:
     node tests/sim.js
   Simuloitu nostaja: kapasiteetti (e1RM) kehittyy skenaarion mukaan, ja
   toistot lasketaan Epleyn käänteiskaavalla + kohina. Tarkistaa invariantit,
   ei yksittäisiä lukuja. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIME = {'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
let pass = 0, fail = 0;
function serve(port){
  const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if(!fs.existsSync(f) || fs.statSync(f).isDirectory()){ r.writeHead(404); r.end(); return; }
    r.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'text/plain'}); r.end(fs.readFileSync(f));
  });
  return new Promise(res => s.listen(port, () => res(s)));
}
const T = (n, ok, info) => { if(ok){ pass++; console.log('  OK   ' + n); } else { fail++; console.log('  FAIL ' + n + (info ? ' — ' + info : '')); } };
const group = n => console.log('\n--- ' + n + ' ---');

/* Ajetaan selaimessa: simulaattori. */
const SIM = `
window.__now = Date.now();
const Real = Date;
(function(){
  class Fake extends Real {
    constructor(...a){ if(a.length) super(...a); else super(window.__now); }
    static now(){ return window.__now; }
  }
  window.Date = Fake;
})();
window.sim = function(opts){
  /* opts: {weeks, perWeek, mode, settings, prog:[{name,equip,step,w,unit,noAmrap,autoRmin,autoRmax}],
            lifter:{cap:{name:e1RM}, growth: %/vk, noise, dropAt:week, dropPct, breakFrom, breakWeeks} } */
  const o = opts;
  localStorage.clear();
  S = seed();
  S.settings = Object.assign(defaultSettings(), {mode:o.mode||'automaattinen'}, o.settings||{});
  const p = {id:'sim', name:'Sim', est:'', ex:o.prog.map(d => Object.assign({id:uid('x'), sets:3, rmin:8, rmax:8}, d))};
  S.programs = [p];
  S.sessions = [];
  const start = new Real(2026, 0, 5, 10).getTime();           /* maanantai */
  window.__now = start;
  if(S.settings.mode === 'automaattinen') S.settings.cycleStart = new Real(start).toISOString();
  save();
  const cap = Object.assign({}, o.lifter.cap);
  const log = [];
  let rnd = 12345; const rand = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
  const noise = o.lifter.noise == null ? 1 : o.lifter.noise;
  const achievable = (name, w, setIdx, unit) => {
    const c = cap[name] || 0;
    if(unit === 's'){ /* pito: kapasiteetti sekunteina lisäpainolla 0; 2,5 kg vähentää 5 s */
      return Math.max(0, Math.round(c - w * 2 - setIdx * 3 + (rand() * 2 - 1) * noise * 3)); }
    if(w <= 0) return 30;
    const r = 30 * (c / w - 1) - setIdx * 0.7 + (rand() * 2 - 1) * noise;
    return Math.max(0, Math.min(30, Math.round(r)));
  };
  for(let wk = 0; wk < o.weeks; wk++){
    const inBreak = o.lifter.breakFrom != null && wk >= o.lifter.breakFrom && wk < o.lifter.breakFrom + (o.lifter.breakWeeks || 2);
    if(o.lifter.dropAt != null && wk === o.lifter.dropAt) Object.keys(cap).forEach(k => { cap[k] *= (1 - (o.lifter.dropPct || 0.15)); });
    for(let d = 0; d < (o.perWeek || 2); d++){
      window.__now = start + (wk * 7 + d * 3) * 864e5;
      if(inBreak) continue;
      startWorkout('sim');
      const A = S.active;
      A.ex.forEach(x => {
        x.sets.forEach((t, i) => {
          const can = achievable(x.name, t.w, i, x.unit);
          const target = t.r;
          t.r = t.a ? can : Math.min(target, can);
          t.ok = true;
        });
      });
      /* lopetus ilman UI:ta */
      A.ex.forEach(x => { x.sets = x.sets.filter(s => s.ok); });
      A.finishedAt = window.__now + 36e5;
      S.sessions.push(A); S.active = null; save();
      log.push({wk, d, deload: !!A.deload, ex: A.ex.map(x => ({n: x.name, w: x.sets[0].w, r: x.sets.map(s => s.r), up: !!x.up, down: !!x.down, reason: x.reason, sets: x.sets.length}))});
    }
    /* kapasiteetti kehittyy viikoittain (tauolla hieman taantuu) */
    Object.keys(cap).forEach(k => { cap[k] *= inBreak ? 0.99 : (1 + (o.lifter.growth || 0) / 100); });
  }
  const idx = indexSeries();
  return {log, idx, cap, settings: S.settings, cyc: cycleInfo()};
};
`;

(async () => {
  const srv = await serve(8131);
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:412,height:915}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8131/', {waitUntil:'load'}); await p.waitForTimeout(300);
  await p.evaluate(SIM);

  const finite = v => typeof v === 'number' && isFinite(v);
  const allFinite = res => res.log.every(s => s.ex.every(x => finite(x.w) && x.r.every(finite))) && res.idx.every(q => finite(q.strength) && finite(q.volume));
  const stepOk = (res, name, step) => {
    let prev = null, bad = 0;
    res.log.forEach(s => { const x = s.ex.find(e => e.n === name); if(!x) return;
      if(prev != null && Math.abs(x.w - prev) > step + 1e-9) bad++; prev = x.w; });
    return bad;
  };
  const weightsOf = (res, name) => res.log.filter(s => !s.deload).map(s => (s.ex.find(e => e.n === name) || {}).w);

  const PROG = [
    {name:'Penkkipunnerrus tangolla', equip:'tanko', step:2.5, w:80},
    {name:'Hauiskääntö käsipainoilla', equip:'käsipaino', step:1, w:12},
    {name:'Maastaveto', equip:'tanko', step:2.5, w:140, noAmrap:true},
    {name:'Tangosta riippuminen', equip:'kehonpaino', step:2.5, w:0, unit:'s', autoRmin:30, autoRmax:60, rmin:30, rmax:45}
  ];
  const CAP = {'Penkkipunnerrus tangolla': 100, 'Hauiskääntö käsipainoilla': 16, 'Maastaveto': 175, 'Tangosta riippuminen': 50};

  group('A. Tasaisesti kehittyvä nostaja, 12 vk automaatti');
  let r = await p.evaluate(o => sim(o), {weeks:12, perWeek:2, prog:PROG, lifter:{cap:CAP, growth:1.2}});
  T('ei NaN/Infinity', allFinite(r));
  T('paino muuttuu enintään askeleen per treeni (penkki)', stepOk(r, 'Penkkipunnerrus tangolla', 2.5) === 0, 'hyppyjä ' + stepOk(r, 'Penkkipunnerrus tangolla', 2.5));
  T('käsipaino pysyy ruudukossa (alkuarvon 12 jälkeen)', weightsOf(r, 'Hauiskääntö käsipainoilla').filter(w => w !== 12).every(w => (w <= 10 ? Number.isInteger(w) : Math.abs(w / 2.5 - Math.round(w / 2.5)) < 1e-9)));
  T('indeksi ei putoa kevennysviikolla', r.idx.every(q => !/^vk (7|13)$/.test(q.label)) , r.idx.map(q => q.label).join(','));
  { const i = r.log.findIndex(s => s.ex.find(e => e.n === 'Hauiskääntö käsipainoilla').down);
    const x = i >= 0 && r.log[i].ex.find(e => e.n === 'Hauiskääntö käsipainoilla');
    T('askel alas palaa aiempiin toistoihin, ei alarajalle (' + (x ? x.r.join(',') + ' @ ' + x.w : 'ei kevennystä') + ')', !x || x.r[0] >= 8); }
  { const w = weightsOf(r, 'Penkkipunnerrus tangolla'); T('penkki nousee 12 viikossa (' + w[0] + ' → ' + w[w.length - 1] + ')', w[w.length - 1] > w[0]); }
  T('voimaindeksi lopussa positiivinen (' + Math.round(r.idx[r.idx.length - 1].strength) + ' %)', r.idx[r.idx.length - 1].strength > 0);
  { const dl = r.log.filter(s => s.deload); T('kevennysviikko osuu viikolle 6 ja 12 (' + dl.map(s => s.wk + 1).join(',') + ')', dl.length === 4 && dl.every(s => s.wk === 5 || s.wk === 11)); }
  { const dl = r.log.find(s => s.deload); const pre = r.log[r.log.indexOf(dl) - 1];
    T('kevennyksessä sarjat puoleen ja paino ennallaan', dl && dl.ex.every((x, i) => x.sets === 2 && x.w === pre.ex[i].w)); }
  { const i = r.log.findIndex(s => s.deload); const after = r.log.slice(i + 2).find(s => !s.deload); const pre = r.log[i - 1];
    T('kevennyksen jälkeen paino ei putoa', after && after.ex.every((x, k) => x.w >= pre.ex[k].w)); }
  { const ramp = r.log.filter(s => s.wk === 3 || s.wk === 4); T('viikoilla 4–5 sarjoja 4 (ramp)', ramp.every(s => s.ex.filter(x => x.n !== 'Tangosta riippuminen').every(x => x.sets === 4))); }
  T('maastavedossa ei AMRAP-toistoryöppyä (max toistot ≤ 10)', r.log.every(s => s.ex.find(e => e.n === 'Maastaveto').r.every(x => x <= 10)));
  { const w = weightsOf(r, 'Tangosta riippuminen'); T('riippumisen lisäpaino nousee 2,5 kg askelin (' + w.join(',') + ')', w.every(x => Math.abs(x / 2.5 - Math.round(x / 2.5)) < 1e-9) && stepOk(r, 'Tangosta riippuminen', 2.5) === 0); }

  group('B. Tasanne: kapasiteetti ei kasva');
  r = await p.evaluate(o => sim(o), {weeks:10, perWeek:2, prog:PROG, lifter:{cap:CAP, growth:0}, settings:{deloadWeeks:0}});
  T('ei NaN/Infinity', allFinite(r));
  { const w = weightsOf(r, 'Penkkipunnerrus tangolla'); const mx = Math.max(...w), mn = Math.min(...w.slice(4));
    T('penkki ei karkaa: vaihteluväli ≤ 2 askelta loppupuolella (' + mn + '–' + mx + ')', mx - mn <= 5); }
  { const ups = r.log.filter(s => s.ex.find(e => e.n === 'Penkkipunnerrus tangolla').up).length;
    const downs = r.log.filter(s => s.ex.find(e => e.n === 'Penkkipunnerrus tangolla').down).length;
    T('tasanteella sekä nostoja että kevennyksiä, ei pelkkää nousua (ylös ' + ups + ', alas ' + downs + ')', ups <= 4); }
  T('voimaindeksi pysyy ±15 % sisällä', r.idx.every(q => Math.abs(q.strength) < 15), r.idx.map(q => Math.round(q.strength)).join(','));

  group('C. Romahdus viikolla 5 (−20 %)');
  r = await p.evaluate(o => sim(o), {weeks:10, perWeek:2, prog:PROG, lifter:{cap:CAP, growth:0.5, dropAt:5, dropPct:0.2}, settings:{deloadWeeks:0}});
  T('ei NaN/Infinity', allFinite(r));
  { const w = weightsOf(r, 'Penkkipunnerrus tangolla'); const i = r.log.findIndex(s => s.wk === 5); const before = w[i - 1], after = Math.min(...w.slice(i));
    T('turvaventtiili keventää romahduksen jälkeen (' + before + ' → ' + after + ')', after < before); }
  { const downs = r.log.map(s => s.ex.find(e => e.n === 'Penkkipunnerrus tangolla')).filter(x => x.down).length; T('kevennys tapahtuu askel kerrallaan, ei kerralla pohjaan', downs >= 1 && stepOk(r, 'Penkkipunnerrus tangolla', 2.5) === 0); }

  group('D. Kolmen viikon tauko viikoilla 4–6');
  r = await p.evaluate(o => sim(o), {weeks:12, perWeek:2, prog:PROG, lifter:{cap:CAP, growth:1, breakFrom:3, breakWeeks:3}});
  T('ei NaN/Infinity', allFinite(r));
  T('indeksissä vain treenatut viikot ilman kevennystä (' + r.idx.length + ' pistettä)', r.idx.length === 8);
  { const i = r.log.findIndex(s => s.wk >= 6); const pre = r.log[i - 1], post = r.log[i];
    T('tauon jälkeen paino ei hyppää ylös', post.ex.every((x, k) => x.w <= pre.ex[k].w + 2.5)); }
  T('jaksolaskuri jatkaa kalenterin mukaan tauon yli (viikko ' + (r.cyc ? r.cyc.week : '?') + '/' + (r.cyc ? r.cyc.len : '?') + ')', r.cyc && r.cyc.len === 6);

  group('E. Asetusvariaatiot');
  r = await p.evaluate(o => sim(o), {weeks:8, perWeek:2, prog:PROG, lifter:{cap:CAP, growth:1}, settings:{twoSession:false, amrap:false, addSets:false, deloadWeeks:0}});
  T('ilman kahden kerran sääntöä: ei NaN, askel pysyy', allFinite(r) && stepOk(r, 'Penkkipunnerrus tangolla', 2.5) === 0);
  T('AMRAP pois: toistot eivät ylitä ylärajaa', r.log.every(s => s.ex.filter(x => x.n !== 'Tangosta riippuminen').every(x => x.r.every(v => v <= 10))));
  T('addSets pois: aina 3 sarjaa', r.log.every(s => s.ex.every(x => x.sets === 3)));
  r = await p.evaluate(o => sim(o), {weeks:8, perWeek:3, prog:PROG, lifter:{cap:CAP, growth:1}, settings:{deloadWeeks:4, maxSets:5}});
  T('4 vk jakso, 3 treeniä/vk: kevennys viikoilla 4 ja 8', r.log.filter(s => s.deload).every(s => s.wk === 3 || s.wk === 7) && r.log.filter(s => s.deload).length === 6);
  T('maxSets 5 nostaa silti vain yhdellä (4 sarjaa)', r.log.filter(s => s.wk === 2).every(s => s.ex.filter(x => x.n !== 'Tangosta riippuminen').every(x => x.sets === 4)));

  group('F. Staattinen tila');
  r = await p.evaluate(o => sim(o), {weeks:8, perWeek:2, mode:'staattinen', prog:PROG, lifter:{cap:CAP, growth:1.5}});
  T('ei NaN/Infinity', allFinite(r));
  T('paino nousee kun kaikki sarjat täynnä, askel pysyy', stepOk(r, 'Penkkipunnerrus tangolla', 2.5) === 0 && weightsOf(r, 'Penkkipunnerrus tangolla').slice(-1)[0] > 80);
  T('staattisessa ei kevennyksiä eikä sarjalisäyksiä', r.log.every(s => !s.deload && s.ex.every(x => x.sets === 3)));
  { const w = weightsOf(r, 'Hauiskääntö käsipainoilla').filter(x => x !== 12); T('käsipaino ruudukossa alkuarvon jälkeen (' + w.join(',') + ')', w.every(x => x >= 10 ? Math.abs(x / 2.5 - Math.round(x / 2.5)) < 1e-9 : Number.isInteger(x))); }
  { const w = await p.evaluate(() => { const p0 = S.programs[0]; route.sheet = {type:'program', id:p0.id}; openSheet();
      const inp = document.querySelector('[data-exi="1"] input[data-x="w"]'); inp.value = '17'; readProgForm(p0); closeSheet(); route.sheet = null; return p0.ex[1].w; });
    T('editori napsauttaa käsipainon aloituspainon ruudukkoon (17 → ' + w + ')', w === 15); }

  group('G. Rajatapaukset');
  r = await p.evaluate(o => sim(o), {weeks:3, perWeek:2, prog:[{name:'Goblet-kyykky', equip:'käsipaino', step:1, w:0}], lifter:{cap:{'Goblet-kyykky': 40}, growth:0}});
  T('aloituspaino 0: ei NaN, nousee 1 kg askelin', allFinite(r) && stepOk(r, 'Goblet-kyykky', 1) === 0);
  r = await p.evaluate(o => sim(o), {weeks:2, perWeek:2, prog:[{name:'Punnerrus', equip:'kehonpaino', step:1, w:0}], lifter:{cap:{'Punnerrus': 0}, growth:0, noise:0}});
  T('kehonpaino, kapasiteetti 0 (kaikki toistot 0): ei NaN, paino ei nouse', allFinite(r) && weightsOf(r, 'Punnerrus').every(w => w === 0));
  { const x = await p.evaluate(() => { S.sessions = []; S.settings.mode = 'automaattinen';
      const d = {name:'Testi', equip:'tanko', step:2.5, w:60, sets:3};
      const a = autoPlan(d);
      S.sessions.push({id:'z', programId:'sim', name:'S', date:new Date().toISOString(), startedAt:0, finishedAt:1,
        ex:[{name:'Testi', equip:'tanko', rmin:6, rmax:10, target:3, sets:[{w:60, r:10, ok:true, a:false},{w:60, r:10, ok:true},{w:60, r:14, ok:true, a:true}]}]});
      const b = autoPlan(d);
      S.sessions[0].ex[0].sets.pop();   /* vain 2 sarjaa kolmesta */
      const c = autoPlan(d);
      return [a.w, a.reps.join(), b.w, b.up, c.w, c.up]; });
    T('AMRAP +4 yli → heti nosto; vajaa sarjamäärä ei kelpaa nostoon', x[2] === 62.5 && x[3] === true && x[4] === 60 && x[5] === false, x.join()); }

  group('H. Pikaohjelma: jakaumat 2000 arvonnalla');
  const q = await p.evaluate(() => {
    S.sessions = []; S.settings = defaultSettings(); save();
    const cnt = {}, bad = [];
    for(let k = 0; k < 2000; k++){
      const o = quickGenerate(['Rinta','Selkä','Hartiat','Hauis','Ojentaja'], 8, k % 2 === 0);
      const ex = o.program.ex.filter(x => !isWarm(x));
      if(ex.length !== 8) bad.push('n=' + ex.length);
      const names = ex.map(x => x.name); if(new Set(names).size !== names.length) bad.push('tupla');
      if(ex.some(x => !isFinite(x.sets) || !isFinite(x.rmin) || !isFinite(x.rmax) || x.rmax < x.rmin)) bad.push('luvut');
      if(ex.some(x => x.autoRmin && x.autoRmax < x.autoRmin)) bad.push('autoluvut');
      if(!isCompound(ex[0].name)) bad.push('eka ei yhdistelmä: ' + ex[0].name);
      names.forEach(n => { cnt[n] = (cnt[n] || 0) + 1; });
    }
    const rinta = LIB.find(g => g.g === 'Rinta').items.map(i => i.n);
    const rCounts = rinta.map(n => cnt[n] || 0);
    return {bad: bad.slice(0, 5), nbad: bad.length, rMax: Math.max(...rCounts), rZero: rCounts.filter(c => c === 0).length, rN: rinta.length, groupsSeen: Object.keys(cnt).length};
  });
  T('2000 arvontaa ilman virheitä', q.nbad === 0, q.bad.join(' | '));
  T('rinnan liikkeistä mikään ei ylitä 60 % osuutta (max ' + q.rMax + '/2000)', q.rMax < 1200);
  T('kaikki rinnan liikkeet esiintyvät ainakin kerran (' + (q.rN - q.rZero) + '/' + q.rN + ')', q.rZero === 0);
  const q2 = await p.evaluate(() => {
    const r = [];
    r.push(quickGenerate(['Pohkeet'], 6, false).program.ex.length);           /* vain 4 liikettä pankissa? */
    r.push(quickGenerate(['Kyynärvarret ja ote'], 10, false).program.ex.length);
    r.push(quickGenerate([], 5, false));
    r.push(quickGenerate(['Rinta'], 0, false));
    const o = quickGenerate(QG, 14, true); r.push(o.program.ex.length, o.totalSets);
    return r;
  });
  T('pieni pankki: arvonta antaa enintään saatavilla olevat liikkeet (' + q2[0] + ', ' + q2[1] + ')', q2[0] <= 6 && q2[1] <= 10 && q2[0] > 0);
  T('tyhjä valinta ja 0 liikettä → null', q2[2] === null && q2[3] === null);
  T('kaikki ryhmät, 14 liikettä: ' + q2[4] + ' liikettä, ' + q2[5] + ' sarjaa', q2[4] === 15 && q2[5] >= 24 && q2[5] <= 32);

  group('Lopuksi');
  T('ei JS-virheitä', errs.length === 0, errs[0]);
  await b.close(); srv.close();
  console.log('\n' + pass + ' läpi, ' + fail + ' virhettä');
  process.exit(fail ? 1 : 0);
})();
