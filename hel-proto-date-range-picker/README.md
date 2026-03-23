# DateRangePicker — HDS-prototyyppi

Päivämäärävälin valitsin Helsingin kaupungin HDS (Helsinki Design System) -tyylisesti toteutettuna. Prototyyppi demonstroi, miten HDS DateInput -komponentin ulkoasua ja toimintalogiikkaa voi laajentaa range-valintaan.

## Tausta ja tavoite

HDS ei sisällä valmista date range picker -komponenttia. Tämä prototyyppi tutkii, miltä sellainen voisi näyttää ja toimia HDS:n visuaalisten ja toiminnallisten periaatteiden mukaisesti. Tarkoitus on toimia suunnittelukeskustelun pohjana ennen mahdollista virallista HDS-toteutusta tai palvelukohtaista ratkaisua.

## Demo

Kolme käyttötapausta:

| Demo | Kuvaus |
|------|--------|
| **Range-korostusväri** | Kaksi värivaihtoehtoa rinnakkain: `bus` (sininen) ja `black` (harmaa) |
| **Analytiikka / raportointi** | Menneisyyteen katsovat pikavalinnat, `maxDate=tänään`, kalenteri aukeaa edelliseen kuuhun |
| **Ilman pikavalintoja** | Vapaa välinvalinta ilman preset-painikkeita |

## Stack

- React 18 + TypeScript
- Vite
- [react-day-picker](https://react-day-picker.js.org/) v8 — kalenteripohja
- [date-fns](https://date-fns.org/) — päivämäärälaskenta ja lokalisointi
- [hds-react](https://hds.hel.fi/) 3.11 — HDS-komponentit, ikonit ja design tokenit

## Komponentti: `DateRangePicker`

### Props

| Prop | Tyyppi | Pakollinen | Oletus | Kuvaus |
|------|--------|------------|--------|--------|
| `id` | `string` | kyllä | — | Kenttien id-etuliite (accessibility) |
| `label` | `string` | kyllä | — | Kentän otsikko |
| `language` | `'fi' \| 'sv' \| 'en'` | ei | `'fi'` | Käyttöliittymän kieli |
| `value` | `DateRange` | kyllä | — | Vahvistettu valinta (`{ startDate, endDate }`) |
| `onChange` | `(range: DateRange) => void` | kyllä | — | Callback kun valinta vahvistetaan |
| `minDate` | `Date` | ei | — | Aikaisin valittavissa oleva päivä |
| `maxDate` | `Date` | ei | — | Myöhäisin valittavissa oleva päivä |
| `presetRanges` | `PresetRange[]` | ei | `[]` | Pikavalinnat dialogin alaosassa |
| `defaultMonth` | `Date` | ei | Valittu alku / nykykuukausi | Kuukausi, jolle kalenteri aukeaa |
| `required` | `boolean` | ei | `false` | Merkitsee pakolliseksi (tähti + aria) |
| `disabled` | `boolean` | ei | `false` | Poistaa kentän käytöstä |
| `errorText` | `string` | ei | — | Virheteksti (näkyy punaisen reunan kera) |
| `helperText` | `string` | ei | — | Aputeksti kentän alla |
| `colorScheme` | `'bus' \| 'black'` | ei | `'bus'` | Välikorostuksen väripaletti |

### Tyypit

```ts
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PresetRange {
  label: string;
  getRange: () => { startDate: Date; endDate: Date };
}
```

### Esimerkki

```tsx
import { DateRangePicker } from './components/DateRangePicker';
import type { DateRange, PresetRange } from './components/DateRangePicker';
import { startOfWeek, endOfWeek } from 'date-fns';

const presets: PresetRange[] = [
  {
    label: 'Tällä viikolla',
    getRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
];

function MyComponent() {
  const [range, setRange] = useState<DateRange>({ startDate: null, endDate: null });

  return (
    <DateRangePicker
      id="my-range"
      label="Ajankohta"
      language="fi"
      value={range}
      onChange={setRange}
      presetRanges={presets}
      colorScheme="bus"
    />
  );
}
```

## Visuaaliset ratkaisut

### Välikorostus

Käytetään CSS `background-image` + `background-size: 100% 34px` -tekniikkaa, joka rajoittaa korostusvärin tarkalleen päiväpainikkeen korkeuteen (34px). Pelkkä `background-color` täyttäisi koko 40px solun ja näyttäisi erilevyiseltä kuin valittu päivä.

- Välikorostuksen väri asetetaan CSS-muuttujalla `--drp-range-bg`
- `bus`-teema: `--color-bus-light` (#f0f0ff)
- `black`-teema: `--color-black-10` (#e6e6e6)

### HDS-fokusrengas

HDS DateInput käyttää rakenteellista sisäistä kehystä fokusaukon luomiseen. Tässä komponentissa sama efekti toteutetaan kaksitasoisella `box-shadow`-arvolla:

```css
box-shadow: 0 0 0 2px #fff, 0 0 0 5px var(--color-coat-of-arms);
```

Navigointipainikkeiden fokusrengas on nelikulmainen (`border-radius: 0`), päiväpainikkeiden pyöreä.

### Navigointipainikkeet (moniKuukausinäkymä)

react-day-picker v8 sijoittaa moniKuukausinäkymässä navigointipainikkeet `position: absolute` -tyylisesti, mikä aiheutti päällekkäisyyden kuukausiotsikon kanssa. Korjaus: override `position: static` ja `order: -1` (edellinen kuukausi -painike) flex-järjestyksen hallintaan.

### Tänään-viiva

HDS DateInput merkitsee nykyisen päivän `::after`-pseudo-elementillä (2px alhaalla). Toteutettu vastaavasti — väri vaihtuu valkoiseksi kun päivä on alkupäivänä tai loppupäivänä (tumman taustan päällä).

### Tyhjennä-painike

Käyttää samaa ikonia (`IconCrossCircle`) ja samaa visuaalista logiikkaa kuin HDS SearchInput: ei reunaviivaa, ei hover-taustaväriä, pelkkä ikoni padding-kehyksellä. Näkyy vain kun valinta on vahvistettu.

### Väripaletin painikkeet (black-teema)

| Painike | Oletustila | Hover |
|---------|-----------|-------|
| Supplementary (pikavalinnat, Sulje) | transparent, musta teksti | `#f2f2f2` (black-5) |
| Secondary (Valitse) | transparent, musta teksti, musta reuna | `rgba(0,0,0,0.05)` (5 % musta), musta teksti, musta reuna |

## Käyttöliittymälogiikka

- **Kaksi vaihetta:** käyttäjä valitsee ensin alkupäivän, sitten loppupäivän kalenterista klikkaamalla
- **Vahvistus vasta Valitse-painikkeella:** välitila ei tallenny ennen vahvistusta; Sulje tai klik ulkopuolelle palauttaa edelliseen vahvistettuun valintaan
- **Tekstikentät:** alkupäivä ja loppupäivä voi kirjoittaa myös suoraan (muoto `pp.kk.vvvv`); kalenteri synkronoi blur-tapahtumassa
- **Pikavalinnat:** asettavat välin suoraan, käyttäjä vahvistaa vielä Valitse-painikkeella
- **Focus trap:** Tab-kierto pysyy dialogin sisällä; Esc sulkee dialogin
- **Screen reader:** `aria-live="polite"` -alue kuuluttaa valinnan vaiheen muutokset

## Kehitysympäristö

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Tiedostorakenne

```
src/
  components/
    DateRangePicker.tsx   # Komponentti + tyypit + logiikka
    DateRangePicker.css   # HDS-tyylit (react-day-picker override)
  App.tsx                 # Demo-sivu kolmella käyttötapauksella
  index.css               # HelsinkiGrotesk-fontti + demo-asettelu
  main.tsx                # Entry point
```
