/* Rautakirjan testit. Aja projektin juuressa:  node tests/run.js
   Vaatii playwrightin (npm install playwright). Käynnistää paikallisen
   palvelimen ja ajaa koko käyttöpolun oikeassa selaimessa. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIME = {'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'};
let pass = 0, fail = 0;

function serve(port){
  const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if(!fs.existsSync(f) || fs.statSync(f).isDirectory()){ r.writeHead(404); r.end(); return; }
    r.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'text/plain'});
    r.end(fs.readFileSync(f));
  });
  return new Promise(res => s.listen(port, () => res(s)));
}
const T = async (n, f) => {
  try { await f(); pass++; console.log('  OK   ' + n); }
  catch(e){ fail++; console.log('  FAIL ' + n + ' — ' + String(e.message).split('\n')[0]); }
};
const group = n => console.log('\n--- ' + n + ' ---');

(async () => {
  const srv = await serve(8110);
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:412,height:915}, isMobile:true, hasTouch:true, locale:'fi-FI'});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8110/', {waitUntil:'load'});
  await p.waitForTimeout(500);

  group('Perusnäkymät');
  await T('appi latautuu ilman JS-virheita', async () => { if(errs.length) throw new Error(errs[0]); });
  await T('kaksi ohjelmakorttia', async () => { const n = await p.locator('[data-start]').count(); if(n !== 2) throw new Error('n=' + n); });
  await T('valilehti on Asetukset, ei Data', async () => {
    const t = await p.textContent('#nav'); if(!/Asetukset/.test(t) || /\bData\b/.test(t)) throw new Error(t); });

  group('Kasipainojen painoruudukko');
  const wg = await p.evaluate(() => {
    const kp = {equip:'käsipaino'}, tanko = {equip:'tanko', step:2.5};
    return { up:[0,1,9,10,12.5,17].map(w => nextWeight(kp,w,1)),
             dn:[1,10,11,12.5,17,19].map(w => nextWeight(kp,w,-1)),
             tanko:[nextWeight(tanko,87.5,1), nextWeight(tanko,87.5,-1)],
             snap:[17,19,21].map(snapDumbbell) };
  });
  const eq = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  await T('ylos 0→1, 9→10, 10→12,5, 17→17,5', async () => { if(!eq(wg.up,[1,2,10,12.5,15,17.5])) throw new Error(JSON.stringify(wg.up)); });
  await T('alas 1→0, 10→9, 12,5→10, 17→15', async () => { if(!eq(wg.dn,[0,9,10,10,15,17.5])) throw new Error(JSON.stringify(wg.dn)); });
  await T('tanko ennallaan 2,5 kg askelin', async () => { if(!eq(wg.tanko,[90,85])) throw new Error(JSON.stringify(wg.tanko)); });
  await T('snapDumbbell 17→15, 19→17,5, 21→20', async () => { if(!eq(wg.snap,[15,17.5,20])) throw new Error(JSON.stringify(wg.snap)); });

  group('Ennatyslogiikka');
  const pr = await p.evaluate(() => {
    const mk = (id, d, sets) => ({id, programId:'t', name:'Testi', date:new Date(2026,0,d).toISOString(),
      startedAt:0, finishedAt:1, ex:[{id:'x1', name:'Hauis', equip:'tanko', step:2.5, target:3, rmin:8, rmax:8, sets}]});
    const S3 = w => [{w,r:8,ok:true},{w,r:8,ok:true},{w,r:8,ok:true}];
    const run = (sess) => { S.sessions = sess; const x = prsFor(sess[sess.length-1]);
      return [x.set.map(q=>q.w).join(','), x.max.map(q=>q.w).join(',')]; };
    const A = mk('a',1,S3(10)), B = mk('b',8,S3(12.5));
    const C = mk('c',15,[{w:15,r:8,ok:true},{w:15,r:8,ok:true},{w:15,r:6,ok:true}]);
    const D = mk('d',22,[{w:14,r:8,ok:true},{w:13,r:8,ok:true},{w:13,r:8,ok:true}]);
    const M1 = mk('m1',29,[{w:20,r:1,ok:true},{w:20,r:1,ok:true}]);
    const M2 = mk('m2',36,[{w:22.5,r:1,ok:true},{w:20,r:1,ok:true}]);
    return {base:run([A]), up:run([A,B]), short:run([A,B,C]), light:run([A,B,D]),
            mbase:run([A,B,M1]), mup:run([A,B,M1,M2])};
  });
  await T('ensimmainen suoritus on lahtotaso, ei ennatys', async () => { if(!eq(pr.base,['',''])) throw new Error(JSON.stringify(pr.base)); });
  await T('seuraava raskaampi tayssarja = sarjaennatys', async () => { if(!eq(pr.up,['12.5',''])) throw new Error(JSON.stringify(pr.up)); });
  await T('vajaa toistomaara mitatoi suorituksen', async () => { if(!eq(pr.short,['',''])) throw new Error(JSON.stringify(pr.short)); });
  await T('vaihtelevista painoista ratkaisee kevyin', async () => { if(!eq(pr.light,['13',''])) throw new Error(JSON.stringify(pr.light)); });
  await T('maksimipaiva ei riko sarjaennatysta', async () => { if(!eq(pr.mup,['','22.5'])) throw new Error(JSON.stringify(pr.mup)); });

  group('Kehitysindeksit');
  const ix = await p.evaluate(() => {
    const mk = (id, d, w, extra) => ({id, programId:'t', name:'Testi', date:new Date(2026,0,d).toISOString(),
      startedAt:0, finishedAt:1, ex:[{id:'x1', name:'Penkki', equip:'tanko', step:2.5, target:3, rmin:8, rmax:8,
        sets:[{w,r:8,ok:true},{w,r:8,ok:true},{w,r:8,ok:true}]}].concat(extra || [])});
    S.sessions = [mk('a',5,100), mk('b',12,105), mk('c',19,110)];
    const s = indexSeries();
    S.sessions = [mk('a',5,100)];
    const one = indexSeries();
    // liike jota ei tehty toisella viikolla ei saa pudottaa indeksia
    S.sessions = [
      mk('a',5,100,[{id:'x2',name:'Kyykky',equip:'tanko',step:2.5,target:3,rmin:8,rmax:8,sets:[{w:100,r:8,ok:true}]}]),
      mk('b',12,110)
    ];
    const carry = indexSeries();
    return {n:s.length, first:s[0], last:s[2], one:one.length, carry:carry[1].strength};
  });
  await T('kolme treeniviikkoa = kolme pistetta', async () => { if(ix.n !== 3) throw new Error(String(ix.n)); });
  await T('indeksi alkaa nollasta', async () => {
    if(Math.abs(ix.first.strength) > 0.001 || Math.abs(ix.first.volume) > 0.001) throw new Error(JSON.stringify(ix.first)); });
  await T('100→110 kg antaa +10 % voimaindeksin', async () => {
    if(Math.abs(ix.last.strength - 10) > 0.01) throw new Error(String(ix.last.strength)); });
  await T('tyomaaraindeksi seuraa volyymia', async () => {
    if(Math.abs(ix.last.volume - 10) > 0.01) throw new Error(String(ix.last.volume)); });
  await T('yksi viikko tuottaa yhden pisteen', async () => { if(ix.one !== 1) throw new Error(String(ix.one)); });
  await T('valissa tekematta jaanyt liike ei pudota indeksia', async () => {
    if(ix.carry < 4.9 || ix.carry > 5.1) throw new Error('odotettu ~5, sai ' + ix.carry); });

  group('Kuvaaja');
  await p.evaluate(() => {
    const mk = (id, d, w) => ({id, programId:'t', name:'Jalkapäivä', date:new Date(2026,0,d).toISOString(),
      startedAt:0, finishedAt:1, q:['x','y'], ex:[{id:'x1', name:'Penkki', equip:'tanko', step:2.5, target:3, rmin:8, rmax:8,
        sets:[{w,r:8,ok:true},{w,r:8,ok:true},{w,r:8,ok:true}]}]});
    S.sessions = [mk('a',5,100), mk('b',12,105), mk('c',19,110)]; save(); render();
  });
  await p.locator('[data-tab="historia"]').click(); await p.waitForTimeout(350);
  await T('kuvaaja piirtyy', async () => { if(!await p.locator('#devchart').isVisible()) throw new Error('ei svg:ta'); });
  await T('molemmat sarjat piirretty', async () => {
    const n = await p.locator('#devchart path[stroke-width="2"]').count(); if(n !== 2) throw new Error('viivoja ' + n); });
  await T('selite nayttaa molemmat sarjat', async () => {
    const t = await p.textContent('.legend'); if(!/Voima/.test(t) || !/Työmäärä/.test(t)) throw new Error(t); });
  await T('nollaviiva korostettu', async () => { if(!await p.locator('#devchart .g-zero').count()) throw new Error('ei nollaviivaa'); });
  await T('kosketus nayttaa arvolaatikon', async () => {
    await p.locator('#devchart [data-pt="1"]').dispatchEvent('pointerdown'); await p.waitForTimeout(200);
    const tip = p.locator('#ctip'); if(await tip.isHidden()) throw new Error('laatikko piilossa');
    const t = await tip.textContent(); if(!/vk/.test(t)) throw new Error(t); });
  await T('taulukkonakyma aukeaa', async () => {
    await p.locator('[data-ctable]').click(); await p.waitForTimeout(250);
    const rows = await p.locator('table.dt tbody tr').count(); if(rows !== 3) throw new Error('rivit ' + rows); });

  group('Asetukset');
  await p.locator('[data-tab="data"]').click(); await p.waitForTimeout(300);
  await T('otsikko on Asetukset', async () => { const t = await p.textContent('.bar-in h1'); if(t !== 'Asetukset') throw new Error(t); });
  await T('staattinen on oletuksena valittuna', async () => {
    const c = await p.locator('[data-mode="staattinen"]').getAttribute('class'); if(!/primary/.test(c)) throw new Error(c); });
  await T('staattisessa nakyy sarja- ja toistokentat', async () => {
    if(!await p.locator('[data-set="sets"]').isVisible()) throw new Error('ei kenttia'); });
  await p.locator('[data-mode="automaattinen"]').click(); await p.waitForTimeout(300);
  await T('automaattitilaan vaihto toimii', async () => {
    const c = await p.locator('[data-mode="automaattinen"]').getAttribute('class'); if(!/primary/.test(c)) throw new Error(c); });
  await T('automaattitila nayttaa muokattavan haarukan 6-10', async () => {
    const a = await p.locator('[data-set="autoRmin"]').inputValue(), b = await p.locator('[data-set="autoRmax"]').inputValue();
    if(a !== '6' || b !== '10') throw new Error(a + '-' + b); });
  await T('automaattitilaan siirtyminen aloittaa jakson', async () => {
    const c = await p.evaluate(() => S.settings.cycleStart); if(!c) throw new Error('ei jakson alkua'); });
  await T('kytkimet toimivat', async () => {
    const before = await p.locator('[data-tog="amrap"]').textContent();
    await p.locator('[data-tog="amrap"]').click(); await p.waitForTimeout(200);
    const after = await p.locator('[data-tog="amrap"]').textContent();
    if(before === after) throw new Error('ei vaihtunut'); });
  await T('asetus sailyy latauksen yli', async () => {
    await p.reload({waitUntil:'load'}); await p.waitForTimeout(450);
    const m = await p.evaluate(() => S.settings.mode); if(m !== 'automaattinen') throw new Error(m); });

  group('Automaattimoottori');
  const eng = await p.evaluate(() => {
    const keep = JSON.stringify(S);
    S.settings = Object.assign(defaultSettings(), {mode:'automaattinen', cycleStart:new Date().toISOString()});
    const def = {id:'k', name:'Kyykky', equip:'tanko', step:2.5, sets:3, rmin:8, rmax:8, w:100};
    const mk = (id, d, w, reps, opt) => Object.assign({id, programId:'t', name:'T', date:new Date(2026,0,d).toISOString(),
      startedAt:0, finishedAt:1, ex:[{id:'k', name:'Kyykky', equip:'tanko', step:2.5, target:reps.length, rmin:6, rmax:10,
        sets:reps.map((r,i) => ({w, r, ok:true, a: !!(opt && opt.amrap && i === reps.length-1)}))}]}, opt && opt.sess || {});
    const R = {};
    S.sessions = [];                                   R.first = autoPlan(def);
    S.sessions = [mk('a',1,100,[10,10,10])];            R.onceTop = autoPlan(def);
    S.sessions = [mk('a',1,100,[10,10,10]), mk('b',4,100,[10,10,10])]; R.twiceTop = autoPlan(def);
    S.sessions = [mk('a',1,100,[10,10,13],{amrap:true})]; R.amrapBig = autoPlan(def);
    S.sessions = [mk('a',1,100,[10,10,12],{amrap:true})]; R.amrapSmall = autoPlan(def);
    S.sessions = [mk('a',1,100,[8,7,6])];               R.mid = autoPlan(def);
    S.sessions = [mk('a',1,100,[6,5,5]), mk('b',4,100,[5,5,4])]; R.under = autoPlan(def);
    S.sessions = [mk('a',1,100,[10,10,10]), mk('b',4,100,[10,10,10],{sess:{deload:true}})]; R.skipDeloadHist = autoPlan(def);
    S.settings.twoSession = false;
    S.sessions = [mk('a',1,100,[10,10,10])];            R.noTwo = autoPlan(def);
    S.settings.twoSession = true;
    // jakson viikot: 6 vk jakso, viikko 5 = sarjamäärän nosto, viikko 6 = kevennys
    const ago = w => new Date(Date.now() - (w*7+1)*864e5).toISOString();
    S.sessions = [mk('a',1,100,[8,8,8])];
    S.settings.cycleStart = ago(4); R.ramp = autoPlan(def); R.rampCyc = cycleInfo();
    S.settings.cycleStart = ago(5); R.deload = autoPlan(def); R.deloadCyc = cycleInfo();
    S.settings.skipDeload = cycleInfo().idx; R.skipped = autoPlan(def); S.settings.skipDeload = null;
    S.settings.cycleStart = new Date().toISOString();
    R.dumb = (S.sessions = [mk('a',1,15,[10,10,10]), mk('b',4,15,[10,10,10])],
              autoPlan({name:'Kyykky', equip:'käsipaino', sets:3, w:15}));
    R.noAmrapDef = autoPlan(Object.assign({}, def, {noAmrap:true}));
    R.ownRange = (S.sessions = [], autoPlan(Object.assign({}, def, {autoRmin:20, autoRmax:24})));
    R.entry = (S.sessions = [], autoEntry(def));
    S = JSON.parse(keep); save();
    return R;
  });
  await T('ensimmainen kerta: haarukan alaraja', async () => {
    if(eng.first.reps.join() !== '6,6,6' || eng.first.w !== 100) throw new Error(JSON.stringify(eng.first)); });
  await T('ylaraja kerran: paino pysyy (kahden kerran saanto)', async () => {
    if(eng.onceTop.up || eng.onceTop.w !== 100) throw new Error(JSON.stringify(eng.onceTop)); });
  await T('ylaraja kahdesti: paino nousee askeleen ja toistot alarajalle', async () => {
    if(!eng.twiceTop.up || eng.twiceTop.w !== 102.5 || eng.twiceTop.reps.join() !== '6,6,6') throw new Error(JSON.stringify(eng.twiceTop)); });
  await T('AMRAP +3 yli ylarajan: paino nousee heti', async () => {
    if(!eng.amrapBig.up || eng.amrapBig.w !== 102.5) throw new Error(JSON.stringify(eng.amrapBig)); });
  await T('AMRAP +2 ei riita pikanostoon', async () => {
    if(eng.amrapSmall.up) throw new Error(JSON.stringify(eng.amrapSmall)); });
  await T('haarukan keskella: sama paino, +1 toisto per sarja', async () => {
    if(eng.mid.w !== 100 || eng.mid.reps.join() !== '9,8,7') throw new Error(JSON.stringify(eng.mid)); });
  await T('kahdesti alle haarukan: paino kevenee askeleen', async () => {
    if(!eng.under.down || eng.under.w !== 97.5) throw new Error(JSON.stringify(eng.under)); });
  await T('kevennysviikko ei kelpaa kahden kerran saantoon', async () => {
    if(eng.skipDeloadHist.up) throw new Error('kevennys laskettiin onnistumiseksi'); });
  await T('kahden kerran saanto pois: yksi onnistuminen riittaa', async () => {
    if(!eng.noTwo.up) throw new Error(JSON.stringify(eng.noTwo)); });
  await T('jakson viikko 5/6: sarjamaara 3 → 4', async () => {
    if(eng.rampCyc.week !== 5 || eng.ramp.sets !== 4) throw new Error('vk ' + eng.rampCyc.week + ', sarjoja ' + eng.ramp.sets); });
  await T('jakson viikko 6/6: kevennys, sarjat puoleen, paino ennallaan, ei AMRAPia', async () => {
    if(eng.deloadCyc.week !== 6 || !eng.deload.deload || eng.deload.sets !== 2 || eng.deload.w !== 100 || eng.deload.amrap)
      throw new Error(JSON.stringify(eng.deload)); });
  await T('ohitettu kevennys palauttaa normaalin treenin', async () => {
    if(eng.skipped.deload) throw new Error('kevennys yha paalla'); });
  await T('kasipaino nousee ruudukkoa pitkin 15 → 17,5', async () => {
    if(eng.dumb.w !== 17.5) throw new Error(String(eng.dumb.w)); });
  await T('liikekohtainen AMRAP-poissulku toimii', async () => {
    if(eng.noAmrapDef.amrap) throw new Error('AMRAP paalla vaikka poissuljettu'); });
  await T('liikkeen oma haarukka ohittaa yleisen', async () => {
    if(eng.ownRange.rmin !== 20 || eng.ownRange.rmax !== 24) throw new Error(eng.ownRange.rmin + '-' + eng.ownRange.rmax); });
  await T('AMRAP-merkki vain viimeisella sarjalla', async () => {
    const f = eng.entry.sets.map(t => t.a ? 1 : 0).join(''); if(f !== '001') throw new Error(f); });

  group('Automaattitila kaytossa');
  await p.evaluate(() => { S.sessions = []; S.active = null;
    /* Asetukset-ryhmä kytki kytkimiä testatessaan — palautetaan oletukset,
       ettei testien järjestys vaikuta tuloksiin. */
    S.settings = Object.assign(defaultSettings(), {mode:'automaattinen', cycleStart:new Date().toISOString()});
    save(); });
  await p.reload({waitUntil:'load'}); await p.waitForTimeout(450);
  await T('migraatio: pohjenousulla oma haarukka 20-24', async () => {
    const r = await p.evaluate(() => { const x = S.programs[0].ex.find(e => /Pohjenousu/.test(e.name)); return [x.autoRmin, x.autoRmax]; });
    if(r.join() !== '20,24') throw new Error(r.join()); });
  await T('migraatio: maastaveto ilman AMRAPia', async () => {
    const r = await p.evaluate(() => S.programs[0].ex.find(e => /maastaveto/.test(e.name)).noAmrap);
    if(r !== true) throw new Error(String(r)); });
  await T('kotinakyma nayttaa jaksokortin', async () => {
    const t = await p.textContent('#view'); if(!/jakso 1/i.test(t) || !/viikko 1\/6/.test(t)) throw new Error(t.slice(0,120)); });
  await p.locator('[data-start="p_jalka"]').click(); await p.waitForTimeout(350);
  await T('treeni kayttaa automaattihaarukkaa 6 toistoa', async () => {
    const v = await p.evaluate(() => S.active.ex[1].sets.map(s => s.r).join()); if(v !== '6,6,6') throw new Error(v); });
  await T('maastavedossa ei MAX-merkkia', async () => {
    const n = await p.locator('.ex').first().locator('.setrow.amrap').count(); if(n) throw new Error('MAX-rivi maastavedossa'); });
  await T('polven ojennuksessa MAX-merkki viimeisella sarjalla', async () => {
    await p.locator('.ex-head').nth(1).click(); await p.waitForTimeout(250);
    const rows = p.locator('.ex').nth(1).locator('.setrow');
    const last = await rows.last().getAttribute('class'); const first = await rows.first().getAttribute('class');
    if(!/amrap/.test(last) || /amrap/.test(first)) throw new Error(first + ' | ' + last); });
  await T('perustelu nakyy vihjeessa', async () => {
    const t = await p.locator('.ex').nth(1).textContent(); if(!/Ensimmäinen kerta/.test(t)) throw new Error(t.slice(0,160)); });
  await T('sarjan lisays siirtaa MAX-merkin viimeiselle', async () => {
    await p.locator('.ex').nth(1).locator('[data-addset]').click(); await p.waitForTimeout(250);
    const f = await p.evaluate(() => S.active.ex[1].sets.map(t => t.a ? 1 : 0).join('')); if(f !== '0001') throw new Error(f); });
  await p.locator('[data-cancel]').click(); await p.waitForTimeout(200); await p.locator('[data-ans="1"]').click(); await p.waitForTimeout(250);
  await p.evaluate(() => { S.settings.mode = 'staattinen'; save(); });

  group('Aikaliikkeet ja lammittely');
  await p.evaluate(() => { S.sessions = []; S.active = null; S.settings = defaultSettings(); save(); });
  await T('liikepankin ensimmainen ryhma on Alkulammittely', async () => {
    const r = await p.evaluate(() => [LIB[0].g, LIB[0].items.length, LIB[0].items.every(i => i.warm && i.min > 0)]);
    if(r[0] !== 'Alkulämmittely' || r[1] < 8 || !r[2]) throw new Error(JSON.stringify(r)); });
  await T('kuntopyora, juoksumatto, soutulaite, keppijumppa mukana muistilistoineen', async () => {
    const r = await p.evaluate(() => ['Kuntopyörä','Juoksumatto','Soutulaite','Keppijumppa','Dynaaminen kehonpainolämmittely']
      .map(n => (LIB[0].items.find(i => i.n === n) || {list:[]}).list.length));
    if(r.some(n => n < 3)) throw new Error(r.join()); });
  await T('riippuminen: sekunnit, 2,5 kg askel, 30-45 s', async () => {
    const r = await p.evaluate(() => { const it = LIB.flatMap(g => g.items).find(i => i.n === 'Tangosta riippuminen');
      const d = defFromLib(it); return [d.unit, d.step, d.rmin, d.rmax, nextWeight(d, 0, 1), nextWeight(d, 2.5, 1)]; });
    if(r.join() !== 's,2.5,30,45,2.5,5') throw new Error(r.join()); });
  await T('migraatio v8: ohjelman riippuminen muuttuu sekunneiksi', async () => {
    await p.evaluate(() => { S.programs[1].ex.push({id:'xh', name:'Tangosta riippuminen', equip:'kehonpaino', step:1, sets:3, rmin:8, rmax:8, w:0}); S.v = 7; save(); });
    await p.reload({waitUntil:'load'}); await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const x = S.programs[1].ex.find(e => e.id === 'xh'); return [S.v, x.unit, x.step, x.rmin, x.rmax]; });
    if(r.join() !== '8,s,2.5,30,45') throw new Error(r.join()); });
  await p.evaluate(() => { const it = LIB[0].items.find(i => i.n === 'Kuntopyörä'); const w = defFromLib(it); w.id = 'xw';
    S.programs[1].ex.unshift(w); save(); });
  await p.reload({waitUntil:'load'}); await p.waitForTimeout(400);
  await p.locator('[data-start="'+await p.evaluate(() => S.programs[1].id)+'"]').click(); await p.waitForTimeout(350);
  await T('lammittely on treenin ensimmainen ja muistilista nakyy', async () => {
    const n = await p.locator('.witem').count(); if(n !== 4) throw new Error('kohtia ' + n);
    const bt = await p.textContent('#barprog'); if(!/Lämmittely/.test(bt) || !/0 \/ 24 sarjaa/.test(bt)) throw new Error(bt); });
  await T('muistilistan kohdan voi ruksata', async () => {
    await p.locator('.witem').nth(1).click(); await p.waitForTimeout(200);
    const r = await p.evaluate(() => S.active.ex[0].chk.join()); if(r !== 'false,true,false,false') throw new Error(r); });
  await T('lammittelyn kesto minuutteina ja kuittaus', async () => {
    await p.locator('.ex').first().locator('.step[data-d="1"]').click(); await p.waitForTimeout(100);
    await p.locator('.ex').first().locator('[data-chk]').click(); await p.waitForTimeout(250);
    const r = await p.evaluate(() => [S.active.ex[0].sets[0].r, S.active.ex[0].sets[0].ok].join()); if(r !== '9,true') throw new Error(r); });
  const hi = await p.evaluate(() => S.active.ex.findIndex(x => x.name === 'Tangosta riippuminen'));
  await T('riippumisessa kentat Lisapaino ja Sekunnit', async () => {
    await p.locator('.ex-head').nth(hi).click(); await p.waitForTimeout(250);
    const t = await p.locator('.ex').nth(hi).locator('.setrow').first().textContent();
    if(!/Lisäpaino kg/.test(t) || !/Sekunnit/.test(t)) throw new Error(t); });
  await T('sekuntien stepperi 5 s, painon 2,5 kg', async () => {
    const row = p.locator('.ex').nth(hi).locator('.setrow').first();
    await row.locator('.step[data-f="r"][data-d="1"]').click(); await row.locator('.step[data-f="w"][data-d="1"]').click();
    await p.waitForTimeout(100);
    const r = await p.evaluate(i => [S.active.ex[i].sets[0].r, S.active.ex[i].sets[0].w].join(), hi); if(r !== '50,2.5') throw new Error(r); });
  await p.evaluate(i => { S.active.ex.forEach((x, k) => { if(k !== i && k !== 0) x.skip = true; });
    S.active.ex[i].sets.forEach(t => { t.ok = true; t.w = 2.5; t.r = 50; }); save(); }, hi);
  await p.locator('[data-finish]').click(); await p.waitForTimeout(400);
  await T('tiivistelma: lammittely minuutteina, ei pitoa toistoihin eika volyymiin', async () => {
    const r = await p.evaluate(() => { const s = S.sessions[S.sessions.length-1]; return [summaryText(s), volume(s), setsDone(s)]; });
    if(!/Lämmittely: Kuntopyörä 9 min/.test(r[0]) || !/1 liikettä, 3 sarjaa, 0 toistoa/.test(r[0]) || r[1] !== 0 || r[2] !== 3)
      throw new Error(JSON.stringify(r)); });
  await T('treenin tiedoissa "2,5 kg × 50 s"', async () => {
    const t = await p.textContent('#sheetbg'); if(!/2,5 kg × 50 s/.test(t) || !/9 min/.test(t)) throw new Error(t.slice(0,200)); });
  await p.locator('#sheetbg [data-close]').first().click(); await p.waitForTimeout(200);
  await T('voimaindeksi ei laske pitoa eika lammittelya', async () => {
    const r = await p.evaluate(() => indexSeries()[0].lifts); if(r !== 0) throw new Error(String(r)); });
  await T('automaatti: pito etenee 5 s kerrallaan', async () => {
    const r = await p.evaluate(() => { S.settings.mode = 'automaattinen'; S.settings.cycleStart = null;
      S.sessions[S.sessions.length-1].ex.find(e => e.unit === 's').rmax = 60;   /* automaattihaarukka 30-60 */
      const d = S.programs[1].ex.find(e => e.id === 'xh'); const pl = autoPlan(d); S.settings.mode = 'staattinen';
      return [pl.w, pl.reps.join('/'), pl.reason]; });
    if(r[0] !== 2.5 || r[1] !== '55/55/55' || !/5 sekuntia/.test(r[2])) throw new Error(JSON.stringify(r)); });
  await T('automaatti: MAX-pito +15 s yli ylarajan nostaa painoa heti', async () => {
    const r = await p.evaluate(() => { S.settings.mode = 'automaattinen';
      const s = S.sessions[S.sessions.length-1], x = s.ex.find(e => e.unit === 's');
      x.rmax = 60; x.sets.forEach(t => { t.r = 60; }); x.sets[2].a = true; x.sets[2].r = 75;
      const d = S.programs[1].ex.find(e => e.id === 'xh'); const pl = autoPlan(d); S.settings.mode = 'staattinen';
      return [pl.w, pl.up, pl.reps.join('/')]; });
    if(r.join() !== '5,true,30/30/30') throw new Error(r.join()); });
  await T('historian liikelista: lammittely ja pito oikein', async () => {
    await p.locator('[data-tab="historia"]').click(); await p.waitForTimeout(250);
    await p.locator('[data-hsub="liikkeet"]').click(); await p.waitForTimeout(250);
    const t = await p.textContent('#view'); if(!/Viimeksi 9 min · lämmittely/.test(t) || !/× 75 s|× 60 s/.test(t)) throw new Error(t.slice(0,300)); });

  await p.locator('[data-tab="ohjelmat"]').click(); await p.waitForTimeout(250);
  await p.locator('[data-editp="'+await p.evaluate(() => S.programs[1].id)+'"]').click(); await p.waitForTimeout(300);
  await T('editorissa lammittelylle kesto ja muistilista', async () => {
    const box = p.locator('[data-exi="0"]');
    if(!(await box.locator('textarea[data-x="list"]').count()) || !(await box.locator('input[data-x="min"]').count())) throw new Error('kentat puuttuvat');
    const v = await box.locator('textarea').inputValue(); if(v.split('\n').length !== 4) throw new Error(v); });
  await T('muistilistan muokkaus tallentuu', async () => {
    const box = p.locator('[data-exi="0"]');
    await box.locator('textarea').fill('Satula kohdalleen\n\n  Kevyesti 5 min  \nLoppukiri');
    await box.locator('input[data-x="min"]').fill('6');
    await p.locator('[data-savep]').click(); await p.waitForTimeout(250);
    const r = await p.evaluate(() => { const x = S.programs[1].ex[0]; return JSON.stringify([x.min, x.list]); });
    if(r !== '[6,["Satula kohdalleen","Kevyesti 5 min","Loppukiri"]]') throw new Error(r); });
  await T('mittarin vaihto sekunteihin antaa pitohaarukan', async () => {
    await p.locator('[data-editp="'+await p.evaluate(() => S.programs[1].id)+'"]').click(); await p.waitForTimeout(300);
    const i = await p.evaluate(() => S.programs[1].ex.findIndex(e => e.name === 'Penkkipunnerrus tangolla'));
    await p.locator('[data-exi="'+i+'"] select[data-x="unit"]').selectOption('s'); await p.waitForTimeout(300);
    const r = await p.evaluate(i => { const x = S.programs[1].ex[i]; return [x.unit, x.rmin, x.rmax].join(); }, i);
    const lbl = await p.locator('[data-exi="'+i+'"]').textContent();
    await p.locator('[data-exi="'+i+'"] select[data-x="unit"]').selectOption(''); await p.waitForTimeout(300);
    const back = await p.evaluate(i => { const x = S.programs[1].ex[i]; return [x.unit, x.rmin, x.rmax].join(); }, i);
    if(r !== 's,30,45' || !/Sekunnit väh/.test(lbl) || back !== ',8,8') throw new Error(r + ' | ' + back); });
  await p.locator('#sheetbg [data-close]').first().click(); await p.waitForTimeout(200);

  group('Lopuksi');
  await T('ei JS-virheita koko ajon aikana', async () => { if(errs.length) throw new Error(errs.join(' | ')); });

  await b.close(); srv.close();
  console.log('\n' + pass + ' lapi, ' + fail + ' virhetta');
  process.exit(fail ? 1 : 0);
})();
