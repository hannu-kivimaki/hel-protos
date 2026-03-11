# Drupal-toteutusmuistiinpanot

Handoff-dokumentaatio prototyypin muuntamiseksi Drupal-toteutukseksi.

---

## Komponentti-inventaario

### ✅ HDS Core — Suoraan Drupalissa

| Komponentti | Käyttö protossa | Drupal-vastine |
|-------------|-----------------|----------------|
| `Button` | Muokkaa-painike joka rivillä; "Avaa ruotsinkielinen versio" + "Hyväksy käännös" TranslationDrawerissa | HDS Core Button |
| `StatusLabel` | Kieliversioiden tila (Suomi/Ruotsi/Englanti) + "Yli vuoden vanha" -merkintä sisältölistalla; "Tekoälykäännös" (`type="neutral"` + `IconGlobe`) ja "Muuttunut kohta" (`type="alert"` + `IconInfoCircle`) TranslationDrawerissa | HDS Core StatusLabel |
| `Notification` | AI-käännösehdotuksen statusviesti TranslationDrawerissa (`type="info"`) | HDS Core Notification |
| `Footer` | Alatunniste | HDS Core Footer |
| `Logo` | Helsinki-logo headerissa ja footerissa | HDS Core Logo |

> **Huom:** `Tag`-komponentti poistettiin sisältölistariviltä — sisältötyyppi- ja osastotieto ei ole relevantti tässä näkymässä. "Näytä"-painike poistettiin — otsikkolinkki vie julkiseen näkymään.

### ⚠️ HDS React — VAATII Drupal-sovituksen

| Komponentti | Käyttö protossa | Drupal-ratkaisu | Arvio |
|-------------|-----------------|-----------------|-------|
| `Header` | Koko sivun header, navigaatio, kielenvalinta, käyttäjävalikko | Menu system + custom JS + HDS CSS | 8–12h |
| `Breadcrumb` | Murupolku headerin alla | Custom block tai Easy Breadcrumb -moduuli + HDS CSS | 2–4h |
| `Dialog` | "Vertaa sivuja" -dialogi (`CompareDialog`) | Drupal Modal module tai custom dialog + HDS CSS | 4–6h |
| `Dialog` | AI-käännösapuri (`TranslationDrawer`) — kaksisarakkeinen lähde–käännös-näkymä | Sama dialogi-infrastruktuuri kuin CompareDialog; sisältödata haetaan Drupal API:sta, käännösehdotukset AI-palvelusta | 8–12h |
| `Tabs` | Kielivalinta TranslationDrawerissa kun useita käännöskieliä | Custom JS + HDS CSS (tabs-roolimalli); `initiallyActiveTab` ei suoraan Drupalissa — käytetään JS-tilanhallintaa | 3–5h |

### Täysin custom — ei HDS-vastinetta

Nämä komponentit on toteutettava Drupalissa custom-logiikalla:

| Komponentti | Kuvaus | Huomiot |
|-------------|--------|---------|
| `DashboardGreeting` | Personoitu tervehdys + 4 tilakorttia kahdessa ryhmässä | Vaatii käyttäjäkohtaisen datan (julkaistut, muokatut, vanhentuneet, kieliversiot) — Drupal Views tai custom moduuli |
| `ContentList` | Sisällöntuottajan oma sisältölista kieliversion tiloineen + AI-chipit integroituna | Drupal Views + suhteet node-käännöksiin + muokkausajat + AI-datasyöte |
| `LangBadge` / tooltip | StatusLabel-wrapper joka näyttää kieliversion tilan tooltipillä | Custom CSS-tooltip; Drupalissa tooltip voidaan toteuttaa title-attribuutilla tai JS-tooltipillä |
| `InsightChip` | AI-huomiorivi sisällön alla (osa `ContentList`) — ilman samankaltaisuuschipejä tai tekijätietoa | Renderöidään Views-riviin, data tulee AI-palvelusta |
| `CompareDialog` | Rinnakkaisvertailu kahdesta samankaltaisesta sivusta | Avautuu "Vertaa sivuja" -painikkeesta (`IconDocumentGroup`-ikonilla), sisältödata haetaan Drupal API:sta |
| `TranslationDrawer` | AI-käännösapuri — lähde (FI) ja käännösluonnos rinnakkain, chunk-tason muokkaus | Avautuu "AI-käännös"-painikkeesta; FI-source chunkataan, käännösehdotukset haetaan AI-palvelusta tai käännösmuistista |

---

## Datalähteet

### DashboardGreeting — tilastot

| Tieto | Drupal-lähde |
|-------|-------------|
| Julkaistujen sisältöjen määrä | `SELECT COUNT(*) FROM node WHERE uid = :uid AND status = 1` |
| Muokattu viim. 30 pv | `WHERE changed > :30_days_ago` |
| Päivitystä tarvitsee (>12 kk) | `WHERE changed < :365_days_ago` |
| Kieliversio puuttuu tai vanha | Käännöskenttien vertailu + muokkausaikaleimapVertailu |

### ContentList — kieliversion tila

Kieliversion tilan laskenta edellyttää:
1. Noden kaikki käännökset haetaan
2. Jokaisen käännöksen `changed`-aikaleima verrataan fi-version `changed`-aikaleimaan
3. Jos fi on uudempi → `outdated`; jos käännöstä ei ole → `missing`

### TranslationDrawer — datamalli

| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| `sourceLastModified` | ISO date | Suomenkielisen version viimeisin muokkaus — aina tuorein |
| `generatedAt` | ISO datetime | Milloin AI-luonnos generoitiin |
| `translationLastModified` | ISO date (optional) | Milloin olemassa oleva käännös viimeksi hyväksyttiin — näytetään käännöskolumnin "Päivitetty"-leimana; aina vanhempi kuin `sourceLastModified` |

> Käännöskolumnin aikaleima: `outdated`-tilanteessa näytetään `translationLastModified`, `missing`-tilanteessa `generatedAt`.

### AiInsights — päällekkäisyysanalyysi

Päällekkäisten sisältöjen tunnistaminen on erillinen palvelu, ei Drupal-natiivi toiminto. Ehdotettu arkkitehtuuri:

1. **Embedding-laskenta:** Kun sisältöä julkaistaan tai muokataan, tekstistä lasketaan vektori (esim. `text-embedding-3-small`)
2. **Tallennus:** Vektori tallennetaan erilliseen vektoritietokantaan (esim. pgvector PostgreSQL-laajennuksella)
3. **Yöajot:** Cosine similarity -vertailu kaikkia saman instanssin sisältöjä vastaan, kynnysarvo > 0.70
4. **Tulokset:** Tallennetaan Drupal-entiteettinä tai custom-tauluun, näytetään käyttäjälle seuraavalla kirjautumiskerralla

> **Huom:** Samankaltaisuusaste (Korkea/Kohtalainen-chipit) on poistettu UI:sta — arvo jää taustatietoon eikä näy käyttäjälle. Sisällön tekijätieto on myös poistettu näkymästä.

### TranslationDrawer — AI-käännöstyönkulku

Kieliversioiden hallinta on tunnistettu suurimmaksi kipupisteeksi käyttäjätutkimuksessa. AI-käännösapuri vastaa tähän tarpeeseen:

1. **Chunkkaus:** FI-sisältö pilkotaan loogisiin kappaleisiin (heading, paragraphs, lists) — hel.fi-sisällön vektorisointi/chunkkaus rakennetaan backendin puolelle
2. **Käännösmuisti (Translation Memory):** Aiemmin hyväksyttyjä käännöksiä haetaan vektorihaulla (`cosine similarity`) — jos match yli 0.85, käytetään suoraan muistista (`from-memory`), muuten AI generoi (`ai-generated`)
3. **Diff-detektointi:** Verrataan nykyistä FI-chunkkia aiempaan versioon — muuttuneet chunkit merkitään `changed: true` ja korostetaan UI:ssa
4. **Käyttäjä tarkistaa:** Kaksisarakkeinen näkymä (FI lähde | käännösluonnos), chunk kerrallaan — käyttäjä voi muokata inline ennen hyväksyntää
5. **Hyväksyntä:** Käyttäjä hyväksyy koko luonnoksen "Hyväksy käännös" -painikkeella, jolloin käännös tallentuu Drupal-käännöskenttiin

**Näkymälogiikka:**
- Uusi käännös (`missing`): näytetään kaikki chunkit — koko sivun käännös
- Päivityskäännös (`outdated`): näytetään vain muuttuneet chunkit (`changed: true`) — käyttäjän ei tarvitse selata koko sivua

**Merkintätavat chunk-tasolla:**
- `Tekoälykäännös` — HDS `StatusLabel type="neutral"` + `IconGlobe`; LLM on tuottanut käännöksen (tarkista huolella)
- `Muuttunut kohta` — HDS `StatusLabel type="alert"` + `IconInfoCircle` lähdesolussa; suomenkielinen teksti on muuttunut edellisen käännöksen jälkeen
- `Käännösmuistista · XX%` — custom badge käännössolussa; aiempi hyväksytty käännös, confidence-prosentti ja lähdesivun nimi

**AI-statusviesti (HDS Notification, `type="info"`):**
- Uusi käännös: "Käännösehdotus on valmis tarkistettavaksi."
- Päivitys: "Käännösehdotukset on laadittu N muuttuneelle kohdalle."

**Sarakeotsikoiden tyyli:**
- Ei versaaleja, ei paksua fonttia — `font-weight: 500`, `color: --color-black-70`
- Kieliä merkitään `IconGlobe`-ikonilla (ei emoji-lipuilla)
- Molemmissa sarakkeissa aikaleima: suomi = `sourceLastModified`, käännös = `translationLastModified` (koska suomi on aina tuorein versio); uudelle käännökselle `generatedAt`

**Painikkeet (oikealle tasattu):**
- "Avaa ruotsinkielinen/englanninkielinen versio" (`variant="secondary"`, `iconLeft=IconPen`) — avaa kyseisen kieliversio editorissa
- "Hyväksy käännös" (`variant="primary"`) — tallentaa käännösluonnoksen Drupal-käännöskenttiin
- Molemmat painikkeet tasattu oikealle (`justify-content: flex-end`) — visuaalisesti linjassa käännöskolumnin kanssa

---

## Design tokenit

Kaikki tyylitys käyttää HDS CSS custom -propertyjä. Nämä ovat saatavilla Drupalissa HDS Core CSS:n kautta.

```css
/* Päävärit */
--color-coat-of-arms       /* #0000BF — käytetään vain badge-elementeissä (AI-huomioiden laskuri) */
--color-coat-of-arms-dark  /* tummempi hover */

/* Semanttiset statusvärit — käytetään kaikissa varoituksissa */
--color-alert              /* keltainen — varoitus */
--color-alert-dark         /* tumma keltainen — teksti varoitustilassa */
--color-alert-light        /* vaalea keltainen — taustaväri varoitustilassa */
--color-error              /* punainen — kriittinen / puuttuu */
--color-error-light        /* vaalea punainen — taustaväri virhetilassa */

/* Harmaat — pääasiallinen väripaletti rautalankamallitilassa */
--color-black-5 … --color-black-90

/* Välistys */
--spacing-2xs … --spacing-2-xl
/* Huom: --spacing-2xs ei välttämättä ole määritelty HDS 3.11:ssä — käytä fallback-arvoa: var(--spacing-2xs, 8px) */

/* Typografia */
--fontsize-body-s, -m, -l
--fontsize-heading-s … -xl
--lineheight-s, -m, -l
```

**Värilogiikka (rautalankamallitila):**

| Elementti | Väri | Huomio |
|-----------|------|--------|
| Linkit | `--color-black-90` | Ei sinistä; hover = `text-decoration-thickness: 2px` (Breadcrumb-tyyli) |
| Supplementary-painikkeet | `--color-black-90` | Ohitetaan HDS:n oletussininen globaalilla CSS-yliajoilla |
| Kielistatuslabelit | `--color-black-10/20/60/70` | Kaikki labelit harmaina, ikonit säilyvät |
| Vanhentunut sisältö -varoitus | `--color-black-70/10` | Ei ambervärejä |
| InsightChip / InsightCard | `--color-black-5/20/40/60/70` | Harmaa kaikille |
| Päällekkäisyys/linkki-kortti reunus | `--color-black-40` | Ei punaista/sinistä |

> **Huom:** Prototyypin varhaisissa versioissa käytettiin liikennevälineiden brändivärejä (`--color-metro`, `--color-metro-dark`) varoitustilaan. Korjattu semanttisiin statusväreihin (`--color-alert`, `--color-alert-dark`). Nykyisessä rautalankamallitilassa kaikki statusvärit on ylikirjoitettu harmailla.

HelsinkiGrotesk-fontti ladataan erillisellä `@font-face`-määrittelyllä makasiini.hel.ninja-palvelimelta. Drupalissa fontti tulee HDS Core CSS:n mukana tai voidaan ladata samasta lähteestä.

---

## Saavutettavuusvaatimukset

- Kaikilla interaktiivisilla elementeillä on `aria-label` tai näkyvä teksti
- Kieliversion badge-elementit kommunikoivat tilan ruudunlukijalle (`aria-label`)
- Ohita-navigointilinkki (`Header.SkipLink`) on toteutettava myös Drupalissa
- Kokoontaitettavat osiot käyttävät `aria-expanded` + `aria-controls`
- Fokustila näkyvissä kaikissa interaktiivisissa elementeissä (HDS CSS hoitaa)
- Fokusrengas piilotetaan hiirinavigaatiossa CSS-säännöllä `*:focus:not(:focus-visible) { outline: none }` — näkyy vain näppäimistönavigaatiossa

---

## Kielisisältö

Kaikki UI-teksti on suomeksi. Ruotsinkieliset käännökset vaaditaan tuotantoon.

| Suomi | Ruotsi |
|-------|--------|
| Julkaistua sisältöä | Publicerat innehåll |
| Muokattu viim. 30 pv | Redigerat senaste 30 dg |
| Päivitystä tarvitsee | Behöver uppdatering |
| Kieliversio puuttuu tai vanha | Språkversion saknas eller är gammal |
| Tilannekuva | Översikt |
| Vaatii huomiota | Kräver uppmärksamhet |
| Omat sisällöt | Mitt innehåll |
| Päivitetty: | Uppdaterad: |
| Tarkista päivitystarve | Kontrollera uppdateringsbehovet |
| Muokkaa | Redigera |
| Suomi | Finska |
| Ruotsi | Svenska |
| Englanti | Engelska |
| Suomenkielinen versio on ajan tasalla. | Den finska versionen är uppdaterad. |
| Suomenkielinen versio on vanhentunut. | Den finska versionen är föråldrad. |
| Ruotsinkielinen versio on vanhentunut – päivitä käännös. | Den svenska versionen är föråldrad – uppdatera översättningen. |
| Englanninkielinen versio puuttuu kokonaan. | Den engelska versionen saknas helt. |
| Päällekkäinen sisältö | Överlappande innehåll |
| Linkitysehdotus | Länkningsförslag |
| Vertaa sivuja | Jämför sidor |
| Lisää linkki | Lägg till länk |
| Ohita | Ignorera |
| muistuttaa sivua | liknar sidan |
| Miksi tämä ehdotetaan? | Varför föreslås detta? |
| Piilota lisätiedot | Dölj mer information |
| Kohdesivun osio | Målsidans sektion |
| Käännä | Översätt |
| AI-käännös | AI-översättning |
| sisältöä tarvitsee käännöspäivityksen | innehåll behöver översättningsuppdatering |
| AI-käännösehdotukset ovat valmiina. | AI-översättningsförslag är klara. |
| AI-käännösapuri | AI-översättningsassistent |
| Lähde (suomi) | Källa (finska) |
| Käännösluonnos | Översättningsutkast |
| AI-generoitu | AI-genererad |
| Muistista | Från minnet |
| Muokkaa käännöstä | Redigera översättning |
| Peruuta | Avbryt |
| Tallenna | Spara |
| Hyväksy käännös | Godkänn översättning |
| Käännös hyväksytty | Översättning godkänd |

---

*Päivitetty: 2026-03-11 (istunto 2)*
