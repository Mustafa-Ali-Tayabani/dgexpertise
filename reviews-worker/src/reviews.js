/**
 * Pure helpers (no Worker APIs) so they can be unit-tested with Node.
 * Google Business Profile review → website review.
 */
const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

/**
 * Google returns non-native reviews as
 *   "(Translated by Google) <english>\n\n(Original)\n<original>"
 * and native ones as plain text (sometimes followed by "(Translated by Google) …").
 */
export function splitComment(comment = '') {
  const c = comment.trim();
  const orig = c.match(/\(Original\)\s*([\s\S]*)$/);
  if (orig) {
    const translated = c.slice(0, orig.index).replace(/^\(Translated by Google\)\s*/, '').trim();
    return { text: orig[1].trim(), translated: translated || null };
  }
  const tr = c.match(/\(Translated by Google\)\s*([\s\S]*)$/);
  if (tr) return { text: c.slice(0, tr.index).trim(), translated: tr[1].trim() || null };
  return { text: c, translated: null };
}

export function toSiteReview(r) {
  const { text, translated } = splitComment(r.comment);
  return {
    id: r.reviewId,
    author: r.reviewer?.isAnonymous ? 'Anonyme' : (r.reviewer?.displayName || 'Anonyme'),
    photo: r.reviewer?.profilePhotoUrl || null,
    rating: STARS[r.starRating] ?? 0,
    text,
    translated,
    date: r.createTime,
    reply: r.reviewReply?.comment ? splitComment(r.reviewReply.comment).text : null,
  };
}

/** Build the public feed: overall rating/count + reviews with at least `minRating` stars and some text. */
export function buildFeed(pages, minRating = 5) {
  const all = pages.flatMap(p => p.reviews || []).map(toSiteReview);
  const first = pages[0] || {};
  const count = first.totalReviewCount ?? all.length;
  const rating = first.averageRating ?? (all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0);
  const reviews = all.filter(r => r.rating >= minRating && r.text).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return { rating: Math.round(rating * 10) / 10, count, updated: new Date().toISOString(), reviews };
}
