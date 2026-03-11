import React, { useState } from 'react';
import { Header, Footer, Breadcrumb, Logo, logoFi, IconUser, Button } from 'hds-react';
import { DashboardGreeting } from './components/DashboardGreeting';
import { ContentList } from './components/ContentList';
import { TranslationDrawer } from './components/TranslationDrawer';
import { mockContent, mockUser } from './data/mockContent';
import { mockAiInsights } from './data/mockAiInsights';
import { mockTranslationTasks } from './data/mockTranslations';

// ⚠️ HDS React: Header – VAATII Drupal-sovituksen (Menu system + JS)
// ⚠️ HDS React: Breadcrumb – VAATII Drupal-sovituksen (Custom block)
// ✅ HDS Core: Footer – Suoraan Drupalissa

function App() {
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  const [emptyDemo, setEmptyDemo] = useState(false);

  const translationTask = translatingId
    ? mockTranslationTasks.find((t) => t.contentId === translatingId) ?? null
    : null;

  const translationItem = translatingId
    ? mockContent.find((c) => c.id === translatingId) ?? null
    : null;

  return (
    <div className="page-layout">

      {/* ⚠️ HDS React: Header – VAATII Drupal-sovituksen */}
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
          <Header.Link href="#" label="Ajankohtaista" />
          <Header.Link href="#" label="Helsinki lähellä" />
          <Header.Link href="#" label="Avoimet työpaikat" />
          <Header.Link href="#" label="Asioi verkossa" />
          <Header.Link href="#" label="Anna palautetta" />
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
          <Header.ActionBarItem
            label={mockUser.name}
            icon={<IconUser aria-hidden />}
            id="action-bar-user"
            labelOnRight
          >
            <Header.ActionBarSubItem label="Oma sivu" href="#" />
            <Header.ActionBarSubItem label="Omat sisällöt" href="#" />
            <Header.ActionBarSubItem label="Kirjaudu ulos" href="#" />
          </Header.ActionBarItem>

          <Header.LanguageSelector />
        </Header.ActionBar>

        <Header.NavigationMenu>
          <Header.Link href="#" label="Kulttuuri ja vapaa-aika" active />
        </Header.NavigationMenu>
      </Header>

      {/* Murupolku headerin leveyteen */}
      <div className="centered-container">
        {/* ⚠️ HDS React: Breadcrumb – VAATII Drupal-sovituksen */}
        <Breadcrumb
          ariaLabel="Murupolku"
          list={[
            { title: 'Etusivu', path: '#' },
            { title: 'Kulttuuri ja vapaa-aika', path: '#' },
            { title: mockUser.name, path: '#' },
          ]}
        />
      </div>

      <main id="main-content" className="dashboard-content">
        <DashboardGreeting user={mockUser} />
        <ContentList
          items={emptyDemo ? [] : mockContent}
          insights={emptyDemo ? [] : mockAiInsights}
          onTranslate={(id, lang) => { setTranslatingId(id); setTranslatingLang(lang); }}
        />
      </main>

      {/* ⚠️ HDS React: Dialog – TranslationDrawer – VAATII Drupal-sovituksen */}
      <TranslationDrawer
        isOpen={translatingId !== null}
        onClose={() => { setTranslatingId(null); setTranslatingLang(null); }}
        task={translationTask}
        contentItem={translationItem}
        initialLang={translatingLang ?? undefined}
      />

      {/* Demo-toggle: tyhjän tilan testaus */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-m)', borderTop: '1px solid var(--color-black-10)' }}>
        {/* ✅ HDS Core: Button – Suoraan Drupalissa */}
        <Button
          variant="supplementary"
          size="small"
          iconLeft={null as unknown as React.ReactNode}
          iconRight={null as unknown as React.ReactNode}
          onClick={() => setEmptyDemo((v) => !v)}
        >
          {emptyDemo ? 'Palauta sisällöt' : 'Tyhjennä sivu (demo)'}
        </Button>
      </div>

      {/* ✅ HDS Core: Footer – Suoraan Drupalissa */}
      <Footer title="Helsingin kaupunki" theme="dark">
        <Footer.Navigation>
          <Footer.Link label="Saavutettavuusseloste" href="#" />
          <Footer.Link label="Evästeasetukset" href="#" />
          <Footer.Link label="Tietosuoja" href="#" />
          <Footer.Link label="Tietoa Hel.fi:stä" href="#" />
        </Footer.Navigation>
        <Footer.Base
          copyrightHolder="Helsingin kaupunki"
          copyrightText="© Helsingin kaupunki 2026"
          logo={<Logo size="small" src={logoFi} alt="Helsingin kaupunki" />}
          backToTopLabel="Takaisin ylös"
        />
      </Footer>

    </div>
  );
}

export default App;
