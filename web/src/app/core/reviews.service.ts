import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GOOGLE, GOOGLE_REVIEWS } from '../data/google-reviews';

export interface Review {
  author: string;
  photo: string | null;
  rating: number;
  /** Original text as written on Google. */
  text: string;
  /** Google's translation (EN), when available. */
  translated: string | null;
  date: string | null;
}

/**
 * Google reviews for the site: the live feed from the reviews Worker when configured
 * (all 5★ reviews + live rating/count), otherwise the curated fallback in data/google-reviews.ts.
 */
@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private http = inject(HttpClient);
  readonly rating = signal(GOOGLE.rating);
  readonly count = signal(GOOGLE.count);
  readonly reviews = signal<Review[]>(GOOGLE_REVIEWS.map(r => ({ author: r.author, photo: null, rating: r.rating, text: r.fr, translated: r.en, date: null })));
  readonly live = signal(false);
  readonly url = GOOGLE.url;
  private started = false;

  load() {
    if (this.started || !GOOGLE.feed) return;
    this.started = true;
    this.http.get<{ rating: number; count: number; reviews: Review[] }>(GOOGLE.feed).subscribe({
      next: f => {
        if (f.rating) this.rating.set(f.rating);
        if (f.count) this.count.set(f.count);
        const five = (f.reviews || []).filter(r => r.rating === 5 && r.text);
        if (five.length) { this.reviews.set(five); this.live.set(true); }
      },
      error: () => { /* keep fallback reviews */ },
    });
  }

  /** Text to show for the UI language; flags when a translation is shown. */
  textFor(r: Review, lang: string) {
    return lang === 'en' && r.translated ? { text: r.translated, translated: true } : { text: r.text, translated: false };
  }

  ago(r: Review, lang: string) {
    if (!r.date) return '';
    const days = (Date.now() - new Date(r.date).getTime()) / 864e5;
    const rtf = new Intl.RelativeTimeFormat(lang === 'en' ? 'en' : 'fr', { numeric: 'auto' });
    if (days < 30) return rtf.format(-Math.max(1, Math.round(days)), 'day');
    if (days < 365) return rtf.format(-Math.round(days / 30), 'month');
    return rtf.format(-Math.round(days / 365), 'year');
  }
}
