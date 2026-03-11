export type LangStatus = 'ok' | 'outdated' | 'missing';
export type ContentStatus = 'published' | 'draft';
export type ContentType = 'Artikkeli' | 'Palvelu' | 'Uutinen' | 'Tapahtuma';

export interface ContentItem {
  id: string;
  title: string;
  section: string;
  contentType: ContentType;
  status: ContentStatus;
  lastModified: string; // ISO date string
  languages: {
    fi: LangStatus;
    sv: LangStatus;
    en: LangStatus;
  };
  url: string;
  editUrl: string;
}

export interface DashboardStats {
  published: number;
  modifiedLast30Days: number;
  needsUpdate: number;
  missingLanguageVersions: number;
}

export interface MockUser {
  name: string;
  firstName: string;
  section: string;
  lastLogin: string;
}
