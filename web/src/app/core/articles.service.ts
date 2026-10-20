import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Article {
  slug: string;
  date: string;
  cat: { fr: string; en: string };
  img: string | null;
  title: { fr: string; en: string };
  excerpt: { fr: string; en: string };
  words: number;
}

/** News articles imported from the live WordPress site (public/content). */
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private http = inject(HttpClient);
  readonly list = signal<Article[]>([]);
  private loading?: Promise<Article[]>;
  private bodies = new Map<string, Promise<string>>();

  load(): Promise<Article[]> {
    return (this.loading ??= firstValueFrom(this.http.get<Article[]>('/content/articles.json')).then(a => { this.list.set(a); return a; }));
  }

  body(slug: string): Promise<string> {
    if (!this.bodies.has(slug)) this.bodies.set(slug, firstValueFrom(this.http.get(`/content/articles/${slug}.html`, { responseType: 'text' })));
    return this.bodies.get(slug)!;
  }
}

export function formatDate(iso: string, lang: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}
