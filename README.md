# Rautakirja

Henkilökohtainen treenipäiväkirja: ohjelman seuranta salilla sekä painojen, sarjojen ja
toistojen kirjaus. Selainpohjainen sovellus (PWA) ilman palvelinta ja ilman käyttäjätilejä.

**Käytössä:** https://teresammallahti.github.io/Rautakirja/

## Miten se toimii

Kaikki data tallentuu selaimen omaan muistiin (`localStorage`, avain `rautakirja.v1`) sillä
laitteella jolla appia käytetään. Palvelinta ei ole, joten treenit eivät siirry GitHubiin
eivätkä minnekään muualle. Jokainen käyttäjä saa oman erillisen kopionsa samasta osoitteesta.

Data viedään varmuuskopioksi JSON-tiedostona Asetukset-välilehdeltä. Vanhan version varmuuskopio
migratoidaan tuonnissa nykyiseen skeemaan (`migrate()`). Puhelimessa se avaa
jakovalikon, työpöydällä tiedosto latautuu normaalisti.

## Tiedostot

| Tiedosto | Mitä tekee |
|---|---|
| `index.html` | Rakenne, tyylit ja CSP |
| `app.js` | Koko sovelluslogiikka: näkymät, tila, liikepankki, ohjelmat |
| `sw.js` | Palvelutyöntekijä — appi latautuu myös ilman verkkoa |
| `manifest.webmanifest` | Tekee sivusta asennettavan sovelluksen |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Aloitusnäytön kuvakkeet |
| `brand/` | Palveluiden logot varmuuskopiopainikkeisiin (`onedrive.svg`, `gdrive.svg`); puuttuessa yleinen kuvake |
| `tests/run.js`, `tests/sim.js` | Selaintestit ja stressitesti (eivät ole osa sivustoa) |

Kaikki polut ovat suhteellisia (`./`), koska GitHub Pages tarjoilee sivuston alikansiosta.

## Asennus puhelimeen

Avaa osoite Chromessa ja valitse **Lisää aloitusnäyttöön**. Sovellus avautuu sen jälkeen
omana ikkunanaan ilman selainpalkkeja ja toimii ilman verkkoyhteyttä.

## Päivittäminen

Korvaa muuttuneet tiedostot repositoryn juuressa.

**Kun `index.html` tai `app.js` muuttuu, nosta myös `sw.js`:n `CACHE`-vakion versionumeroa**
(esim. `rautakirja-v6` → `rautakirja-v7`). Muuten selain tarjoilee vanhaa versiota
välimuistista. Käyttäjien treenidata ei katoa päivityksessä — se on erillään sivun
välimuistista.

## Tietoturva

- Sisältöturvakäytäntö (CSP) sallii skriptit vain omasta originista, ei lainkaan inline-skriptejä.
- Ainoa ulkoinen resurssi on Google Fonts (tyylitiedosto ja fontit).
- Kaikki käyttäjän syöttämä teksti escapetaan ennen sivulle kirjoittamista.
- Palvelutyöntekijä tallentaa välimuistiin vain onnistuneet vastaukset, jottei virhesivu jää tarjolle.

## Testit

```
npm install playwright
node tests/run.js
```

Käynnistää paikallisen palvelimen ja ajaa koko käyttöpolun oikeassa selaimessa:
painoruudukko, ennätyslogiikka, kehitysindeksit, kuvaaja, asetukset, automaattimoottori,
lämmittelyt, pikaohjelma. Aja aina ennen kuin muutokset viedään GitHubiin.

```
node tests/sim.js
```

Stressitesti: simuloi nostajan 8–12 viikon treenihistorioita (tasainen kehitys, tasanne,
romahdus, tauko, eri asetukset) automaattimoottorin ja indeksien läpi ja tarkistaa
invariantit (ei NaN, enintään askel per treeni, kevennys ei laske indeksiä, turvaventtiili
toimii). Aja kun moottorin tai indeksien logiikkaa muutetaan.

## Ohjelmien järjestys

Ohjelmat-välilehden ↑ ↓ -napit muuttavat ohjelmien järjestystä; sama järjestys näkyy kotinäkymässä.
Ylimmän ↑ ja alimman ↓ kiertävät toiseen päähän.

## Kehonpaino

Asetuksissa annettu kehonpaino lasketaan kehonpainoliikkeiden kuormaksi työmäärään ja
voimaindeksiin (`loadOf`, osuudet `BW_FRAC`: leuanveto, dippi ja riipunta 100 %, punnerrus 65 %,
vaakasoutu 55 %, selän ja lantion ojennukset 50 %, keskivartaloliikkeet toistaiseksi 0) lisäpainon päälle. Ilman kehonpainoa lasketaan vain lisäpaino.

## Sarjamallit

Automaattitilassa valitaan sarjamalli (`SCHEMES`): tiivis (2 sarjaa, molemmat maksimiin), perus
(3, viimeinen maksimiin), laaja (4, viimeinen maksimiin) tai ohjelman mukaan. Valinta Asetuksissa;
appi kysyy sen myös jokaisen jakson alussa. Maastavedoissa (`noAmrap`) ei koskaan maksimisarjoja.

## Rotaatio

Ohjelmalla on kenttä `rot`. Rotaatiossa olevat vuorottelevat ja kotinäkymä merkitsee seuraavan
"Vuorossa"; muut listataan erikseen ja valitaan käsin. Pikaohjelmat ovat oletuksena rotaation
ulkopuolella. Valinta on ohjelman muokkauksessa.

## Pikaohjelma

Ohjelmat-välilehden **Pikaohjelma** arpoo ohjelman valituista lihasryhmistä (`quickGenerate`).
Säännöt: yhdistelmäliike ensin joka ryhmästä, noin 20–24 sarjaa per treeni ja enintään 9 per
lihasryhmä, toistohaarukka liiketyypin mukaan, tutut liikkeet etusijalla, viime treenin liikkeitä
vältetään, alle 48 h sitten treenattu ryhmä saa sarjan vähemmän. Perustelut ovat koodin kommentissa.

## Viikkovolyymi

Historia-välilehti näyttää viimeisen 7 päivän sarjat lihasryhmittäin suhteessa tuottavaan
10–20 sarjan alueeseen (`weekVolume`). Yhdistelmäliikkeet lasketaan toissijaiselle lihakselle
puolikkaana (`SECONDARY`). Kotinäkymä vihjaa alle 10 sarjaan jääneistä ryhmistä, ja
pikaohjelma esivalitsee ne.

## Liikepankki

Sovelluksen liikkeet ovat `app.js`:ssä `LIB`-vakiona, ryhmiteltynä lihasryhmittäin.
Ensimmäinen ryhmä on alkulämmittely: kesto minuutteina ja muistilista, jota voi muokata
ohjelman muokkauksessa. Lämmittelyt eivät kuulu volyymiin, ennätyksiin eivätkä indekseihin.
Pitoliikkeet (`unit: "s"`, esim. tangosta riippuminen ja lankku) kirjataan sekunteina.
Takareisi ja pakarat ovat omat ryhmänsä: takareisi kasvaa parhaiten polven koukistuksista ja
lonkkasaranoista, pakara kyykyistä ja lantionnostoista, eikä kyykky juuri kasvata takareittä.
Riskialttiilla liikkeillä (`sf`-tunniste, tekstit `SAFETY`-taulussa) on turvahuomio, joka näkyy
treenissä ja korostuu maksimisarjan edellä.
Muokattava lähdeaineisto on projektikansion `Liikepankki.md`; jos sitä muuttaa, `LIB` on
generoitava uudelleen.
