export type TranslationStatus = 'ai-generated' | 'from-memory';

export interface SourceChunk {
  id: string;
  text: string;
  changed?: boolean; // changed since last translation
}

export interface MemoryMatch {
  confidence: number; // 0–100
  sourcePageTitle: string;
}

export interface TranslationChunk {
  id: string;
  text: string;
  isNew?: boolean; // corresponds to a changed/new source chunk
  memoryMatch?: MemoryMatch;
  status: TranslationStatus;
}

export interface TranslationDraft {
  lang: 'sv' | 'en';
  langName: string;
  title: string;
  chunks: TranslationChunk[];
  generatedAt: string; // ISO datetime – when AI draft was generated
  translationLastModified?: string; // ISO date – when existing translation was last saved (for outdated)
}

export interface TranslationTask {
  contentId: string;
  sourceTitle: string;
  sourceLastModified: string;
  changesDetected: number;
  sourceChunks: SourceChunk[];
  drafts: TranslationDraft[];
}

export const mockTranslationTasks: TranslationTask[] = [
  {
    contentId: '1',
    sourceTitle: 'Liikuntapaikkojen varaaminen verkossa',
    sourceLastModified: '2026-03-07',
    changesDetected: 1,
    sourceChunks: [
      {
        id: 's1-1',
        text: 'Voit varata liikuntapaikan Helsingin kaupungin verkkopalvelussa ympäri vuorokauden. Palvelussa näet vapaiden aikojen saatavuuden reaaliaikaisesti ja voit valita itseäsi sopivimman ajan.',
      },
      {
        id: 's1-2',
        text: 'Varaus tehdään henkilökohtaisilla Helsinki-tunnuksilla. Rekisteröityminen on ilmaista ja kestää vain muutaman minuutin.',
      },
      {
        id: 's1-3',
        text: 'Uusi varausjärjestelmä otettiin käyttöön tammikuussa 2026. Järjestelmässä voit nyt varata useita liikuntapaikkoja samalla kerralla ja hallita kaikkia varauksiasi yhdestä näkymästä. Peruutukset onnistuvat maksutta 48 tuntia ennen varauksen alkua.',
        changed: true,
      },
      {
        id: 's1-4',
        text: 'Lisätietoja liikuntapaikkojen varaamisesta saat liikuntatoimen asiakaspalvelusta arkisin klo 9–15.',
      },
    ],
    drafts: [
      {
        lang: 'sv',
        langName: 'Ruotsi',
        title: 'Bokning av idrottsplatser på nätet',
        generatedAt: '2026-03-10T14:23:00',
        translationLastModified: '2025-11-20',
        chunks: [
          {
            id: 'sv1-1',
            status: 'from-memory',
            text: 'Du kan boka idrottsplatser i Helsingfors stads webbtjänst dygnet runt. I tjänsten ser du tillgängligheten för lediga tider i realtid och kan välja den tid som passar dig bäst.',
            memoryMatch: { confidence: 94, sourcePageTitle: 'Tennisbanor – bokning' },
          },
          {
            id: 'sv1-2',
            status: 'from-memory',
            text: 'Bokningen görs med personliga Helsinki-ID. Registreringen är gratis och tar bara några minuter.',
            memoryMatch: { confidence: 98, sourcePageTitle: 'Simhallar – priser och tider' },
          },
          {
            id: 'sv1-3',
            status: 'ai-generated',
            text: 'Det nya bokningssystemet togs i bruk i januari 2026. I systemet kan du nu boka flera idrottsplatser samtidigt och hantera alla dina bokningar från en vy. Avbokningar kan göras kostnadsfritt 48 timmar före bokningens start.',
            isNew: true,
          },
          {
            id: 'sv1-4',
            status: 'from-memory',
            text: 'Mer information om bokning av idrottsplatser får du av idrottstjänsternas kundtjänst på vardagar kl. 9–15.',
            memoryMatch: { confidence: 91, sourcePageTitle: 'Kontakta idrottstjänsterna' },
          },
        ],
      },
      {
        lang: 'en',
        langName: 'Englanti',
        title: 'Booking sports facilities online',
        generatedAt: '2026-03-10T14:23:00',
        chunks: [
          {
            id: 'en1-1',
            status: 'ai-generated',
            text: 'You can book sports facilities in the City of Helsinki online service around the clock. The service shows the real-time availability of free slots, allowing you to choose the most convenient time.',
            isNew: true,
          },
          {
            id: 'en1-2',
            status: 'ai-generated',
            text: 'Bookings are made using your personal Helsinki account. Registration is free and takes only a few minutes.',
            isNew: true,
          },
          {
            id: 'en1-3',
            status: 'ai-generated',
            text: 'A new booking system was introduced in January 2026. The system now allows you to book multiple sports facilities simultaneously and manage all your bookings from a single view. Cancellations are free of charge up to 48 hours before the booking starts.',
            isNew: true,
          },
          {
            id: 'en1-4',
            status: 'ai-generated',
            text: 'For more information about booking sports facilities, contact the Sports Services customer service on weekdays from 9 to 15.',
            isNew: true,
          },
        ],
      },
    ],
  },
  {
    contentId: '3',
    sourceTitle: 'Kirjastot – aukioloajat ja palvelut',
    sourceLastModified: '2025-12-10',
    changesDetected: 1,
    sourceChunks: [
      {
        id: 's3-1',
        text: 'Helsingin kaupunginkirjaston toimipisteet ovat avoinna ympäri kaupunkia. Löydät lähimmän kirjaston osoitteineen ja aukioloaikoineen karttapalvelusta.',
      },
      {
        id: 's3-2',
        text: 'Talvi 2025–2026: kirjastojen aukioloajat on päivitetty. Useimmat kirjastot ovat avoinna maanantaista perjantaihin klo 10–20 ja lauantaisin klo 10–16. Oodi on avoinna joka päivä klo 8–22. Jouluna ja uutena vuotena kirjastot ovat kiinni.',
        changed: true,
      },
      {
        id: 's3-3',
        text: 'Kirjastoista saat lainata kirjoja, elokuvia, musiikkia ja pelejä. Kirjastokortti on maksuton, ja sen saa kaikille Suomessa asuville.',
      },
    ],
    drafts: [
      {
        lang: 'sv',
        langName: 'Ruotsi',
        title: 'Bibliotek – öppettider och tjänster',
        generatedAt: '2026-03-10T14:23:00',
        translationLastModified: '2025-08-14',
        chunks: [
          {
            id: 'sv3-1',
            status: 'from-memory',
            text: 'Helsingfors stadsbiblioteks filialer finns runt om i staden. Du hittar det närmaste biblioteket med adress och öppettider i karttjänsten.',
            memoryMatch: { confidence: 97, sourcePageTitle: 'Bibliotek i Helsingfors – hitta oss' },
          },
          {
            id: 'sv3-2',
            status: 'ai-generated',
            text: 'Vintern 2025–2026: bibliotekens öppettider har uppdaterats. De flesta bibliotek är öppna måndag till fredag kl. 10–20 och lördagar kl. 10–16. Oodi är öppet varje dag kl. 8–22. Under jul och nyår är biblioteken stängda.',
            isNew: true,
          },
          {
            id: 'sv3-3',
            status: 'from-memory',
            text: 'På biblioteken kan du låna böcker, filmer, musik och spel. Bibliotekskortet är gratis och kan fås av alla som bor i Finland.',
            memoryMatch: { confidence: 99, sourcePageTitle: 'Bibliotekets tjänster' },
          },
        ],
      },
    ],
  },
  {
    contentId: '4',
    sourceTitle: 'Nuorisotilat Helsingissä',
    sourceLastModified: '2024-02-15',
    changesDetected: 2,
    sourceChunks: [
      {
        id: 's4-1',
        text: 'Nuorisotilat ovat tarkoitettu 10–17-vuotiaille nuorille. Tilat ovat maksuttomia ja avoimia kaikille helsinkiläisille nuorille.',
        changed: true,
      },
      {
        id: 's4-2',
        text: 'Nuorisotiloissa voi viettää aikaa kavereiden kanssa, harrastaa ja osallistua ohjattuun toimintaan. Tiloissa on pelejä, musiikki-instrumentteja ja muuta vapaa-ajan välineistöä.',
      },
      {
        id: 's4-3',
        text: 'Nuorisotilat sijaitsevat eri puolilla Helsinkiä. Löydät lähimmän nuorisotilan osoitteineen nuorisopalvelujen sivuilta tai kartalta.',
        changed: true,
      },
    ],
    drafts: [
      {
        lang: 'sv',
        langName: 'Ruotsi',
        title: 'Ungdomslokaler i Helsingfors',
        generatedAt: '2026-03-10T14:23:00',
        translationLastModified: '2023-09-05',
        chunks: [
          {
            id: 'sv4-1',
            status: 'ai-generated',
            text: 'Ungdomslokalerna är avsedda för ungdomar i åldern 10–17 år. Lokalerna är avgiftsfria och öppna för alla ungdomar i Helsingfors.',
            isNew: true,
          },
          {
            id: 'sv4-2',
            status: 'ai-generated',
            text: 'I ungdomslokalerna kan man umgås med kompisar, ägna sig åt hobbyer och delta i ledd verksamhet. I lokalerna finns spel, musikinstrument och annan fritidsutrustning.',
          },
          {
            id: 'sv4-3',
            status: 'ai-generated',
            text: 'Ungdomslokalerna finns på olika håll i Helsingfors. Du hittar den närmaste ungdomslokalen med adress på ungdomstjänsternas sidor eller på kartan.',
            isNew: true,
          },
        ],
      },
      {
        lang: 'en',
        langName: 'Englanti',
        title: 'Youth centres in Helsinki',
        generatedAt: '2026-03-10T14:23:00',
        translationLastModified: '2023-09-05',
        chunks: [
          {
            id: 'en4-1',
            status: 'ai-generated',
            text: 'Youth centres are intended for young people aged 10–17. The centres are free of charge and open to all young people in Helsinki.',
            isNew: true,
          },
          {
            id: 'en4-2',
            status: 'ai-generated',
            text: 'At youth centres, you can spend time with friends, pursue hobbies and participate in guided activities. The centres have games, musical instruments and other leisure equipment.',
          },
          {
            id: 'en4-3',
            status: 'ai-generated',
            text: 'Youth centres are located across Helsinki. You can find the nearest youth centre with its address on the youth services pages or on the map.',
            isNew: true,
          },
        ],
      },
    ],
  },
  {
    contentId: '5',
    sourceTitle: 'Ulkoilureitit ja kartat',
    sourceLastModified: '2025-09-04',
    changesDetected: 1,
    sourceChunks: [
      {
        id: 's5-1',
        text: 'Helsinki tarjoaa monipuolisen verkoston ulkoilureittejä ympäri kaupunkia. Reitit soveltuvat kävelyyn, juoksuun, pyöräilyyn ja hiihtoon.',
      },
      {
        id: 's5-2',
        text: 'Karttapalvelussa voit suunnitella reitit etukäteen ja ladata ne mobiililaitteeseesi. Palveluun on lisätty syksyllä 2025 uudet talvireitit ja latukartat.',
        changed: true,
      },
      {
        id: 's5-3',
        text: 'Luontopolut ja retkeily ovat mahdollisia myös Helsingin ulkosaarilla. Saariin pääsee kesäisin lauttaliikenteellä.',
      },
    ],
    drafts: [
      {
        lang: 'sv',
        langName: 'Ruotsi',
        title: 'Friluftsleder och kartor',
        generatedAt: '2026-03-10T14:23:00',
        translationLastModified: '2025-05-19',
        chunks: [
          {
            id: 'sv5-1',
            status: 'from-memory',
            text: 'Helsingfors erbjuder ett mångsidigt nätverk av friluftsleder runt om i staden. Lederna lämpar sig för promenader, löpning, cykling och skidåkning.',
            memoryMatch: { confidence: 96, sourcePageTitle: 'Utomhusaktiviteter i Helsingfors' },
          },
          {
            id: 'sv5-2',
            status: 'ai-generated',
            text: 'I karttjänsten kan du planera rutter i förväg och ladda ner dem till din mobila enhet. Hösten 2025 har nya vinterrutter och skidspårskartor lagts till i tjänsten.',
            isNew: true,
          },
          {
            id: 'sv5-3',
            status: 'from-memory',
            text: 'Naturleder och vandring är möjliga också på Helsingfors yttre öar. Till öarna kan man ta sig med färjetrafik på sommaren.',
            memoryMatch: { confidence: 89, sourcePageTitle: 'Helsingfors yttre skärgård' },
          },
        ],
      },
    ],
  },
];
