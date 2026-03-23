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
} from 'date-fns';
import { Logo } from 'hds-react';
import { DateRangePicker } from './components/DateRangePicker';
import type { DateRange, PresetRange } from './components/DateRangePicker';

// Pikavalinnat — tulevaisuuteen katsova (tapahtumat, varaukset)
const futurePresets: PresetRange[] = [
  {
    label: 'Tänään',
    getRange: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }),
  },
  {
    label: 'Tällä viikolla',
    getRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Ensi viikolla',
    getRange: () => ({
      startDate: startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
      endDate: endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Tänä viikonloppuna',
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

function formatRange(range: DateRange): string {
  if (!range.startDate) return '–';
  const start = range.startDate.toLocaleDateString('fi-FI');
  const end = range.endDate ? range.endDate.toLocaleDateString('fi-FI') : '?';
  return `${start} – ${end}`;
}

export default function App() {
  const [busRange, setBusRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [blackRange, setBlackRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [analyticsRange, setAnalyticsRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [basicRange, setBasicRange] = useState<DateRange>({ startDate: null, endDate: null });

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-header__inner">
          <div className="demo-header__logo-row">
            {/* ⚠️ HDS React: Logo */}
            <Logo color="white" size="medium" />
          </div>
          <span className="demo-header__badge">Prototyyppi</span>
          <h1 className="demo-header__title">DateRangePicker</h1>
          <p className="demo-header__desc">
            HDS Date input -komponentin uusi päivämäärävälivariantti.
            Tuki pikavalintopainikkeille, min/maxDate-rajoituksille ja kahdelle väripaletille.
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
            <span className="demo-section__num">01</span>
            <h2 className="demo-section__title">Range-korostusväri</h2>
            <p className="demo-section__desc">
              Kaksi värivaihtoehtoa välipäivien korostukseen. Molemmat käyttävät{' '}
              <code>--color-bus</code> valitulle alkupäivälle ja loppupäivälle.
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
              {busRange.startDate && (
                <p className="demo-result">Valittu: <strong>{formatRange(busRange)}</strong></p>
              )}
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
              {blackRange.startDate && (
                <p className="demo-result">Valittu: <strong>{formatRange(blackRange)}</strong></p>
              )}
            </div>
          </div>
        </section>

        {/* ---- Demo 2: Menneisyyteen katsovat pikavalinnat ---- */}
        <section className="demo-section">
          <div className="demo-section__meta">
            <span className="demo-section__num">02</span>
            <h2 className="demo-section__title">Analytiikka / raportointi</h2>
            <p className="demo-section__desc">
              Menneisyyteen katsovat pikavalinnat. Palvelu määrittää omat pikavalintansa.
              Tässä <code>maxDate=tänään</code> ja kalenteri aukeaa edelliseen kuuhun.
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
            {analyticsRange.startDate && (
              <p className="demo-result">Valittu: <strong>{formatRange(analyticsRange)}</strong></p>
            )}
          </div>
        </section>

        {/* ---- Demo 3: Ilman pikavalintoja ---- */}
        <section className="demo-section demo-section--last">
          <div className="demo-section__meta">
            <span className="demo-section__num">03</span>
            <h2 className="demo-section__title">Ilman pikavalintoja</h2>
            <p className="demo-section__desc">
              Vapaa välinvalinta ilman <code>presetRanges</code>-propsia.
              Kenttä on merkitty pakolliseksi (<code>required</code>).
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
            {basicRange.startDate && (
              <p className="demo-result">Valittu: <strong>{formatRange(basicRange)}</strong></p>
            )}
          </div>
        </section>

      </main>

      <footer className="demo-footer">
        <div className="demo-footer__inner">
          {/* ⚠️ HDS React: Logo */}
          <Logo color="black" size="small" />
          <p className="demo-footer__text">HDS-prototyyppi · Helsinki Design System · 2025</p>
        </div>
      </footer>
    </div>
  );
}
