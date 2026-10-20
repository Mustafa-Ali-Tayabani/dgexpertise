import { Component, computed, inject, input, signal } from '@angular/core';
import { LangService } from '../../core/lang.service';
import { pad } from '../../core/links';
import { ArticlesService, formatDate } from '../../core/articles.service';
import { sendForm } from '../../core/form-sender';
import * as D from '../../data/site-data';
import * as I from '../../data/info-data';
import * as M from '../../data/site-images';
import { Header } from '../../shared/header.component';
import { Footer } from '../../shared/footer.component';
import { Cta } from '../../shared/cta.component';
import { DgLink } from '../../shared/dg-link.directive';
import { ImageSlot } from '../../shared/image-slot.component';
import { Band, Faq, Hero, Promises, Trust } from '../../shared/sections';
import { AppHero } from '../../shared/app-hero.component';
import { PhoneScreen } from '../../shared/phone-screen.component';
import { PolluxVisual } from '../../shared/pollux-visual.component';

const GALLERY_SHAPE = [[2, 2], [1, 1], [1, 1], [1, 2], [1, 1], [2, 1], [1, 1], [1, 1], [2, 1], [1, 1], [1, 1], [2, 1]];

@Component({
  selector: 'dg-info-page',
  imports: [Header, Footer, Cta, DgLink, ImageSlot, Band, Faq, Hero, Promises, Trust, AppHero, PhoneScreen, PolluxVisual],
  templateUrl: './info-page.html',
  styleUrl: './info-page.css',
})
export class InfoPage {
  /** Key into info-data PAGES; supplied via route data. */
  readonly page = input<string>('about');
  protected lang = inject(LangService).lang;
  protected quote = D.QUOTE_URL;
  protected logos = M.LOGOS;

  protected cat = signal('all');
  /** Application page: drawn Pollux screen for each feature, in order. */
  protected phoneKinds = ['reports', 'order', 'geo', 'news'] as const;
  private articles = inject(ArticlesService);
  constructor() { this.articles.load(); }
  protected sent = signal(false);

  protected pg = computed(() => I.PAGES[this.page()]);
  protected P = computed(() => this.pg()[this.lang()]);
  protected C = computed(() => D.COMMON[this.lang()]);
  protected IMG = computed(() => M.PAGE_IMG[this.page()] || {});
  protected title = computed(() => M.splitTitle(this.P().hero.title));

  protected blocks = computed(() => {
    const lang = this.lang(), IMG = this.IMG(), cur = this.cat(), PAGE = this.page();
    return this.P().blocks.map((b: any, i: number) => {
      const k = `${PAGE}-${i}`;
      const o: any = { ...b, src: (IMG.blocks || {})[i] || '' };
      if (b.h) { const sp = M.splitHead(b.h); o.hA = sp.a; o.hB = sp.b; }
      switch (b.type) {
        case 'split':
          o.cols = b.reverse ? '480px minmax(0,1fr)' : 'minmax(0,1fr) 520px'; o.textOrder = b.reverse ? 2 : 1; break;
        case 'team':
          o.members = b.members.map(([name, role]: string[], j: number) => ({ name, role, src: (IMG.team || [])[j] || '' })); break;
        case 'values':
          o.items = b.items.map((v: any, j: number) => ({ ...v, n: pad(j + 1) })); break;
        case 'gallery':
          o.tiles = Array.from({ length: b.count }, (_, j) => ({ src: (IMG.gallery || [])[j] || '', label: `${b.label} ${j + 1}`, c: GALLERY_SHAPE[j % 12][0], r: GALLERY_SHAPE[j % 12][1] }));
          { // widen the last tile so the 4-column grid ends flush
            const area = o.tiles.reduce((n: number, t: any) => n + t.c * t.r, 0), gap = (4 - (area % 4)) % 4, last = o.tiles[o.tiles.length - 1];
            if (gap && last && last.r === 1 && last.c + gap <= 4) last.c += gap;
          }
          o.tiles.forEach((t: any) => { t.col = `span ${t.c}`; t.row = `span ${t.r}`; });
          break;
        case 'videos':
          o.tiles = Array.from({ length: b.count }, (_, j) => ({ label: `${b.label} ${j + 1}`, src: ((IMG.videos || [])[j] || {}).src || '', href: ((IMG.videos || [])[j] || {}).href || '#' })); break;
        case 'features':
          o.items = b.items.map((f: any, j: number) => ({ ...f, n: pad(j + 1), order: j % 2 ? 2 : 1, src: (IMG.features || [])[j] || '', ps: f.ps || [], steps: (f.steps || []).map((t: string, m: number) => ({ n: pad(m + 1), text: t })) })); break;
        case 'course':
          o.chapters = b.chapters.map((t: string, j: number) => ({ n: (lang === 'fr' ? 'Chapitre ' : 'Chapter ') + (j + 1), text: t })); break;
        case 'testimonials':
          o.items = b.items.map((r: any) => ({ ...r, initial: r.author[0] })); break;
        case 'ebooks':
          o.items = b.items.map((e: any, j: number) => ({ ...e, n: pad(j + 1), src: (IMG.ebooks || [])[j] || '' })); break;
        case 'links':
          o.groups = b.groups.map((g: any) => ({ h: g.h, links: g.links.map(([label, href]: string[]) => ({ label, href })) })); break;
        case 'news': {
          // real articles imported from the live site (public/content/articles.json)
          const list = this.articles.list();
          const cats = [...new Set(list.map(a => a.cat[lang]))];
          o.filters = [['all', b.all], ...cats.map(x => [x, x])].map(([key, label]) => ({ key, label }));
          o.items = list.map(a => ({ slug: a.slug, title: a.title[lang], cat: a.cat[lang], date: formatDate(a.date, lang), excerpt: a.excerpt[lang], src: a.img || '' }))
            .filter(n => cur === 'all' || n.cat === cur);
          break;
        }
      }
      o.k = k;
      return o;
    });
  });

  protected sending = signal(false);
  protected formError = signal(false);

  /** Contact form → configured form endpoint, or the visitor's email app (see core/forms.config.ts). */
  protected isLogo(src: string) { return /logo|badge|asca/i.test(src || ''); }

  protected async submit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement, f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? '').trim();
    this.sending.set(true); this.formError.set(false);
    try {
      await sendForm(`Contact site — ${get('subject')} — ${get('name')}`,
        { Nom: get('name'), 'E-mail': get('email'), Sujet: get('subject'), Message: get('message'), Langue: this.lang() }, get('email'));
      this.sent.set(true);
      form.reset();
    } catch { this.formError.set(true); }
    this.sending.set(false);
  }
}
