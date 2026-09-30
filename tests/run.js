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
  await T('automaattitila nayttaa toistohaarukan 6-10', async () => {
    const t = await p.textContent('#view'); if(!/6–10/.test(t)) throw new Error('ei haarukkaa'); });
  await T('kytkimet toimivat', async () => {
    const before = await p.locator('[data-tog="amrap"]').textContent();
    await p.locator('[data-tog="amrap"]').click(); await p.waitForTimeout(200);
    const after = await p.locator('[data-tog="amrap"]').textContent();
    if(before === after) throw new Error('ei vaihtunut'); });
  await T('asetus sailyy latauksen yli', async () => {
    await p.reload({waitUntil:'load'}); await p.waitForTimeout(450);
    const m = await p.evaluate(() => S.settings.mode); if(m !== 'automaattinen') throw new Error(m); });

  group('Lopuksi');
  await T('ei JS-virheita koko ajon aikana', async () => { if(errs.length) throw new Error(errs.join(' | ')); });

  await b.close(); srv.close();
  console.log('\n' + pass + ' lapi, ' + fail + ' virhetta');
  process.exit(fail ? 1 : 0);
})();
