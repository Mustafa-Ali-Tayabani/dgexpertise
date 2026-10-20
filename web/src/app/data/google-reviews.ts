/**
 * Real Google Business data for DG Expertise (Av. de Vaudagne 33, 1217 Meyrin).
 * Rating/count from the Google listing; review texts are the Google reviews quoted on dgexpertise.ch.
 * These are the fallback values, used until the live feed (GOOGLE.feed) is configured or if it is unreachable.
 */
export const GOOGLE = {
  /**
   * Live feed from the reviews Worker (../reviews-worker), e.g. 'https://dg-reviews.<you>.workers.dev/reviews'.
   * When set, all 5★ Google reviews + the live rating/count replace the fallback values below.
   */
  feed: '',
  rating: 4.6,
  count: 25,
  url: 'https://www.google.com/maps/search/?api=1&query=DG+Expertise%2C+Avenue+de+Vaudagne+33%2C+1217+Meyrin',
};

export interface GoogleReview { author: string; rating: number; fr: string; en: string }

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    author: 'Melinda Mundwiler', rating: 5,
    fr: "Je recommande vivement cette entreprise qui m'a satisfaite à 1000%. Ils ont été très rapides, réactifs, ont des prix très intéressants et sont dotés d'un grand professionnalisme.",
    en: 'I highly recommend this company, which satisfied me 1000%. They were very fast and responsive, their prices are very attractive and they are highly professional.',
  },
  {
    author: 'Xavier Péclard', rating: 5,
    fr: 'Service au top ! Proche de mes besoins, rapide, efficace, prix compétitifs et bonne réflexion pour la recherche des meilleures solutions dans les actions à mener.',
    en: 'Top service! Attentive to my needs, fast, efficient, competitive prices and sound thinking in finding the best solutions for the work to be done.',
  },
  {
    author: 'Xuyu Küffer', rating: 5,
    fr: 'Disponible et courtois, expertise rapide. Les prix sont affichés sans surprise. Je recommande !',
    en: 'Available and courteous, quick assessment. Prices are clear with no surprises. I recommend them!',
  },
];
