import { useState } from 'react';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInDays,
} from 'date-fns';
import { Logo, LogoSize, logoFi, logoFiDark } from 'hds-react';
import { DateRangePicker } from './components/DateRangePicker';
import type { DateRange, PresetRange } from './components/DateRangePicker';

// Pikavalinnat — tulevaisuuteen katsova (tapahtumat, varaukset)
const futurePresets: PresetRange[] = [
  {
    label: 'Tänään',
    getRange: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }),
  },
  {
    label: 'Tämä viikko',
    getRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Ensi viikko',
    getRange: () => ({
      startDate: startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
      endDate: endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Tuleva viikonloppu',
    getRange: () => {
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const saturday = new Date(weekEnd);
      saturday.setDate(weekEnd.getDate() - 1);
      return { startDate: saturday, endDate: weekEnd };
    },
  },
];

// Pikavalinnat — menneisyyteen katsova (analytiikka, raportointi)
const pastPresets: PresetRange[] = [
  {
    label: 'Tänään',
    getRange: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }),
  },
  {
    label: 'Viime viikolla',
    getRange: () => ({
      startDate: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      endDate: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Tässä kuussa',
    getRange: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
  },
  {
    label: 'Viime kuussa',
    getRange: () => ({
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
];


export default function App() {
  const [busRange, setBusRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [blackRange, setBlackRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [analyticsRange, setAnalyticsRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [basicRange, setBasicRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [reportRange, setReportRange] = useState<DateRange>({
    startDate: new Date(2026, 1, 2),  // 2.2.2026
    endDate: new Date(2026, 2, 26),   // 26.3.2026
  });
  const [bookingRange, setBookingRange] = useState<DateRange>({ startDate: null, endDate: null });

  const reportError =
    reportRange.startDate && reportRange.endDate &&
    differenceInDays(reportRange.endDate, reportRange.startDate) > 31
      ? 'Valitse enintään 31 päivän jakso'
      : undefined;

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-header__inner">
          <div className="demo-header__logo-row">
            <Logo src={logoFiDark} size={LogoSize.Medium} alt="Helsingin kaupunki" />
          </div>
          <h1 className="demo-header__title">DateRangePicker</h1>
          <p className="demo-header__desc">
            Päivämäärävälin valitseva syötekomponentti, joka laajentaa HDS Date inputin
            toiminnallisuutta. Käyttäjä valitsee ensin alkupäivän, sitten loppupäivän.
            Tuki pikavalintapainikkeille, <code>minDate</code>/<code>maxDate</code>-rajoituksille
            ja kahdelle väripaletille. Responsiivinen: mobiilissa koko ruudun modaali,
            desktopilla kompakti pudotusvalikko kahdella rinnakkaisella kuukaudella.
          </p>
          <div className="demo-header__stack">
            <span>hds-react 5.0</span>
            <span>react-day-picker v8</span>
            <span>React 18 + TypeScript</span>
          </div>
        </div>
      </header>

      <main className="demo-main">

        {/* ---- Demo 1: Kaksi väriteemat rinnakkain ---- */}
        <section className="demo-section">
          <div className="demo-section__meta">
            <h2 className="demo-section__title">Väripaletit</h2>
            <p className="demo-section__desc">
              <code>colorScheme="bus"</code> korostaa välipäivät bus-light-sinisellä,{' '}
              <code>colorScheme="black"</code> black-10-harmaalla. Valittu alku- ja
              loppupäivä merkitään aina <code>--color-bus</code>- tai mustalla täytöllä.
              Esimerkeissä tulevaisuuden pikavalinnat: tänään, tällä ja ensi viikolla,
              tänä viikonloppuna.
            </p>
          </div>
          <div className="demo-section__component demo-section__component--split">
            <div>
              <p className="demo-variant__label">
                <span className="demo-variant__swatch demo-variant__swatch--bus" />
                bus-light
              </p>
              <DateRangePicker
                id="bus-range"
                label="Ajankohta"
                language="fi"
                value={busRange}
                onChange={setBusRange}
                colorScheme="bus"
                presetRanges={futurePresets}
              />
            </div>
            <div>
              <p className="demo-variant__label">
                <span className="demo-variant__swatch demo-variant__swatch--black" />
                black-10
              </p>
              <DateRangePicker
                id="black-range"
                label="Ajankohta"
                language="fi"
                value={blackRange}
                onChange={setBlackRange}
                colorScheme="black"
                presetRanges={futurePresets}
              />
            </div>
          </div>
        </section>

        {/* ---- Demo 2: Menneisyyteen katsovat pikavalinnat ---- */}
        <section className="demo-section">
          <div className="demo-section__meta">
            <h2 className="demo-section__title">Menneisyyden pikavalinnat</h2>
            <p className="demo-section__desc">
              Pikavalinnat konfiguroidaan <code>presetRanges</code>-propilla —
              palvelu määrittää omat vaihtoehtansa käyttötapaukseen sopivasti.
              Tässä <code>maxDate=tänään</code> rajoittaa valinnan menneisyyteen
              ja <code>defaultMonth</code> avaa kalenterin edelliseen kuuhun.
            </p>
          </div>
          <div className="demo-section__component">
            <DateRangePicker
              id="analytics-dates"
              label="Tarkastelujakso"
              language="fi"
              value={analyticsRange}
              onChange={setAnalyticsRange}
              presetRanges={pastPresets}
              maxDate={new Date()}
              colorScheme="bus"
              defaultMonth={startOfMonth(subMonths(new Date(), 1))}
            />
          </div>
        </section>

        {/* ---- Demo 3: Ilman pikavalintoja ---- */}
        <section className="demo-section">
          <div className="demo-section__meta">
            <h2 className="demo-section__title">Pakollinen kenttä</h2>
            <p className="demo-section__desc">
              Ilman <code>presetRanges</code>-propsia komponentti näyttää vain
              kalenterin. Päivämäärät voi kirjoittaa myös tekstikenttiin suoraan
              muodossa <code>pp.kk.vvvv</code>. <code>required</code>-proppi
              lisää pakollisuusmerkinnän labeliin.
            </p>
          </div>
          <div className="demo-section__component">
            <DateRangePicker
              id="basic-dates"
              label="Päivämääräväli"
              language="fi"
              value={basicRange}
              onChange={setBasicRange}
              required
              colorScheme="black"
            />
          </div>
        </section>

        {/* ---- Demo 4: Validointi — yli 31 päivän jakso ---- */}
        <section className="demo-section">
          <div className="demo-section__meta">
            <h2 className="demo-section__title">Validointi</h2>
            <p className="demo-section__desc">
              <code>errorText</code>-proppi aktivoi virhetilan: punainen
              reunaviiva ja virheilmoitus. Tässä esimerkissä yli 31 päivän
              jakso on kielletty — virhe ilmestyy kun valittu väli ylittää
              rajan.
            </p>
          </div>
          <div className="demo-section__component">
            <DateRangePicker
              id="report-dates"
              label="Raporttijako"
              language="fi"
              value={reportRange}
              onChange={setReportRange}
              presetRanges={pastPresets}
              maxDate={new Date()}
              colorScheme="bus"
              errorText={reportError}
            />
          </div>
        </section>

        {/* ---- Demo 5: Tapahtumien varaus (minDate = tänään) ---- */}
        <section className="demo-section demo-section--last">
          <div className="demo-section__meta">
            <h2 className="demo-section__title">Tapahtumien varaus</h2>
            <p className="demo-section__desc">
              <code>minDate={'{new Date()}'}</code> estää menneisyyden
              valinnan — sopii varausjärjestelmiin ja tapahtumahakuihin.
              Pikavalinnat ohjaavat tulevaisuuteen: tänään, tällä ja ensi
              viikolla, tänä viikonloppuna.
            </p>
          </div>
          <div className="demo-section__component">
            <DateRangePicker
              id="booking-dates"
              label="Varausajankohta"
              language="fi"
              value={bookingRange}
              onChange={setBookingRange}
              presetRanges={futurePresets}
              minDate={startOfDay(new Date())}
              colorScheme="bus"
            />
          </div>
        </section>

      </main>

      <footer className="demo-footer">
        <div className="demo-footer__inner">
          <Logo src={logoFi} size={LogoSize.Small} alt="Helsingin kaupunki" />
          <p className="demo-footer__text">Helsinki Design System · Prototyyppi · 2026</p>
        </div>
      </footer>
    </div>
  );
}
