# hel-proto-ai-dashboard

Prototyyppi hel.fi-sisällöntuottajien personoidusta aloitussivusta tekoälyavusteisilla ominaisuuksilla.

## Tausta

Hel.fi-sivustolla on lähes tuhat sisällöntuottajaa. Heidän nykyinen aloitussivunsa (käyttäjäprofiilisivu Drupalissa) on käytännössä tyhjä — näyttää vain nimen, tervetulotekstin ja käyttäjäiän. Tämä proto konseptoi, millainen personoitu aloitussivu voisi olla, kun siihen lisätään tekoälyavusteisia ominaisuuksia.

### Tunnistetut kipupisteet (käyttäjätutkimus)

- **Päällekkäiset sisällöt** — sama asiasisältö on tuotettu useampaan osioon eri aikoina, eri tekijöiden toimesta
- **Kieliversioiden hallinta** — suomenkielistä sisältöä päivitetään, mutta ruotsin- ja englanninkieliset versiot jäävät vanhentumaan. Suoria lainauksia käyttäjiltä:
  - *"Käännösten hallinnointi on kyllä aikaa vievin homma."*
  - *"Käännösten tekeminen eli saman asian päivittäminen saman sivun eri käännössivulle."*
  - *"Käännösversioiden päivitykset / tekstien päivitykset kolmella kielellä."*

---

## Kehityspalvelin

```bash
npm install --legacy-peer-deps
npm run dev
```

Avautuu osoitteessa: http://localhost:5173

---

## Prototyypin rakenne

```
src/
├── App.tsx                        # Sivurakenne: Header, Breadcrumb, main, Footer
├── main.tsx                       # Entry point, HDS-tyylit
├── vite-env.d.ts                  # CSS-moduulityyppimäärittelyt
├── styles/
│   └── global.css                 # HelsinkiGrotesk-fontit, layout-luokat, globaalit linkit/napit
├── types/
│   └── index.ts                   # TypeScript-tyypit (ContentItem, DashboardStats jne.)
├── utils/
│   ├── date.ts                    # Suhteellinen päivämääräformatointi (fi)
│   └── index.ts                   # Scaffold: formatDate + formatCurrency (ei käytössä)
├── hooks/
│   └── useForm.ts                 # Scaffold: yleiskäyttöinen lomaketilatarvike (ei käytössä)
├── pages/                         # Scaffold: tyhjä hakemisto (tuleville sivunäkymille)
├── data/
│   ├── mockContent.ts             # 10 esimerkkisisältöä + käyttäjä + tilastot
│   ├── mockAiInsights.ts          # AI-huomiot: päällekkäisyydet + linkitysehdotukset
│   └── mockTranslations.ts        # AI-käännösehdotukset: lähdetekstit + käännösluonnokset
└── components/
    ├── DashboardGreeting.tsx       # Osio 1: Tervehdys + pikatilasto
    ├── ContentList.tsx             # Osio 2: Omat sisällöt + AI-huomiot + AI-käännöspainike
    ├── AiInsights.tsx              # Erillinen AI-huomiot-komponentti (ei renderöidä, säilytetty)
    ├── CompareDialog.tsx           # "Vertaa sivuja" -dialogi (HDS Dialog)
    ├── TranslationDrawer.tsx       # AI-käännösapuri (HDS Dialog)
    └── *.module.css                # Komponenttikohtaiset tyylit
```

---

## Sivun kaksi osiota

### Osio 1 — Tervehdys ja pikatilasto (`DashboardGreeting`)

Personoitu tervehdys kellonajan mukaan ("Hyvää huomenta / Hei / Hyvää iltaa") ja neljä tilakorttia kahdessa ryhmässä:

**Tilannekuva** (informatiiviset, vasemmalla):

| Kortti | Värikoodaus |
|--------|-------------|
| Julkaistua sisältöä | Neutraali |
| Muokattu viim. 30 pv | Neutraali |

**Vaatii huomiota** (toimintakortit, oikealla — sama koko, väri erottaa):

| Kortti | Värikoodaus |
|--------|-------------|
| Päivitystä tarvitsee | `--color-alert` — varoitus |
| Kieliversio puuttuu tai vanha | `--color-error` — kriittinen |

### Osio 2 — Omat sisällöt (`ContentList`)

Lista sisällöntuottajan viimeksi luomista ja muokkaamista sisällöistä. Jokainen rivi näyttää:

- **Otsikko + Muokkaa** — otsikkolinkki (18px, medium) ja "Muokkaa"-painike heti sen oikealla puolella muodostavat yhden paketin; alla muokkausaikaleima
- **Päivitetty:** -aikaleima otsikon alla suhteellisena ("2 päivää sitten"), tarkka päivämäärä hover-tooltipissä
- **"Tarkista päivitystarve"** -varoituschip sisällöille, joita ei ole muokattu yli 12 kk
- **Luonnos**-merkintä tarvittaessa
- **Kieliversioiden tila** HDS `StatusLabel`-komponenteilla täysillä kielinimiillä (Suomi / Ruotsi / Englanti):
  - Harmaa + `IconCheck` = ajan tasalla *(rautalankamalli-ilme: harmaasävyt)*
  - Harmaa + `IconAlertCircle` = vanhentunut
  - Harmaa + `IconError` = puuttuu kokonaan
  - Tooltip hover- ja focus-tilassa kertoo tilanteen lauseella
- **"✦ AI-käännös"** -painike (supplementary, musta) riveillä joille on valmis käännösehdotus → avaa `TranslationDrawer`
- **"Käännä"** -painike riveillä joilla käännösongelma mutta ei valmista ehdotusta

**AI-huomiot integroituna rivien alle:**

Kun AI tunnistaa sisältöön liittyvän huomion, se näytetään suoraan rivin alapuolella chipillä:
- Harmaa + ikoni = päällekkäinen sisältö + "Vertaa sivuja" (`IconDocumentGroup`) → avaa `CompareDialog`
- Harmaa + ikoni = linkitysehdotus

---

## AI-käännösapuri (`TranslationDrawer`)

HDS Dialog -pohjainen käännöstyötila, joka avataan listarivin "✦ AI-käännös" -painikkeesta.

### Käyttäjäpolku

1. Dashboard näyttää käännöshälytyksen: *"8 sisältöä tarvitsee käännöspäivityksen. AI-käännösehdotukset ovat valmiina."*
2. Toimittaja klikkaa "✦ AI-käännös" haluamansa sisällön kohdalta
3. HDS Dialog avautuu sivun otsikolla
4. Kielivälilehdet (jos sekä sv että en tarvitsevat käännöksen)
5. AI-infopalkki kertoo: muutosten määrä + lähde (käännösmuisti vai tekoäly)
6. Kaksipalstainen näkymä: **Suomi (lähde)** | **Käännösehdotus**
7. Muuttuneet kohdat korostettu vasemmalla (keltainen reunaviiva), käännetty kohta oikealla (musta reunaviiva)
8. Jokainen käännöskohta merkitty:
   - **✦ Tekoälykäännös** — AI generoi kokonaan
   - **✓ Käännösmuistista · XX% · [Sivun nimi]** — haettu olemassa olevista hel.fi-käännöksistä
9. Inline-muokkaus: hover → kynäpainike → textarea
10. "Hyväksy käännös" → tallennetaan → dialog sulkeutuu

### Yhteys vektorivarastoon

Taustajärjestelmässä vektorisoitu hel.fi-sisältö mahdollistaa:
- **Käännösmuisti**: AI löytää identtisiä tai lähes identtisiä lausumia jo käännetyistä sivuista → hyödynnetään suoraan, ei generoida uudelleen
- **Muutostunnistus**: vektorivertailu edelliseen versioon paljastaa tarkalleen mitkä kappaleet muuttuivat → käännetään vain ne
- **Kontekstiymmärrys**: lähisivut antavat kontekstin erikoistermeille ja hel.fi:n kirjoitustyylille

### Mock-data

`src/data/mockTranslations.ts` sisältää käännöstehtävät neljälle sisällölle (ID:t 1, 3, 4, 5):
- Jokaiselle on suomenkieliset lähdekappaleet, joista osa merkitty `changed: true`
- Svenska- ja/tai englantikäännösluonnokset chunk kerrallaan
- Jokainen chunk merkitty statuksella: `'ai-generated'` tai `'from-memory'`
- `from-memory`-chunkeilla on `memoryMatch`: luottamusprosentti + lähdesivun nimi

---

## Suunnittelupäätökset

### Värilogiikka: musta ja harmaat (rautalankamalli)

Protossa siirryttiin tietoisesti kohti neutraalimpaa rautalankamalli-ilmettä. Kaikki sininen (`--color-coat-of-arms`) poistettiin linkeistä, painikkeista ja statuslabeleista:

| Elementti | Ennen | Nyt |
|-----------|-------|-----|
| Linkit (`a`) | `--color-coat-of-arms` (sininen) | `--color-black-90` |
| Linkit hover | väri tummuu | `text-decoration-thickness` paksuuntuu (Breadcrumb-logiikka) |
| Supplementary-napit | sininen | `--color-black-90` (global override) |
| Kielistatuslabelit | success/alert/error -värit | kaikki `--color-black-10` / `--color-black-70` |
| Päivitetty-teksti (vanha) | `--color-alert-dark` (keltainen) | `--color-black-70` |
| Tarkista päivitystarve -badge | keltainen tausta | `--color-black-10` tausta |
| InsightChip taustat | oranssi/sininen | `--color-black-5` |
| InsightChip ikonit | oranssi/sininen | `--color-black-60` |
| Samankaltaisuusbadget | punainen/keltainen | `--color-black-10/20/70` |

Coat-of-arms-sininen jää edelleen rakenteellisiin elementteihin: `contentRow--attention` reunaviiva hover-tilassa, TranslationDrawer-paneelit, AI-statuspalkin aksentti.

### Hover-logiikka: Breadcrumb-malli

Linkkien hover ei muuta väriä — ainoastaan `text-decoration-thickness` kasvaa 1px → 2px. Sama logiikka kuin HDS Breadcrumb-komponentissa.

### Linkkiotsikon typografia

Listarivien otsikkolinkit: `font-size: var(--fontsize-body-l)` (18px) + `font-weight: 500` (medium-leikkaus). Aiemmin `--fontsize-body-m` (16px) + `font-weight: 600` (semi-bold).

### Muokkaa-painikkeen sijainti

"Muokkaa"-painike siirretty oikean reunan actions-alueelta otsikkolinkin välittömäksi naapuriksi. Rakenne:

```
[titleArea: flex row, align-items: center]
  [titleContent: flex column]
    sivun otsikkolinkki (18px medium)
    päivityspvm + varoitukset
  [Muokkaa-painike: align-self: center]
```

Perustelu: otsikko ja muokkauspainiike muodostavat semanttisen yksikön — "tämä sivu, muokkaa sitä". Actions-alue jää AI-käännös-painikkeelle.

### Similarity-chipien ja tekijätiedon poisto

Samankaltaisuusaste-chipit ("Korkea samankaltaisuus" / "Kohtalainen samankaltaisuus") poistettu sekä InsightChipistä että InsightCardista. Tekijätieto poistettu samoin. Perustelut:
- Samankaltaisuusaste on tekninen mittari, ei toimintaohje käyttäjälle
- Laskenta-algoritmi ei ole tuotannossa — luku loisi väärän tarkkuuden vaikutelman
- Tekijätieto ei ole relevantti tässä toimintakontekstissa

### TranslationDrawer: HDS Dialog -pohjainen

AI-käännösapuri käyttää samaa HDS `Dialog`-komponenttia kuin "Vertaa sivuja" (`CompareDialog`). Yhtenäinen modaalikäyttäytyminen: sama leveys (95vw / max 1100px), sama header/sulkemislogiikka, sama `Dialog.ActionButtons`.

### Samankaltaisuusaste laadullisena, ei numeerisena

Prototyypissä näytettiin aluksi prosenttiluku (esim. 81%). Tämä muutettiin laadulliseksi indikaattoriksi ("Korkea / Kohtalainen samankaltaisuus"), joka myöhemmin poistettiin kokonaan — toimintapainiike riittää.

### Proaktiiviset vs. reaktiiviset huomiot

Prototyypissä huomiot ovat proaktiivisia. Tuotannossa kustannukset ratkaisevat:
- **Embedding-pohjainen vertailu** (suositeltava): lasketaan kerran per sisältö, tallennetaan, verrataan yöllä → kustannus minimaalinen
- **LLM-pohjainen arviointi**: vain käyttäjän pyynnöstä ("Vertaa sivuja") → kallis, mutta tarkka

### Kognitiivinen saavutettavuus — AI-korttidesignin iteraatio

AI-korttien (`AiInsights`) design iteroitiin design-arvion pohjalta. Muutokset:

| Ongelma | Korjaus |
|---------|---------|
| Harhaanjohtava nuoli sivujen välissä | Korvattu kursiivilla *"muistuttaa sivua"* — symmetrinen, ei-suuntainen |
| Versaalit 11px tyyppilaabelissa | Sentence case 13px |
| Liikaa tietoa oletustilassa | Osio + tekijä siirretty toggle-sisältöön → tekijä poistettu kokonaan |
| Toggle ei kommunikoinut tilaa | Lisätty kulmaikoni (▼/▲) |

### AI-huomiot integroitu ContentList-näkymään

Aluksi suunniteltiin erillinen "AI-huomiot" -osio sivulle (`AiInsights`). Päätettiin integroida huomiot suoraan sisältölistan rivien alle chippeina. `AiInsights.tsx` on säilytetty tiedostona paluumahdollisuutta varten.

### HDS:n semanttiset statusvärit

Aiemmissa iteraatioissa käytettiin liikennevälineiden brändivärejä varoituksiin (`--color-metro`, `--color-metro-dark`). Korjattu käyttämään HDS:n semanttisia statusvärejä koko sovelluksen läpi.

---

## Hel.fi-sisältöanalyysi: päällekkäisyydet Yritykset ja työ -instanssissa

Crawl-analyysi tehtiin maaliskuussa 2026 (~30 sivua). Löydökset:

**~40–50% sivuista sisältää merkittävää päällekkäisyyttä jonkin muun sivun kanssa.**

Selkein tapaus — kansainvälinen rekrytointi, 3 sivua joista kaksi on käytännössä sama:
- `/tyonantajat/rekrytointi-suomesta-ja-ulkomailta` — suppea yleiskatsaus
- `/tukea-rekrytointiin-ulkomailta` — sama aihe syvemmin
- `/tyonantajille-suunnatut-palvelut-kansainvalisen-tyoyhteison-kehittamiseen` — jatkaa edellistä

Muita päällekkäisyysryhmiä:
- Yritysneuvonta kolmessa osiossa (sama palvelu: Business Helsinki)
- Startup-tilat vs. hautomot ja kiihdyttämöt (kohderyhmä sama, käsitteiden raja epäselvä)
- Tapahtumakalenteri kahtena erillisenä sivuna (työnhakijat + yrittäjät)

**Juurisyy:** Sivusto on organisoitu käyttäjäroolin *ja* elinkaarivaiheen mukaan, mutta palvelutarjoama on yksi ja sama. Sivuja on luotu eri aikoina eri osioihin ilman konsolidointia.

---

## GitHub ja julkaisu

### Repositorio

```
https://github.com/hannu-kivimaki/hel-protos
```

Prototyyppi sijaitsee hakemistossa `hel-proto-ai-dashboard/` monorepo-rakenteen sisällä (samassa repossa kuin `hel-proto-sidenavigation/`).

### GitHub Pages — live-osoite

```
https://hannu-kivimaki.github.io/hel-protos/hel-proto-ai-dashboard/
```

### Automaattinen deploy

Push `main`-haaraan käynnistää GitHub Actions -workflown (`.github/workflows/deploy.yml`), joka:

1. Buildaa `hel-proto-sidenavigation/` → `dist/`
2. Buildaa `hel-proto-ai-dashboard/` → `dist/`
3. Yhdistää build-tulokset yhteen artifaktiin (sidenavigation juureen, dashboard alihakemistoon)
4. Deployaa GitHub Pagesiin

Build kestää n. 2–3 minuuttia. Tilan voi tarkistaa:
```
https://github.com/hannu-kivimaki/hel-protos/actions
```

### Hakukoneet

Sivusto on suojattu indeksoinnilta kahdella tasolla:
- `hel-proto-sidenavigation/public/robots.txt` — `Disallow: /` koko sivustolle
- `<meta name="robots" content="noindex, nofollow">` molemmissa `index.html`-tiedostoissa

### Paikallinen kehitys vs. GitHub Pages

`vite.config.ts`:ssa on määritelty `base: '/hel-protos/hel-proto-ai-dashboard/'`, joka vaaditaan GitHub Pagesin alihakemistorakenteeseen. Paikallinen kehityspalvelin (`npm run dev`) toimii normaalisti osoitteessa `http://localhost:5173` tästä huolimatta.

---

## Tekniset huomiot

- React 18 + TypeScript + Vite
- HDS React 3.11 (`hds-react`), asennus `--legacy-peer-deps` (peer dep -konflikti React 18:n kanssa)
- HelsinkiGrotesk-fontti ladataan makasiini.hel.ninja-palvelimelta
- Header- ja layout-pattern (`app-header`, `centered-container`, `dashboard-content`) kopioitu hel-proto-sidenavigation-projektista yhtenäisyyden varmistamiseksi
- CSS-moduulit komponenttikohtaiseen tyylitykseen
- Globaalit linkkityylit ja supplementary-napit override global.css:ssä (`--color-black-90`, Breadcrumb-hover)
- `--spacing-2xs` -tokenin fallback `8px` lisätty (token ei välttämättä kaikissa HDS-versioissa)

---

## Seuraavat askeleet

- [x] Kieliversioiden hallintanäkymä — AI-käännösapuri (`TranslationDrawer`) toteutettu
- [ ] Selkeäkielisyys- ja saavutettavuustarkistin
- [ ] SEO/GEO-sisällön laadun arvioija — vanhojen sisältöjen nostaminen
- [ ] Samankaltaisuustunnistuksen tekninen konsepti — embedding-arkkitehtuuri

---

## Konventiot

- Kaikki UI-teksti suomeksi
- Vain HDS-komponentit (ei muita UI-kirjastoja)
- HDS design tokenit kaikkeen tyylitykseen
- Drupal-yhteensopivuuskommentit komponenteissa:
  ```tsx
  // ✅ HDS Core: Button – Suoraan Drupalissa
  // ⚠️ HDS React: Header – VAATII Drupal-sovituksen
  ```
- Drupal-toteutusmuistiinpanot: `DRUPAL_IMPLEMENTATION.md`
