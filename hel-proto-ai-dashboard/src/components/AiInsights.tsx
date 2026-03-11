import { useState, useRef } from 'react';
import {
  Button,
  IconAlertCircle,
  IconLinkExternal,
  IconCross,
  IconAngleDown,
  IconAngleUp,
} from 'hds-react';
import type { AiInsight } from '../data/mockAiInsights';
import { CompareDialog } from './CompareDialog';
import styles from './AiInsights.module.css';

// ✅ HDS Core: Button – Suoraan Drupalissa
// ⚠️ HDS React: CSS-moduulit custom-layouttiin – VAATII Drupal-sovituksen

interface InsightCardProps {
  insight: AiInsight;
  onDismiss: (id: string) => void;
}

function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const compareButtonRef = useRef<HTMLButtonElement>(null);
  const isDuplicate = insight.type === 'duplicate';

  return (
    <li className={`${styles.card} ${isDuplicate ? styles['card--duplicate'] : styles['card--link']}`}>
      <div className={styles.cardInner}>

        {/* Ikoni */}
        <div className={styles.cardIcon} aria-hidden>
          {isDuplicate ? <IconAlertCircle /> : <IconLinkExternal />}
        </div>

        {/* Sisältö */}
        <div className={styles.cardContent}>

          {/* Rivi 1: tyyppi */}
          <div className={styles.typeRow}>
            <span className={styles.cardType}>
              {isDuplicate ? 'Mahdollinen päällekkäinen sisältö' : 'Linkitysehdotus'}
            </span>
          </div>

          {/* Rivi 2: sivujen nimet — symmetrinen suhde, ei nuolta */}
          <p className={styles.cardTitle}>
            <a href={insight.sourceUrl} className={styles.pageLink}>
              {insight.sourceTitle}
            </a>
            <span className={styles.connector} aria-label="muistuttaa sivua">
              muistuttaa sivua
            </span>
            <a href={insight.targetUrl} className={styles.pageLink}>
              {insight.targetTitle}
            </a>
          </p>

          {/* Rivi 3: toggle – osio ja tekijä piilotettu sisälle */}
          <button
            className={styles.toggleReason}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>Piilota lisätiedot <IconAngleUp aria-hidden style={{ verticalAlign: 'middle' }} /></>
            ) : (
              <>Miksi tämä ehdotetaan? <IconAngleDown aria-hidden style={{ verticalAlign: 'middle' }} /></>
            )}
          </button>

          {/* Laajennettu tila: perustelu + meta */}
          {expanded && (
            <div className={styles.expandedContent}>
              <p className={styles.reason}>{insight.reason}</p>
              <p className={styles.cardMeta}>
                Kohdesivun osio: <strong>{insight.targetSection}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Toiminnot */}
        <div className={styles.cardActions}>
          {/* ✅ HDS Core: Button primary – pääaktio korostettuna */}
          {isDuplicate ? (
            <>
              <Button
                ref={compareButtonRef}
                variant="primary"
                size="small"
                onClick={() => setCompareOpen(true)}
                aria-label={`Vertaa sivuja: ${insight.sourceTitle} ja ${insight.targetTitle}`}
              >
                Vertaa sivuja
              </Button>
              <CompareDialog
                isOpen={compareOpen}
                onClose={() => setCompareOpen(false)}
                triggerRef={compareButtonRef}
              />
            </>
          ) : (
            <Button
              variant="primary"
              size="small"
              onClick={() => {}}
              aria-label={`Lisää linkki sivulle ${insight.sourceTitle}`}
            >
              Lisää linkki
            </Button>
          )}
          <button
            className={styles.dismissBtn}
            onClick={() => onDismiss(insight.id)}
            aria-label="Ohita tämä huomio"
            title="Ohita"
          >
            <IconCross aria-hidden />
          </button>
        </div>

      </div>
    </li>
  );
}

interface AiInsightsProps {
  insights: AiInsight[];
}

export function AiInsights({ insights }: AiInsightsProps) {
  const [items, setItems] = useState(insights);
  const [collapsed, setCollapsed] = useState(false);

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (items.length === 0) return null;

  const duplicates = items.filter((i) => i.type === 'duplicate');
  const linkSuggestions = items.filter((i) => i.type === 'link-suggestion');

  return (
    <section className={styles.section} aria-label="AI-huomiot">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>
            AI-huomiot
            <span className={styles.badge} aria-label={`${items.length} huomiota`}>
              {items.length}
            </span>
          </h2>
          <p className={styles.sectionDescription}>
            Tekoäly on havainnut sisällöissäsi asioita, jotka saattavat vaatia toimenpiteitä.
          </p>
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-controls="ai-insights-list"
        >
          {collapsed ? 'Näytä huomiot' : 'Piilota huomiot'}
        </button>
      </div>

      {!collapsed && (
        <div id="ai-insights-list">
          {duplicates.length > 0 && (
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>
                Mahdolliset päällekkäisyydet ({duplicates.length})
              </h3>
              <ul className={styles.cardList}>
                {duplicates.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} onDismiss={dismiss} />
                ))}
              </ul>
            </div>
          )}

          {linkSuggestions.length > 0 && (
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>
                Linkitysehdotukset ({linkSuggestions.length})
              </h3>
              <ul className={styles.cardList}>
                {linkSuggestions.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} onDismiss={dismiss} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
