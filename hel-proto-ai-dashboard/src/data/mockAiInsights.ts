export type InsightType = 'duplicate' | 'link-suggestion';
export type InsightStatus = 'new' | 'dismissed';
export type SimilarityLevel = 'high' | 'medium';

export interface AiInsight {
  id: string;
  type: InsightType;
  status: InsightStatus;
  // The content item owned by this user
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  // The similar or related page (may be owned by another user)
  targetTitle: string;
  targetUrl: string;
  targetSection: string;
  targetOwner?: string;
  // Why flagged
  reason: string;
  // For duplicates: qualitative similarity level
  similarityLevel?: SimilarityLevel;
  detectedAt: string;
}

export const mockAiInsights: AiInsight[] = [
  {
    id: 'ins-1',
    type: 'duplicate',
    status: 'new',
    sourceId: '5',
    sourceTitle: 'Ulkoilureitit ja kartat',
    sourceUrl: '/fi/kulttuuri-ja-vapaa-aika/ulkoilu/reitit-ja-kartat',
    targetTitle: 'Luontopolut ja retkeily Helsingissä',
    targetUrl: '/fi/kulttuuri-ja-vapaa-aika/ulkoilu/luontopolut',
    targetSection: 'Liikunta',
    targetOwner: 'Tiina Mäkinen',
    reason:
      'Molemmilla sivuilla on lähes identtinen kappale ulkoilureittien kuvauksesta ja samat karttalinkit.',
    similarityLevel: 'high',
    detectedAt: '2026-03-09',
  },
  {
    id: 'ins-2',
    type: 'duplicate',
    status: 'new',
    sourceId: '7',
    sourceTitle: 'Liikuntaneuvonta ja terveysliikunta',
    sourceUrl: '/fi/kulttuuri-ja-vapaa-aika/liikunta/liikuntaneuvonta',
    targetTitle: 'Liikuntaneuvonta – varaa aika',
    targetUrl: '/fi/sosiaali-ja-terveyspalvelut/liikuntaneuvonta',
    targetSection: 'Sosiaali- ja terveyspalvelut',
    targetOwner: 'Markus Korhonen',
    reason:
      'Sivujen palvelukuvaukset ja yhteystiedot ovat lähes samat. Sisältö on tuotettu kahdessa eri osiossa.',
    similarityLevel: 'medium',
    detectedAt: '2026-03-09',
  },
  {
    id: 'ins-3',
    type: 'link-suggestion',
    status: 'new',
    sourceId: '6',
    sourceTitle: 'Purjehduskoulu aikuisille',
    sourceUrl: '/fi/kulttuuri-ja-vapaa-aika/liikunta/purjehduskoulu',
    targetTitle: 'Merellinen Helsinki – veneilyopas',
    targetUrl: '/fi/kulttuuri-ja-vapaa-aika/ulkoilu/merellinen-helsinki',
    targetSection: 'Liikunta',
    reason:
      'Käyttäjät, jotka hakevat purjehduskoulua, etsivät usein myös venesatamia ja merellisiä reittejä. Linkitys parantaisi löydettävyyttä.',
    detectedAt: '2026-03-08',
  },
];
