// node test.mjs — checks the Google → website review conversion with a sample API page.
import assert from 'node:assert/strict';
import { buildFeed, splitComment } from './src/reviews.js';

const page = {
  averageRating: 4.6, totalReviewCount: 25, nextPageToken: undefined,
  reviews: [
    { reviewId: 'a', reviewer: { displayName: 'Melinda Mundwiler', profilePhotoUrl: 'https://x/p.jpg' }, starRating: 'FIVE', createTime: '2024-03-01T10:00:00Z',
      comment: "Je recommande vivement cette entreprise.\n\n(Translated by Google)\nI highly recommend this company." },
    { reviewId: 'b', reviewer: { displayName: 'Patrick C.' }, starRating: 'ONE', createTime: '2025-03-01T10:00:00Z', comment: 'Mauvaise expérience.' },
    { reviewId: 'c', reviewer: { displayName: 'John' }, starRating: 'FIVE', createTime: '2025-06-01T10:00:00Z',
      comment: '(Translated by Google) Great service\n\n(Original)\nService au top', reviewReply: { comment: 'Merci John !' } },
    { reviewId: 'd', reviewer: { isAnonymous: true }, starRating: 'FIVE', createTime: '2025-01-01T10:00:00Z' }, // rating only, no text
    { reviewId: 'e', reviewer: { displayName: 'Ana' }, starRating: 'FOUR', createTime: '2025-02-01T10:00:00Z', comment: 'Bien.' },
  ],
};

const feed = buildFeed([page], 5);
assert.equal(feed.rating, 4.6);
assert.equal(feed.count, 25);
assert.deepEqual(feed.reviews.map(r => r.id), ['c', 'a'], 'only 5★ with text, newest first');
assert.equal(feed.reviews[0].text, 'Service au top');
assert.equal(feed.reviews[0].translated, 'Great service');
assert.equal(feed.reviews[0].reply, 'Merci John !');
assert.equal(feed.reviews[1].text, 'Je recommande vivement cette entreprise.');
assert.equal(feed.reviews[1].translated, 'I highly recommend this company.');
assert.equal(buildFeed([page], 4).reviews.length, 3);
assert.deepEqual(splitComment('Plain text'), { text: 'Plain text', translated: null });
console.log('reviews.js: all checks passed');
