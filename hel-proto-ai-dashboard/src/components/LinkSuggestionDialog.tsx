import type React from 'react';
import { Dialog, Button, IconLink, IconInfoCircle, IconArrowRight } from 'hds-react';
import type { AiInsight } from '../data/mockAiInsights';
import styles from './LinkSuggestionDialog.module.css';

// ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen (Modal module tai custom)
// ✅ HDS Core: Button – Suoraan Drupalissa

interface LinkSuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insight: AiInsight;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export function LinkSuggestionDialog({ isOpen, onClose, insight, triggerRef }: LinkSuggestionDialogProps) {
  return (
    <Dialog
      id={`link-suggestion-dialog-${insight.id}`}
      aria-labelledby={`link-suggestion-title-${insight.id}`}
      aria-describedby={`link-suggestion-desc-${insight.id}`}
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText="Sulje"
      focusAfterCloseRef={triggerRef}
      className={styles.dialog}
    >
      {/* ⚠️ HDS React: Dialog.Header */}
      <Dialog.Header
        id={`link-suggestion-title-${insight.id}`}
        title="Linkitysehdotuksen peruste"
        iconLeft={<IconInfoCircle aria-hidden />}
      />

      <Dialog.Content>
        {/* Sivujen välinen suhde */}
        <div className={styles.pagesRow} aria-label="Linkityksen suunta">
          <div className={styles.pageCard}>
            <p className={styles.pageRole}>Sivusi</p>
            <a href={insight.sourceUrl} className={styles.pageTitle}>
              {insight.sourceTitle}
            </a>
          </div>

          <IconArrowRight className={styles.arrow} aria-hidden />

          <div className={styles.pageCard}>
            <p className={styles.pageRole}>Ehdotettu kohde</p>
            <a href={insight.targetUrl} className={styles.pageTitle}>
              {insight.targetTitle}
            </a>
            <p className={styles.pageSection}>{insight.targetSection}</p>
          </div>
        </div>

        {/* AI-peruste */}
        <div
          id={`link-suggestion-desc-${insight.id}`}
          className={styles.reasonBlock}
          aria-label="AI-analyysi"
        >
          <p className={styles.reasonLabel}>AI-analyysi</p>
          <p className={styles.reasonText}>{insight.reason}</p>
          <p className={styles.reasonMeta}>
            Ehdotus perustuu hel.fi-käyttäjien hakukäyttäytymiseen ja sisältöjen aihepiirianalyysiin.
            Tarkista ehdotus ennen linkin lisäämistä.
          </p>
        </div>
      </Dialog.Content>

      {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
      <Dialog.ActionButtons>
        <Button
          iconLeft={<IconLink aria-hidden />}
          onClick={onClose}
        >
          Lisää linkki sivulle
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Ohita ehdotus
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
}
