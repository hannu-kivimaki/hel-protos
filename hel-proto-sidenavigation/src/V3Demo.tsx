import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header, Logo, logoFi, Breadcrumb, Accordion, Link, IconEnvelope, IconPhone } from 'hds-react';
import { DrillDownNavigationV3, NavItem } from './components/DrillDownNavigationV3';
import './components/DrillDownNavigationV3.css';
import './components/SideNavigation.css';

// Navigation structure
const navigationItems: NavItem[] = [
  {
    id: 'tontin-hakeminen',
    label: 'Tontin hakeminen',
    children: [
      {
        id: 'tonttihaut-kilpailut',
        label: 'Tonttihaut ja kilpailut',
        children: [
          {
            id: 'tulevat-tonttihaut',
            label: 'Tulevat tonttihaut ja kilpailut',
            children: [
              { id: 'tulevat-tonttihaut-hakuajat', label: 'Hakuajat ja ohjeet' },
            ],
          },
          { id: 'paattyneet-tonttihaut', label: 'Päättyneet tonttihaut ja kilpailut' },
        ],
      },
      { id: 'asuntotontit-ammattirakentajille', label: 'Asuntotontit ammattirakentajille' },
      { id: 'toimitilatontit', label: 'Toimitilatontit' },
      { id: 'omakotitalotontit', label: 'Omakotitalotontit' },
      { id: 'kiinteistojen-kehittaminen', label: 'Kiinteistöjen kehittäminen' },
      { id: 'maapoliittiset-linjaukset', label: 'Maapoliittiset linjaukset ja tilastot' },
    ],
  },
  {
    id: 'rakentamisen-luvat',
    label: 'Rakentamisen luvat',
  },
];

// Page content for each navigation item
const pageContent: Record<string, { title: string; ingress: string; content: React.ReactNode }> = {
  'tontin-hakeminen': {
    title: 'Tontin hakeminen',
    ingress: 'Helsingin kaupunki vuokraa ja myy tontteja asuin- ja toimitilarakentamiseen.',
    content: (
      <>
        <div className="content-section">
          <h2>Tonttien hakeminen Helsingissä</h2>
          <p>
            Kaupunki luovuttaa tontteja pääasiassa vuokraamalla. Tontteja voi hakea
            järjestettävissä tonttihauissa tai jatkuvassa haussa.
          </p>
        </div>
        <div className="content-section">
          <h2>Tonttityypit</h2>
          <ul>
            <li>Omakotitalotontit yksityisille rakentajille</li>
            <li>Asuntotontit ammattirakentajille</li>
            <li>Toimitilatontit yrityksille</li>
          </ul>
        </div>
      </>
    ),
  },
  'tonttihaut-kilpailut': {
    title: 'Tonttihaut ja kilpailut',
    ingress: 'Kaupunki järjestää säännöllisesti tonttihakuja ja suunnittelukilpailuja.',
    content: (
      <>
        <div className="content-section">
          <h2>Hakutavat</h2>
          <p>
            Tontteja jaetaan arvonnalla, hintakilpailulla tai laatukilpailulla.
            Hakutapa ilmoitetaan kunkin haun yhteydessä.
          </p>
        </div>
        <div className="content-section highlight-box">
          <h2>Tonttivahti</h2>
          <p>Tilaa ilmoitus uusista tonttihauista sähköpostiisi.</p>
          <Link href="#" external>Tilaa Tonttivahti</Link>
        </div>
      </>
    ),
  },
  'tulevat-tonttihaut': {
    title: 'Tulevat tonttihaut ja kilpailut',
    ingress: 'Näet täältä tiedot tulevista tonttihauista ja suunnittelukilpailuista.',
    content: (
      <>
        <div className="content-section">
          <h2>Seuraavat haut</h2>
          <p>
            Tällä hetkellä ei ole avoimia tonttihakuja. Seuraava yleinen
            omakotitonttihaku järjestetään arviolta vuoden 2025 aikana.
          </p>
        </div>
        <div className="content-section">
          <h2>Ilmoittaudu mukaan</h2>
          <p>
            Tilaa Tonttivahti-palvelu, niin saat tiedon heti kun uusia hakuja avataan.
          </p>
        </div>
      </>
    ),
  },
  'tulevat-tonttihaut-hakuajat': {
    title: 'Hakuajat ja ohjeet',
    ingress: 'Katso hakuajat ja tärkeimmät ohjeet ennen hakemista.',
    content: (
      <>
        <div className="content-section">
          <h2>Hakuajat</h2>
          <p>
            Ilmoitamme jokaisen haun alkamis- ja päättymisajan hakuilmoituksessa.
            Tarkista ajat aina ennen hakemista.
          </p>
        </div>
        <div className="content-section">
          <h2>Ohjeet hakijalle</h2>
          <ul>
            <li>Valitse hakukohde ja lue hakuehdot.</li>
            <li>Täytä hakemus ja liitä tarvittavat liitteet.</li>
            <li>Varmista, että hakemus on perillä ennen määräaikaa.</li>
          </ul>
        </div>
      </>
    ),
  },
  'paattyneet-tonttihaut': {
    title: 'Päättyneet tonttihaut ja kilpailut',
    ingress: 'Arkisto päättyneistä tonttihauista ja suunnittelukilpailuista.',
    content: (
      <>
        <div className="content-section">
          <h2>Viimeisimmät haut</h2>
          <p>
            <strong>Omakotitonttihaku 2023</strong><br />
            Haussa oli 47 tonttia. Hakemuksia saapui 1 247 kappaletta.
          </p>
          <p>
            <strong>Kerrostalotonttien laatukilpailu 2023</strong><br />
            Kruunuvuorenrannan kortteleiden suunnittelukilpailu.
          </p>
        </div>
      </>
    ),
  },
  'asuntotontit-ammattirakentajille': {
    title: 'Asuntotontit ammattirakentajille',
    ingress: 'Rakennusliikkeille ja asuntotuotannon ammattilaisille tarkoitetut tontit.',
    content: (
      <>
        <div className="content-section">
          <h2>Kenelle tontit on tarkoitettu</h2>
          <p>
            Asuntotontit on tarkoitettu ammattimaisille rakennuttajille, jotka
            rakentavat asuntoja myyntiin tai vuokralle.
          </p>
        </div>
        <div className="content-section">
          <h2>Hakeminen</h2>
          <p>
            Tontteja haetaan joko kilpailutuksen tai jatkuvan haun kautta.
            Hakijan tulee osoittaa kyky toteuttaa rakennushanke.
          </p>
        </div>
        <div className="content-section contact-section">
          <h2>Yhteystiedot</h2>
          <div className="contact-info">
            <p>
              <IconEnvelope aria-hidden="true" />
              <Link href="mailto:asuntotontit@hel.fi">asuntotontit@hel.fi</Link>
            </p>
          </div>
        </div>
      </>
    ),
  },
  'toimitilatontit': {
    title: 'Toimitilatontit',
    ingress: 'Tontit liiketoimintaa, teollisuutta ja muuta elinkeinotoimintaa varten.',
    content: (
      <>
        <div className="content-section">
          <h2>Toimitilatonttien tyypit</h2>
          <ul>
            <li>Toimistotontit</li>
            <li>Liiketontit</li>
            <li>Teollisuus- ja varastotontit</li>
            <li>Erityistontit (hotellit, päiväkodit ym.)</li>
          </ul>
        </div>
        <div className="content-section">
          <h2>Hakeminen</h2>
          <p>
            Toimitilatontteja voi hakea jatkuvassa haussa tai erikseen järjestettävissä
            kilpailuissa. Hakemuksessa kuvataan suunniteltu käyttötarkoitus.
          </p>
        </div>
        <div className="content-section contact-section">
          <h2>Yhteystiedot</h2>
          <div className="contact-info">
            <p>
              <IconEnvelope aria-hidden="true" />
              <Link href="mailto:toimitilatontit@hel.fi">toimitilatontit@hel.fi</Link>
            </p>
          </div>
        </div>
      </>
    ),
  },
  'omakotitalotontit': {
    title: 'Omakotitalotontit',
    ingress: 'Helsingin kaupunki vuokraa omakotitalotontteja pääasiassa pientalorakentajille.',
    content: (
      <>
        <div className="content-section">
          <h2>Miten Helsinki jakaa tontteja</h2>
          <p>
            Yleisiä tonttihakuja järjestetään noin kahden vuoden välein. Yhdessä haussa
            tarjotaan tyypillisesti 50–100 tonttia eri puolilta Helsinkiä.
          </p>
        </div>
        <div className="content-section highlight-box">
          <h2>Tonttivahti</h2>
          <p>
            Tilaa Tonttivahti-palvelu, niin saat sähköpostiin ilmoituksen, kun kaupungin
            tontteja tulee vuokrattavaksi.
          </p>
          <Link href="#" external>Tilaa Tonttivahti</Link>
        </div>
        <div className="content-section">
          <h2>Vuokrauksen vaiheet</h2>
          <Accordion heading="1. Hakuvaihe">
            <p>Tonttihaut julkaistaan Tonttihaut ja kilpailut -sivulla. Hakuaika on noin kuukausi.</p>
          </Accordion>
          <Accordion heading="2. Vuokrasopimus">
            <p>Tontin saajalle tehdään ensin lyhytaikainen, sitten pitkäaikainen vuokrasopimus.</p>
          </Accordion>
          <Accordion heading="3. Rakentaminen">
            <p>Rakentaminen voi alkaa rakennusluvan ja vuokrasopimuksen jälkeen.</p>
          </Accordion>
        </div>
        <div className="content-section contact-section">
          <h2>Yhteystiedot</h2>
          <div className="contact-info">
            <p>
              <IconEnvelope aria-hidden="true" />
              <Link href="mailto:omakotitalotonttitiedustelut@hel.fi">
                omakotitalotonttitiedustelut@hel.fi
              </Link>
            </p>
            <p>
              <IconPhone aria-hidden="true" />
              <span>Juha Heikkilä, (09) 310 70964</span>
            </p>
          </div>
        </div>
      </>
    ),
  },
  'kiinteistojen-kehittaminen': {
    title: 'Kiinteistöjen kehittäminen',
    ingress: 'Tietoa olemassa olevien kiinteistöjen kehittämismahdollisuuksista.',
    content: (
      <>
        <div className="content-section">
          <h2>Täydennysrakentaminen</h2>
          <p>
            Olemassa olevia kiinteistöjä voi kehittää täydennysrakentamisella.
            Kaupunki tukee hankkeita, jotka lisäävät asuntotarjontaa.
          </p>
        </div>
        <div className="content-section">
          <h2>Käyttötarkoituksen muutos</h2>
          <p>
            Toimitilojen muuttaminen asunnoiksi on mahdollista asemakaavan puitteissa.
            Muutos vaatii usein poikkeamisluvan tai kaavamuutoksen.
          </p>
        </div>
        <div className="content-section contact-section">
          <h2>Yhteystiedot</h2>
          <div className="contact-info">
            <p>
              <IconEnvelope aria-hidden="true" />
              <Link href="mailto:kiinteistokehitys@hel.fi">kiinteistokehitys@hel.fi</Link>
            </p>
          </div>
        </div>
      </>
    ),
  },
  'maapoliittiset-linjaukset': {
    title: 'Maapoliittiset linjaukset ja tilastot',
    ingress: 'Helsingin maapolitiikan periaatteet ja tonttivarannon tilastotiedot.',
    content: (
      <>
        <div className="content-section">
          <h2>Maapolitiikan periaatteet</h2>
          <p>
            Helsinki pyrkii turvaamaan asuntotuotannon edellytykset ja
            elinkeinoelämän toimintamahdollisuudet aktiivisella maapolitiikalla.
          </p>
        </div>
        <div className="content-section">
          <h2>Tilastoja</h2>
          <ul>
            <li>Vuokrattuja tontteja: 12 450 kpl</li>
            <li>Myytyjä tontteja: 2 340 kpl</li>
            <li>Vapaata tonttivarantoa: 890 000 k-m²</li>
          </ul>
        </div>
        <div className="content-section">
          <h2>Aiheeseen liittyvää</h2>
          <ul className="related-links">
            <li><Link href="#">Maankäyttö ja kaupunkisuunnittelu</Link></li>
            <li><Link href="#">Yleiskaava 2016</Link></li>
          </ul>
        </div>
      </>
    ),
  },
  'rakentamisen-luvat': {
    title: 'Rakentamisen luvat',
    ingress: 'Tietoa rakennusluvista, toimenpideluvista ja muista rakentamisen luvista Helsingissä.',
    content: (
      <>
        <div className="content-section">
          <h2>Lupatyypit</h2>
          <ul>
            <li>Rakennuslupa</li>
            <li>Toimenpidelupa</li>
            <li>Purkamislupa</li>
            <li>Maisematyölupa</li>
          </ul>
        </div>
        <div className="content-section">
          <h2>Lupahakemus</h2>
          <p>
            Rakentamisen luvat haetaan sähköisesti Lupapiste-palvelussa.
            Hakemukseen tarvitset pääpiirustukset ja tarvittavat selvitykset.
          </p>
        </div>
        <div className="content-section contact-section">
          <h2>Yhteystiedot</h2>
          <div className="contact-info">
            <p>
              <IconEnvelope aria-hidden="true" />
              <Link href="mailto:rakennusvalvonta@hel.fi">rakennusvalvonta@hel.fi</Link>
            </p>
          </div>
        </div>
      </>
    ),
  },
};

// Get breadcrumb for active page
function getBreadcrumb(activeId: string): { title: string; path: string | null }[] {
  const base: { title: string; path: string | null }[] = [
    { title: 'Etusivu', path: 'https://www.hel.fi/fi' },
    { title: 'Kaupunkiympäristö ja liikenne', path: '#' },
    { title: 'Tontit ja rakentamisen luvat', path: '#' },
  ];

  const titles: Record<string, string> = {
    'tontin-hakeminen': 'Tontin hakeminen',
    'tonttihaut-kilpailut': 'Tonttihaut ja kilpailut',
    'tulevat-tonttihaut': 'Tulevat tonttihaut ja kilpailut',
    'tulevat-tonttihaut-hakuajat': 'Hakuajat ja ohjeet',
    'paattyneet-tonttihaut': 'Päättyneet tonttihaut ja kilpailut',
    'asuntotontit-ammattirakentajille': 'Asuntotontit ammattirakentajille',
    'toimitilatontit': 'Toimitilatontit',
    'omakotitalotontit': 'Omakotitalotontit',
    'kiinteistojen-kehittaminen': 'Kiinteistöjen kehittäminen',
    'maapoliittiset-linjaukset': 'Maapoliittiset linjaukset ja tilastot',
    'rakentamisen-luvat': 'Rakentamisen luvat',
  };

  if (activeId !== 'tontin-hakeminen' && activeId !== 'rakentamisen-luvat') {
    base.push({ title: 'Tontin hakeminen', path: '#' });
  }

  if (activeId === 'tulevat-tonttihaut' || activeId === 'paattyneet-tonttihaut') {
    base.push({ title: 'Tonttihaut ja kilpailut', path: '#' });
  }

  if (activeId === 'tulevat-tonttihaut-hakuajat') {
    base.push({ title: 'Tonttihaut ja kilpailut', path: '#' });
    base.push({ title: 'Tulevat tonttihaut ja kilpailut', path: '#' });
  }

  base.push({ title: titles[activeId] || activeId, path: null });

  return base;
}

export function V3Demo() {
  const location = useLocation();

  // Initialize from URL or default
  const getInitialPage = () => {
    const params = new URLSearchParams(location.search);
    return params.get('page') || 'omakotitalotontit';
  };

  const [activeId, setActiveId] = useState(getInitialPage);

  // Update activeId when URL changes (browser back/forward)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageId = params.get('page');
    if (pageId && pageId !== activeId) {
      setActiveId(pageId);
    }
  }, [location.search]);

  const handleNavigate = (id: string) => {
    setActiveId(id);
    // URL is updated by the navigation component
  };

  const currentPage = pageContent[activeId] || pageContent['omakotitalotontit'];
  const breadcrumbItems = getBreadcrumb(activeId);

  return (
    <div className="page-layout">
      <Header
        className="app-header"
        languages={[
          { label: 'Suomi', value: 'fi', isPrimary: true },
          { label: 'Svenska', value: 'sv' },
          { label: 'English', value: 'en' },
        ]}
        defaultLanguage="fi"
      >
        <Header.SkipLink skipTo="#main-content" label="Siirry sisältöön" />
        <Header.UniversalBar ariaLabel="Ylänavigaatio">
          <Header.Link href="https://www.hel.fi/fi/asiointi" label="Asiointi" />
          <Header.Link href="https://www.hel.fi/fi/tapahtumat" label="Tapahtumat" />
          <Header.Link href="https://www.hel.fi/fi/uutiset" label="Uutiset" />
          <Header.Link href="https://www.hel.fi/fi/kartta" label="Kartta" />
          <Header.Link href="https://www.hel.fi/fi/yhteystiedot" label="Yhteystiedot" />
          <Header.Link href="https://www.hel.fi/fi/palaute" label="Anna palautetta" />
        </Header.UniversalBar>
        <Header.ActionBar
          className="app-header-actionbar"
          title="Helsingin kaupunki"
          titleAriaLabel="Helsingin kaupunki: Etusivu"
          titleHref="#"
          frontPageLabel="Etusivu"
          menuButtonAriaLabel="Valikko"
          titleStyle={Header.TitleStyleType.Normal}
          logo={<Logo src={logoFi} alt="Helsingin kaupunki" size="medium" />}
          logoAriaLabel="Helsingin kaupunki"
        >
          <Header.LanguageSelector />
        </Header.ActionBar>
      </Header>

      <div className="centered-container">
        <Breadcrumb ariaLabel="Murupolku" list={breadcrumbItems} />
      </div>

      <div className="content-layout">
        <div className="side-navigation-container">
          <DrillDownNavigationV3
            items={navigationItems}
            activeId={activeId}
            onNavigate={handleNavigate}
            sectionTitle="Tontit ja rakentamisen luvat"
            baseUrl="/v3"
          />
        </div>

        <main id="main-content" className="main-content">
          <h1>{currentPage.title}</h1>
          <p className="ingress">{currentPage.ingress}</p>
          {currentPage.content}
        </main>
      </div>
    </div>
  );
}
