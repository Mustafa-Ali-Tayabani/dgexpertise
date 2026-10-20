import { Injectable, effect, signal } from '@angular/core';

export type Lang = 'fr' | 'en';

/** Site-wide language, persisted under the same key the design used ("dg-lang"). */
@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>(LangService.read());

  constructor() {
    effect(() => document.documentElement.setAttribute('lang', this.lang()));
  }

  set(l: string) {
    const v: Lang = l === 'en' ? 'en' : 'fr';
    try { localStorage.setItem('dg-lang', v); } catch {}
    this.lang.set(v);
  }

  private static read(): Lang {
    try { const st = localStorage.getItem('dg-lang'); if (st === 'en' || st === 'fr') return st; } catch {}
    return 'fr';
  }
}
