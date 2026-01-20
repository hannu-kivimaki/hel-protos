# SideNavigation (hel.fi) - handoff doc

## Tavoite
Sivunavigaatio isommille palvelukokonaisuuksille. Toimii 1-4 tasolla, tukee
aktiivisen sivun korostuksen, animoidun indikaattorin ja mobiilin avaus/sulku.

## Käyttö
- Käytä, kun sivukokonaisuus vaatii hierarkisen rakenteen (1-4 tasoa).
- Ei käytetä pienille listauksille tai yksitasoisiin linkkilistoihin.

## Data ja API (React-prototyyppi)
```ts
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
}

<SideNavigation
  items={navigationItems}
  activeId={activeId}
  onNavigate={setActiveId}
  sectionTitle="Navigaatio"
  backHref="#"
  backLabel="Takaisin"
  toggleLabel="Sivunavigaatio"
/>
```

## Drupal-kohdistus (HDS)
- ⚠️ HDS React: SideNavigation on custom. Drupalissa toteutus:
  - Menu system + custom JS + HDBT theme.
  - `activeId` vastaa nykyistä reittiä (route/alias).
  - `aria-current="page"` asetetaan aktiiviselle linkille.
  - 1-4 tasoa sallittu; ylimenevät tasot ei käytössä.

## Käyttöteksti (Helsinki Content)
- Kaikki otsikot ja linkit suomeksi.
- Linkkitekstit kuvaavia, ei "Lue lisää".
- Mobiilissa kiinteä "Sivunavigaatio" -teksti avauspainikkeessa.

## Visuaalinen malli

### Fonttikoko ja -paino
- Fonttikoko: 18px kaikilla tasoilla.
- Fonttipaino:
  - Normaali item: 400 (regular)
  - Vanhempi-item (parent, jolla lapsia): 500 (medium)
  - Ancestor-polku aktiiviseen: 500 (medium)
  - Aktiivinen sivu: 700 (bold)

### Tekstin sisennys
- Taso 0: 16px vasemmalta.
- Taso 1: 32px vasemmalta.
- Taso 2: 48px vasemmalta.
- Taso 3: 64px vasemmalta (valmius).

### Indikaattorit
- **Aktiivinen indikaattori**: 4px leveä, koko rivin korkuinen, `var(--color-black-90)`, terävät reunat.
- **Ancestor-indikaattori**: 4px leveä, 1/4 rivin korkeudesta (~13px), `var(--color-black-20)`, terävät reunat.
  - Näkyy kaikilla ancestor-itemeillä polulla aktiiviseen sivuun.
  - Sijaitsee samalla x-tasolla kuin itemin sisennys.

### Vertikaalinen runkolinja (spine)
- 1px leveä `var(--color-black-20)` viiva yhdistää sisaritasoiset itemit.
- Näkyy juuritasolla (level-0) sekä avatuissa alavalikoissa (submenu).
- Juuritasolla sijaitsee vasemmassa reunassa (left: 0).
- Alavalikoissa sijaitsee lapsien sisennystasolla.

### Muut tyylit
- Aktiivinen tausta: `var(--color-black-5)`.
- Hover: tekstin alleviivaus. Tekstin väri: `var(--color-black-90)`.

## Interaktiot ja tilat
- Kaikki rivit ovat linkkejä.
- Jos itemilla on lapsia:
  - erillinen chevron-painike avaa/sulkee (ei vaikuta linkin aktivointiin).
- Aktiivinen sivu:
  - korostus taustalla + täysikokoinen indikaattoriviiva.
- Ancestor-itemit (polku aktiiviseen):
  - 1/4-korkuinen indikaattoriviiva + 500 fonttipaino.
  - Ei taustaväriä (erotuksena aktiivisesta).

## Saavutettavuus
- Focus-tyyli: vain tekstin ympärys, ei koko rivi.
- Focus-väri: `var(--color-black-90)`.
- `aria-current="page"` aktiiviselle linkille.
- `aria-expanded` togglen tilalle.
- `aria-label` takaisin-linkissä sisältää osion nimen: "Takaisin: [sectionTitle]".
- Toggle-painikkeen väri: `var(--color-black-70)` (4.5:1 kontrasti).

## Responsiivisuus
- Mobiilissa:
  - yläpuolella kiinteä "Sivunavigaatio" painike.
  - avaus luo taustavarjon (backdrop blur) ja sulkeutuva paneeli.
- Desktopissa:
  - aina auki.

## Animaatiot
- Indikaattori seuraa aktiivista itemia animoidusti (RAF).
- Indikaattorin x-positio = tason sisennys (16px * taso).
- Alivalikon avaus: `grid-template-rows` animaatio + staggered item reveal.
- Easing: `cubic-bezier(0.0, 0.0, 0.2, 1)` (subdued ease-out, ei bounceria).
- `prefers-reduced-motion` poistaa animaatiot.

## Tulostus
- Mobiili-toggle, backdrop, indikaattorit ja toggle-painikkeet piilotetaan.
- Runkolinja (spine) piilotetaan.
- Kaikki alavalikot näytetään avoimina.

## Tekniset huomiot
- CSS-muuttujat:
  - `--sidenav-row-height: 52px`
  - `--sidenav-indicator-width: 4px`
  - `--sidenav-indent`: dynaaminen, asetetaan inline-tyylillä per rivi.
  - `--sidenav-parent-indent`: välitetään alavalikkoihin runkolinjan sijoitusta varten.
- Fontti: HelsinkiGrotesk (HDS). Fallback Arial ei tue 500-painoa.

## Jatkokehitys (next iteration)
1) Liitä Drupal-menuun (menu tree + route active state).
2) Sido `activeId` reittiin ja breadcrumbeihin.
3) Lisää ruotsin ja englannin sisällöt (hel.fi vaatimukset).
4) Varmista fokusrenkaan kontrasti testauksella.
5) Rajoita tasot: jos data sisältää >4 tasoa, näytä virheilmoitus.

## Muutoshistoria

### 2025-01 - UI/UX-parannukset
- **Indikaattorit**: Terävät reunat (ei border-radius). Ancestor-indikaattori 1/4 korkeudesta, `black-20`.
- **Ancestor-polku**: Ei enää taustaväriä. Näytetään indikaattori + 500 fonttipaino kaikilla ancestoreilla.
- **Runkolinja**: Lisätty 1px `black-20` vertikaalinen viiva yhdistämään sisaritasoiset itemit. Näkyy myös juuritasolla.
- **Animaatio**: Subdued ease-out (`cubic-bezier(0.0, 0.0, 0.2, 1)`) korvaa bouncerin.
- **Hover**: Yksinkertaistettu, vain alleviivaus (ei taustaväriä). Tekstin väri `black-90`.
- **Mobiili-toggle**: Käyttää kiinteää "Sivunavigaatio" tekstiä (ei aktiivisen sivun nimeä).
- **Takaisin-linkki**: Parannettu `aria-label` sisältää osion nimen.
- **Typografia**: Fontti 18px ja `black-90` väri kaikilla tasoilla (ei enää vaaleampaa väriä syvillä tasoilla).
- **Toggle-painike**: Kontrasti parannettu (`black-70`).
