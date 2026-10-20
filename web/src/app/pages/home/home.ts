import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { LangService } from '../../core/lang.service';
import { initials } from '../../core/links';
import { Header } from '../../shared/header.component';
import { Cta } from '../../shared/cta.component';
import { DgLink } from '../../shared/dg-link.directive';
import { ImageSlot } from '../../shared/image-slot.component';
import { SocialLinks } from '../../shared/social-links.component';
import { HOME_DATA, HOME_T } from '../../data/home-data';
import { QUOTE_URL } from '../../data/site-data';
import { ArticlesService, formatDate } from '../../core/articles.service';
import { ReviewsService } from '../../core/reviews.service';

const LOGOS = [
  ['trust-gerofinance', 'Gerofinance – Régie du Rhône', 40], ['trust-tpg', 'tpg', 44], ['trust-patrimonium', 'Patrimonium', 30],
  ['trust-cpeg', 'CPEG', 44], ['trust-fust', 'Fust', 40], ['trust-spg', 'Société Privée de Gérance', 40],
  ['trust-romande', 'Romande Energie', 52], ['trust-ville', 'Ville de Genève', 56], ['trust-sig', 'SIG', 56],
] as const;

@Component({
  selector: 'dg-home',
  imports: [Header, Cta, DgLink, ImageSlot, SocialLinks],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private L = inject(LangService);
  protected lang = this.L.lang;
  protected t = computed(() => HOME_T[this.lang()]);
  protected data = computed(() => HOME_DATA[this.lang()]);
  protected quote = QUOTE_URL;
  protected logos = [...LOGOS, ...LOGOS];

  // service directory columns → service page per pollutant
  protected dirCols = [
    { n: '01', h: 'd0', items: ['d6', 'd7', 'd8', 'd9', 'd10'], href: './Diagnostic-amiante.dc.html' },
    { n: '02', h: 'd1', items: ['d11', 'd12', 'd13', 'd14'], href: './Diagnostic-plomb.dc.html' },
    { n: '03', h: 'd2', items: ['d15', 'd16', 'd17', 'd18'], href: './Diagnostic-PCB.dc.html' },
    { n: '04', h: 'd3', items: ['d19', 'd20', 'd21', 'd22'], href: './Diagnostic-HAP.dc.html' },
    { n: '05', h: 'd4', items: ['d23'], href: './Diagnostic-HBCD.dc.html' },
    { n: '06', h: 'd5', items: ['d24', 'd25', 'd26', 'd27', 'd28'], href: './Certificat-CECB.dc.html' },
  ];

  // ── offices / maps ──
  protected active = signal('geneva');
  protected current = computed(() => this.data().offices.find((o: any) => o.id === this.active()));
  private mapRef = viewChild<ElementRef<HTMLIFrameElement>>('map');
  private streetRef = viewChild<ElementRef<HTMLIFrameElement>>('street');

  // ── reviews carousel ──
  protected review = signal(0);
  private rv = inject(ReviewsService);
  protected g = computed(() => ({ url: this.rv.url, rating: this.rv.rating(), count: this.rv.count() }));
  protected ratingLabel = computed(() => this.rv.rating().toLocaleString(this.lang() === 'en' ? 'en-GB' : 'fr-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  protected currentReview = computed(() => {
    const list = this.rv.reviews(), lang = this.lang();
    const r = list[this.review() % list.length];
    const t = this.rv.textFor(r, lang), ago = this.rv.ago(r, lang);
    const src = lang === 'en' ? 'Google review' : 'Avis Google';
    return { author: r.author, photo: r.photo, text: t.text, meta: [src, ago, t.translated ? 'translated from French' : ''].filter(Boolean).join(' · '), initials: initials(r.author) };
  });
  protected reviewCount = computed(() => this.rv.reviews().length);

  // ── counters + van ──
  protected years = signal(0);
  protected officesN = signal(0);
  protected cantons = signal(0);
  protected vanX = signal(-460);
  private figRef = viewChild.required<ElementRef<HTMLElement>>('fig');
  private vanRef = viewChild.required<ElementRef<HTMLElement>>('van');
  private heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');
  private safetyVideo = viewChild<ElementRef<HTMLVideoElement>>('safetyVideo');

  // ── press list hover preview ──
  protected pressHover = signal(-1);
  protected pressX = signal(0);
  protected pressY = signal(0);
  private pressRef = viewChild.required<ElementRef<HTMLElement>>('pressList');

  protected marqueePaused = signal(false);

  // latest articles from the live site (falls back to the design's notes until loaded)
  private articles = inject(ArticlesService);
  protected pressCat = signal('all');
  protected articleCount = computed(() => this.articles.list().length);
  protected pressCats = computed(() => {
    const lang = this.lang(), cats = [...new Set(this.articles.list().map(a => a.cat[lang]))];
    return [{ key: 'all', label: lang === 'fr' ? 'Tous' : 'All' }, ...cats.map(c => ({ key: c, label: c }))];
  });
  protected press = computed(() => {
    const lang = this.lang(), cat = this.pressCat(), list = this.articles.list().filter(a => cat === 'all' || a.cat[lang] === cat);
    if (!this.articles.list().length) return this.data().press.map((p: any) => ({ ...p, href: './Actualites.dc.html' }));
    return list.slice(0, 4).map((a, i) => ({ id: a.slug, num: String(i + 1).padStart(2, '0'), title: a.title[lang], tag: `${lang === 'fr' ? 'Article' : 'Article'} · ${a.cat[lang]}`, date: formatDate(a.date, lang), img: a.img, imgLabel: a.cat[lang], href: '/actualites/' + a.slug }));
  });

  constructor() {
    const destroy = inject(DestroyRef);
    this.articles.load();
    this.rv.load();
    // keep the iframes' language in sync
    effect(() => this.postLang(this.lang()));

    afterNextRender(() => {
      for (const v of [this.heroVideo()?.nativeElement, this.safetyVideo()?.nativeElement]) {
        if (v) { v.muted = true; v.loop = true; v.playsInline = true; v.play().catch(() => {}); }
      }

      const fig = this.figRef().nativeElement;
      let counted = false;
      const io = new IntersectionObserver(([en]) => {
        if (en.isIntersecting && !counted) {
          counted = true; io.disconnect();
          const t0 = performance.now(), dur = 1600, ease = (x: number) => 1 - Math.pow(1 - x, 3);
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / dur), k = ease(p);
            this.years.set(Math.round(10 * k)); this.officesN.set(Math.round(4 * k)); this.cantons.set(Math.round(5 * k));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, { threshold: 0.35 });
      io.observe(fig);

      const onScroll = () => {
        const vh = window.innerHeight || 1;
        const vr = this.vanRef().nativeElement.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (vh - vr.top) / (vh + vr.height)));
        this.vanX.set(Math.round(-460 + t * (vr.width + 460)));
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      const langTimer = setTimeout(() => this.postLang(this.lang()), 1400);
      const onMsg = (e: MessageEvent) => {
        if (e.data && e.data.type === 'office') {
          this.active.set(e.data.id);
          this.streetRef()?.nativeElement.contentWindow?.postMessage({ type: 'select', id: e.data.id }, '*');
        }
      };
      window.addEventListener('message', onMsg);

      destroy.onDestroy(() => {
        io.disconnect(); clearTimeout(langTimer);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('message', onMsg);
      });
    });
  }

  private postLang(l: string) {
    const msg = { type: 'lang', lang: l };
    setTimeout(() => {
      this.mapRef()?.nativeElement.contentWindow?.postMessage(msg, '*');
      this.streetRef()?.nativeElement.contentWindow?.postMessage(msg, '*');
    }, 60);
  }

  protected selectOffice(ev: Event, id: string) {
    ev.preventDefault();
    this.active.set(id);
    const msg = { type: 'select', id };
    this.mapRef()?.nativeElement.contentWindow?.postMessage(msg, '*');
    this.streetRef()?.nativeElement.contentWindow?.postMessage(msg, '*');
  }

  protected prevReview() { const n = this.reviewCount(); this.review.update(i => (i - 1 + n) % n); }
  protected nextReview() { const n = this.reviewCount(); this.review.update(i => (i + 1) % n); }

  protected pressMove(e: MouseEvent) {
    const r = this.pressRef().nativeElement.getBoundingClientRect();
    this.pressX.set(Math.max(560, Math.min(r.width - 300, e.clientX - r.left)));
    this.pressY.set(e.clientY - r.top);
  }
  protected previewTransform = computed(() => {
    const on = this.pressHover() >= 0;
    return `translate(${this.pressX() - 150}px,${this.pressY() - 105}px) rotate(${on ? -3 : 0}deg) scale(${on ? 1 : 0.85})`;
  });
}
