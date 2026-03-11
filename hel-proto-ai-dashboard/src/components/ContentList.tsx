import React, { useEffect, useId, useRef, useState } from 'react';
import { Button, Notification, StatusLabel, IconPen, IconAlertCircle, IconCheck, IconError, IconDocumentGroup, IconGlobe, IconRefresh, IconSliders, IconAngleDown, IconClock, IconLink, IconPlus, IconInfoCircle } from 'hds-react';
import type { ContentItem, LangStatus } from '../types';
import type { AiInsight } from '../data/mockAiInsights';

import { CompareDialog } from './CompareDialog';
import { LinkSuggestionDialog } from './LinkSuggestionDialog';
import { isOldContent, formatFinnishDate } from '../utils/date';
import styles from './ContentList.module.css';

type FilterType = 'all' | 'translation' | 'outdated' | 'duplicate' | 'link-suggestion';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Kaikki sivut' },
  { value: 'translation', label: 'Käännöstä tarvitsevat' },
  { value: 'outdated', label: 'Päivitystä tarvitsevat' },
  { value: 'duplicate', label: 'Päällekkäiset sisällöt' },
  { value: 'link-suggestion', label: 'Linkitysehdotukset' },
];

// ✅ HDS Core: Tag, Button – Suoraan Drupalissa

function FilterDropdown({ value, onChange }: { value: FilterType; onChange: (v: FilterType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const activeLabel = FILTER_OPTIONS.find((o) => o.value === value)?.label ?? 'Kaikki sivut';

  return (
    <div ref={ref} className={styles.filterDropdown}>
      {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
      <Button
        variant="supplementary"
        size="small"
        iconLeft={<IconSliders aria-hidden />}
        iconRight={<IconAngleDown aria-hidden className={`${styles.filterChevron} ${open ? styles['filterChevron--open'] : ''}`} />}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        className={`${styles.filterBtn} ${value !== 'all' ? styles['filterBtn--active'] : ''}`}
      >
        {value === 'all' ? 'Suodata' : activeLabel}
      </Button>
      {open && (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Suodatusvalinnat"
          className={styles.filterMenu}
        >
          {FILTER_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.filterOption} ${opt.value === value ? styles['filterOption--active'] : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onChange(opt.value); setOpen(false); } }}
              tabIndex={0}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ✅ HDS React: StatusLabel – Suoraan Drupalissa (HDS Core)
const LANG_NAMES: Record<string, string> = {
  fi: 'Suomi',
  sv: 'Ruotsi',
  en: 'Englanti',
};

const LANG_STATUS_TYPE: Record<LangStatus, 'success' | 'alert' | 'error'> = {
  ok: 'success',
  outdated: 'alert',
  missing: 'error',
};

const LANG_STATUS_TEXT: Record<LangStatus, string> = {
  ok: 'ajan tasalla',
  outdated: 'vanhentunut',
  missing: 'puuttuu',
};

const LANG_STATUS_ICON: Record<LangStatus, React.ReactNode> = {
  ok: <IconCheck aria-hidden />,         // ympyröimätön checkmark
  outdated: <IconAlertCircle aria-hidden />,
  missing: <IconError aria-hidden />,
};

// Tooltip-teksti kertoo statuksen lyhyellä lauseella
const LANG_TOOLTIP: Record<string, Record<LangStatus, string>> = {
  fi: {
    ok: 'Suomenkielinen versio on ajan tasalla.',
    outdated: 'Suomenkielinen versio on vanhentunut.',
    missing: 'Suomenkielinen versio puuttuu.',
  },
  sv: {
    ok: 'Ruotsinkielinen versio on ajan tasalla.',
    outdated: 'Ruotsinkielinen versio on vanhentunut – päivitä käännös.',
    missing: 'Ruotsinkielinen versio puuttuu kokonaan.',
  },
  en: {
    ok: 'Englanninkielinen versio on ajan tasalla.',
    outdated: 'Englanninkielinen versio on vanhentunut – päivitä käännös.',
    missing: 'Englanninkielinen versio puuttuu kokonaan.',
  },
};

function LangBadge({ lang, status }: { lang: string; status: LangStatus }) {
  const id = useId();
  const tooltipId = `${id}-tooltip`;
  const langName = LANG_NAMES[lang] ?? lang.toUpperCase();
  const statusText = LANG_STATUS_TEXT[status];
  const tooltipText = LANG_TOOLTIP[lang]?.[status] ?? `${langName}: ${statusText}`;

  return (
    <span
      className={styles.tooltipWrapper}
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      <StatusLabel
        type={LANG_STATUS_TYPE[status]}
        iconLeft={LANG_STATUS_ICON[status]}
        aria-label={`${langName}: ${statusText}`}
      >
        {langName}
      </StatusLabel>
      <span id={tooltipId} role="tooltip" className={styles.tooltip}>
        {tooltipText}
      </span>
    </span>
  );
}

// Rivin alla näytettävä AI-huomio-rivi
function InsightChip({ insight }: { insight: AiInsight }) {
  const [compareOpen, setCompareOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const compareButtonRef = useRef<HTMLButtonElement>(null);
  const reasonButtonRef = useRef<HTMLButtonElement>(null);
  const isDuplicate = insight.type === 'duplicate';

  return (
    <div
      className={`${styles.insightChip} ${isDuplicate ? styles['insightChip--duplicate'] : styles['insightChip--link']}`}
      role="note"
      aria-label={isDuplicate ? 'AI-huomio: mahdollinen päällekkäinen sisältö' : 'AI-huomio: linkitysehdotus'}
    >
      {isDuplicate
        ? <IconAlertCircle className={styles.insightIcon} aria-hidden />
        : <IconLink className={styles.insightIcon} aria-hidden />
      }

      <span className={styles.insightText}>
        <span className={styles.insightLabel}>
          {isDuplicate ? 'Päällekkäinen sisältö:' : 'Linkitysehdotus:'}
        </span>{' '}
        <a href={insight.targetUrl} className={styles.insightLink}>
          {insight.targetTitle}
        </a>
      </span>

      {isDuplicate && (
        <>
          {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
          <Button
            ref={compareButtonRef}
            variant="supplementary"
            size="small"
            iconLeft={<IconDocumentGroup aria-hidden />}
            iconRight={null as unknown as React.ReactNode}
            onClick={() => setCompareOpen(true)}
            aria-label={`Vertaa sivuja: ${insight.sourceTitle} ja ${insight.targetTitle}`}
            className={styles.insightAction}
          >
            Vertaa sivuja
          </Button>
          {/* ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen */}
          <CompareDialog
            isOpen={compareOpen}
            onClose={() => setCompareOpen(false)}
            triggerRef={compareButtonRef}
          />
        </>
      )}
      {!isDuplicate && (
        <>
          {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
          <Button
            ref={reasonButtonRef}
            variant="supplementary"
            size="small"
            iconLeft={<IconInfoCircle aria-hidden />}
            iconRight={null as unknown as React.ReactNode}
            onClick={() => setReasonOpen(true)}
            aria-label={`Katso linkitysehdotuksen peruste: ${insight.targetTitle}`}
            className={styles.insightAction}
          >
            Katso ehdotusperuste
          </Button>
          {/* ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen */}
          <LinkSuggestionDialog
            isOpen={reasonOpen}
            onClose={() => setReasonOpen(false)}
            insight={insight}
            triggerRef={reasonButtonRef}
          />
        </>
      )}
    </div>
  );
}

interface ContentRowProps {
  item: ContentItem;
  insights: AiInsight[];
  onTranslate: (id: string, lang: string) => void;
}

function ContentRow({ item, insights, onTranslate }: ContentRowProps) {
  const old = isOldContent(item.lastModified);
  const rowInsights = insights.filter((i) => i.sourceId === item.id);
  const svIssue = item.languages.sv !== 'ok';
  const enIssue = item.languages.en !== 'ok';
  return (
    <li className={styles.contentRow}>
      <div className={styles.rowMain}>

        {/* Vasen sarake: otsikko + meta + kielistatuslabelit */}
        <div className={styles.leftCol}>
          {/* ✅ HDS React: StatusLabel – Suoraan Drupalissa (HDS Core) */}
          {old && (
            <StatusLabel
              type="neutral"
              iconLeft={<IconClock aria-hidden />}
              className={styles.outdatedLabel}
            >
              Yli vuoden vanha
            </StatusLabel>
          )}
          <a href={item.url} className={styles.contentTitle} aria-label={`${item.title} – avaa sisältö`}>
            {item.title}
          </a>
          <div className={styles.meta}>
            <span
              className={`${styles.date} ${old ? styles['date--old'] : ''}`}
              title={`Muokattu ${formatFinnishDate(item.lastModified)}`}
              aria-label={`Viimeksi muokattu ${formatFinnishDate(item.lastModified)}`}
            >
              <span className={styles.dateLabel}>Päivitetty:</span> {formatFinnishDate(item.lastModified)}
            </span>
          </div>
          <div className={styles.langArea} aria-label="Kieliversioiden tila">
            <LangBadge lang="fi" status={item.languages.fi} />
            <LangBadge lang="sv" status={item.languages.sv} />
            <LangBadge lang="en" status={item.languages.en} />
          </div>
        </div>

        {/* Oikea alue: käännösnapit vasemmalla, Muokkaa sivua oikeassa reunassa */}
        <div className={styles.buttonsCol}>
          {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
          {svIssue && (
            <Button
              variant="supplementary"
              size="small"
              iconLeft={item.languages.sv === 'missing' ? <IconGlobe aria-hidden /> : <IconRefresh aria-hidden />}
              iconRight={null as unknown as React.ReactNode}
              onClick={() => onTranslate(item.id, 'sv')}
              aria-label={
                item.languages.sv === 'missing'
                  ? `Käännä ruotsiksi: ${item.title}`
                  : `Päivitä ruotsinkielinen versio: ${item.title}`
              }
            >
              {item.languages.sv === 'missing' ? 'Käännä ruotsiksi' : 'Päivitä ruotsi'}
            </Button>
          )}
          {enIssue && (
            <Button
              variant="supplementary"
              size="small"
              iconLeft={item.languages.en === 'missing' ? <IconGlobe aria-hidden /> : <IconRefresh aria-hidden />}
              iconRight={null as unknown as React.ReactNode}
              onClick={() => onTranslate(item.id, 'en')}
              aria-label={
                item.languages.en === 'missing'
                  ? `Käännä englanniksi: ${item.title}`
                  : `Päivitä englanninkielinen versio: ${item.title}`
              }
            >
              {item.languages.en === 'missing' ? 'Käännä englanniksi' : 'Päivitä englanti'}
            </Button>
          )}
          {/* ✅ HDS Core: Button – ohjaa Drupal-editoriin */}
          <Button
            variant="secondary"
            size="small"
            iconLeft={<IconPen aria-hidden />}
            onClick={() => {}}
            aria-label={`Muokkaa sivua: ${item.title}`}
          >
            Muokkaa sivua
          </Button>
        </div>

      </div>

      {/* AI-huomiot rivin alla — yksi per insight */}
      {rowInsights.map((insight) => (
        <InsightChip key={insight.id} insight={insight} />
      ))}
    </li>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyStateContainer} role="status" aria-label="Ei sisältöjä">
      <div className={styles.emptyStateInner}>
        <IconDocumentGroup className={styles.emptyStateIcon} aria-hidden />
        <p className={styles.emptyStateTitle}>Ei vielä sisältöjä</p>
        <p className={styles.emptyStateBody}>
          Sisältösi näkyvät tässä, kun olet luonut tai muokannut sivuja hel.fi:ssä.
        </p>
        {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
        <Button
          variant="primary"
          iconLeft={<IconPlus aria-hidden />}
          onClick={() => {}}
        >
          Luo uusi sivu
        </Button>
      </div>
    </div>
  );
}

interface ContentListProps {
  items: ContentItem[];
  insights: AiInsight[];
  onTranslate: (id: string, lang: string) => void;
}

export function ContentList({ items, insights, onTranslate }: ContentListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const translationCount = items.filter(
    (i) => i.languages.sv !== 'ok' || i.languages.en !== 'ok'
  ).length;

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'translation') return item.languages.sv !== 'ok' || item.languages.en !== 'ok';
    if (filter === 'outdated') return isOldContent(item.lastModified);
    if (filter === 'duplicate') return insights.some((i) => i.sourceId === item.id && i.type === 'duplicate');
    if (filter === 'link-suggestion') return insights.some((i) => i.sourceId === item.id && i.type === 'link-suggestion');
    return true;
  });

  if (items.length === 0) {
    return (
      <section aria-label="Omat sisällöt">
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>Omat sisällöt</h2>
          <p className={styles.listDescription}>
            Viimeksi luomasi ja muokkaamasi sisällöt. Kieliversioiden tila on
            näkyvillä jokaisen sisällön kohdalla.
          </p>
        </div>
        <EmptyState />
      </section>
    );
  }

  return (
    <section aria-label="Omat sisällöt">
      <div className={styles.listHeader}>
        <h2 className={styles.listTitle}>Omat sisällöt</h2>
        <p className={styles.listDescription}>
          Viimeksi luomasi ja muokkaamasi sisällöt. Kieliversioiden tila on
          näkyvillä jokaisen sisällön kohdalla.
        </p>
      </div>
      {/* ⚠️ HDS React: Notification – VAATII Drupal-sovituksen */}
      {translationCount > 0 && (
        <Notification
          type="info"
          label={`${translationCount} sisältöä odottaa käännöspäivitystä`}
          className={styles.translationNotification}
        />
      )}

      <div className={styles.countRow}>
        <h3 className={styles.itemCount}>
          {filter === 'all'
            ? `${items.length} sivua`
            : `${filteredItems.length} / ${items.length} sivua`}
        </h3>
        <FilterDropdown value={filter} onChange={setFilter} />
      </div>

      {filteredItems.length === 0 ? (
        <p className={styles.emptyState}>
          Ei sivuja tällä suodattimella.{' '}
          <button className={styles.emptyStateReset} onClick={() => setFilter('all')}>
            Näytä kaikki sivut
          </button>
        </p>
      ) : (
        <ul className={styles.contentList} aria-label="Sisältöluettelo">
          {filteredItems.map((item) => (
            <ContentRow key={item.id} item={item} insights={insights} onTranslate={onTranslate} />
          ))}
        </ul>
      )}

      {filteredItems.length > 0 && (
        <div className={styles.showMore}>
          {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
          <Button variant="secondary" onClick={() => {}}>
            Näytä kaikki sisällöt
          </Button>
        </div>
      )}
    </section>
  );
}
