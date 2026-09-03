# Rautakirja

Henkilökohtainen treenipäiväkirja: ohjelman seuranta salilla sekä painojen, sarjojen ja
toistojen kirjaus. Selainpohjainen sovellus (PWA) ilman palvelinta ja ilman käyttäjätilejä.

**Käytössä:** https://teresammallahti.github.io/Rautakirja/

## Miten se toimii

Kaikki data tallentuu selaimen omaan muistiin (`localStorage`, avain `rautakirja.v1`) sillä
laitteella jolla appia käytetään. Palvelinta ei ole, joten treenit eivät siirry GitHubiin
eivätkä minnekään muualle. Jokainen käyttäjä saa oman erillisen kopionsa samasta osoitteesta.

Data viedään varmuuskopioksi JSON-tiedostona Data-välilehdeltä. Puhelimessa se avaa
jakovalikon, työpöydällä tiedosto latautuu normaalisti.

## Tiedostot

| Tiedosto | Mitä tekee |
|---|---|
| `index.html` | Rakenne, tyylit ja CSP |
| `app.js` | Koko sovelluslogiikka: näkymät, tila, liikepankki, ohjelmat |
| `sw.js` | Palvelutyöntekijä — appi latautuu myös ilman verkkoa |
| `manifest.webmanifest` | Tekee sivusta asennettavan sovelluksen |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Aloitusnäytön kuvakkeet |

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

## Liikepankki

Sovelluksen liikkeet ovat `app.js`:ssä `LIB`-vakiona, ryhmiteltynä lihasryhmittäin.
Muokattava lähdeaineisto on projektikansion `Liikepankki.md`; jos sitä muuttaa, `LIB` on
generoitava uudelleen.
