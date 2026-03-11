import type React from 'react';
import { Dialog, Button, IconDocumentGroup } from 'hds-react';
import styles from './CompareDialog.module.css';

// ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen (Modal module tai custom)
// ✅ HDS Core: Button – Suoraan Drupalissa

// Värikoodit: sama väripari molemmilla sivuilla = sama sisältö
// Ei viivoja — väri itse kommunikoi yhteyden
type MatchColor = 'amber' | 'teal' | 'violet';

interface TextBlock {
  text: string;
  match?: MatchColor; // undefined = uniikki sisältö
}

interface PageContent {
  title: string;
  url: string;
  section: string;
  blocks: TextBlock[];
}

// Mock-sisältö kahdelle samankaltaiselle sivulle
const PAGE_A: PageContent = {
  title: 'Ulkoilureitit ja kartat',
  url: '/fi/kulttuuri-ja-vapaa-aika/ulkoilu/reitit-ja-kartat',
  section: 'Kulttuuri ja vapaa-aika',
  blocks: [
    {
      text: 'Helsingissä on yli 1 200 kilometriä merkittyjä ulkoilureittejä. Reitit on suunniteltu kävelijöille, pyöräilijöille ja sauvakävelijöille.',
      match: 'amber',
    },
    {
      text: 'Reittien varteen on sijoitettu tietotauluja, joista löydät reitin pituuden, maastotiedot ja lähimmät palvelut. Kartat ovat saatavilla myös tulostettavina versioina.',
      match: 'amber',
    },
    {
      text: 'Talvisin suositut ladut sijaitsevat Keskuspuistossa, Viikissä ja Paloheinässä. Latureitit päivitetään päivittäin talvikauden aikana.',
    },
    {
      text: 'Pyöräilyreitit on merkitty erikseen ja ne on suunniteltu sekä asiointipyöräilyyn että retkipyöräilyyn.',
    },
    {
      text: 'Lataa Helsinki-karttapalvelu sovellukseen: kartat.hel.fi',
      match: 'teal',
    },
    {
      text: 'Lisätietoja ulkoilumahdollisuuksista: liikunta@hel.fi',
      match: 'teal',
    },
  ],
};

const PAGE_B: PageContent = {
  title: 'Luontopolut ja retkeily Helsingissä',
  url: '/fi/kulttuuri-ja-vapaa-aika/ulkoilu/luontopolut',
  section: 'Kulttuuri ja vapaa-aika',
  blocks: [
    {
      text: 'Luontopolut johdattavat Helsingin arvokkaisiin luontokohteisiin. Polut soveltuvat kaikille liikkujille.',
    },
    {
      text: 'Helsingissä on yli 1 200 kilometriä merkittyjä ulkoilureittejä. Reitit on suunniteltu kävelijöille, pyöräilijöille ja sauvakävelijöille.',
      match: 'amber',
    },
    {
      text: 'Reittien varteen on sijoitettu tietotauluja, joista löydät reitin pituuden, maastotiedot ja lähimmät palvelut. Kartat ovat saatavilla myös tulostettavina versioina.',
      match: 'amber',
    },
    {
      text: 'Suosittuja luontokohteita ovat Haltialan lähde, Vartiosaaren metsä ja Mustavuoren lehto. Kohteet sijaitsevat eri puolilla kaupunkia.',
    },
    {
      text: 'Lataa Helsinki-karttapalvelu sovellukseen: kartat.hel.fi',
      match: 'teal',
    },
    {
      text: 'Lisätietoja ulkoilumahdollisuuksista: liikunta@hel.fi',
      match: 'teal',
    },
  ],
};

const MATCH_LEGEND: { color: MatchColor; label: string }[] = [
  { color: 'amber', label: 'Sama kappale' },
  { color: 'teal', label: 'Sama yhteystieto' },
];

function PageColumn({ page }: { page: PageContent }) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <p className={styles.columnSection}>{page.section}</p>
        <h3 className={styles.columnTitle}>
          <a href={page.url} className={styles.columnTitleLink}>
            {page.title}
          </a>
        </h3>
      </div>
      <div className={styles.columnBody}>
        {page.blocks.map((block, i) => (
          <p
            key={i}
            className={`${styles.block} ${block.match ? styles[`block--${block.match}`] : styles['block--unique']}`}
            aria-label={block.match ? `Päällekkäinen kohta: ${block.text}` : undefined}
          >
            {block.text}
          </p>
        ))}
      </div>
    </div>
  );
}

interface CompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export function CompareDialog({ isOpen, onClose, triggerRef }: CompareDialogProps) {
  return (
    // ⚠️ HDS React: Dialog – VAATII Drupal-sovituksen
    <Dialog
      id="compare-dialog"
      aria-labelledby="compare-dialog-title"
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText="Sulje vertailu"
      focusAfterCloseRef={triggerRef}
      scrollable
      className={styles.dialog}
    >
      <Dialog.Header
        id="compare-dialog-title"
        title="Vertaa sivuja"
        iconLeft={<IconDocumentGroup aria-hidden />}
      />

      <Dialog.Content>
        {/* Selite */}
        <div className={styles.legend} aria-label="Värikoodin selite">
          <span className={styles.legendLabel}>Värikoodi:</span>
          {MATCH_LEGEND.map(({ color, label }) => (
            <span key={color} className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles[`legendDot--${color}`]}`} aria-hidden />
              {label}
            </span>
          ))}
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles['legendDot--unique']}`} aria-hidden />
            Uniikki sisältö
          </span>
        </div>

        {/* Rinnakkaisvertailu */}
        <div className={styles.compareGrid}>
          <PageColumn page={PAGE_A} />
          <PageColumn page={PAGE_B} />
        </div>
      </Dialog.Content>

      <Dialog.ActionButtons>
        {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
        <Button variant="danger" onClick={onClose}>
          Poista toinen sivu
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Yhdistä sisällöt
        </Button>
        <Button
          variant="supplementary"
          iconLeft={null as unknown as React.ReactNode}
          iconRight={null as unknown as React.ReactNode}
          onClick={onClose}
        >
          Ohita
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
}
