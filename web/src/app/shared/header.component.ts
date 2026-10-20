import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { LangService } from '../core/lang.service';
import { MotionService } from '../core/motion.service';
import { BookingService } from '../core/booking.service';
import { ArticlesService, formatDate } from '../core/articles.service';
import { toRoute } from '../core/links';
import { DgLink } from './dg-link.directive';
import { Cta } from './cta.component';
import { Icon, ROUTE_ICON } from './icons';
import * as D from '../data/site-data';
import * as M from '../data/site-images';

type Mega = 'services' | 'info';
interface SvcItem { slug: string; href: string; group: string; groupId: string; label: string; short: string; img: string }

const INFO_DESC: Record<string, { fr: string; en: string }> = {
  about: { fr: 'Notre équipe, nos valeurs et notre engagement.', en: 'Our team, our values and our commitment.' },
  references: { fr: 'Retour en images sur nos dernières expertises.', en: 'Our latest assignments in pictures.' },
  formations: { fr: 'Formation en ligne aux polluants du bâtiment.', en: 'Online training on building pollutants.' },
  bibliotheque: { fr: 'E-books gratuits, directives et liens utiles.', en: 'Free e-books, directives and useful links.' },
  laboratoires: { fr: 'Nos laboratoires partenaires accrédités.', en: 'Our accredited partner laboratories.' },
};

@Component({
  selector: 'dg-header',
  imports: [DgLink, Cta, Icon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class Header {
  readonly active = input<string>('');
  readonly overlay = input<boolean>(false);
  protected L = inject(LangService);
  protected lang = this.L.lang;
  private booking = inject(BookingService);
  private router = inject(Router);
  private articles = inject(ArticlesService);

  protected menu = signal(false);
  protected sub = signal<string | null>(null);
  protected mega = signal<Mega | null>(null);
  /** Panel content stays rendered while the panel animates closed. */
  protected shown = signal<Mega | null>(null);
  protected hover = signal('amiante');
  private closeTimer?: ReturnType<typeof setTimeout>;

  protected home = D.HOME;
  protected quote = D.QUOTE_URL;
  protected ctaMeet = computed(() => D.COMMON[this.lang()].ctaMeet);
  protected promises = computed(() => D.COMMON[this.lang()].promises as string[]);
  protected t = computed(() => this.lang() === 'en'
    ? { quote: 'Quote in 5 minutes', book: 'Book a meeting', allServices: 'All our expertise', allNews: 'All news', latest: 'Latest article', app: 'Your reports and new orders, in one app.' }
    : { quote: 'Devis en 5 minutes', book: 'Prendre rendez-vous', allServices: 'Toutes nos expertises', allNews: 'Toutes les actualités', latest: 'Dernier article', app: 'Vos rapports et nouvelles commandes, dans une seule app.' });

  protected items = computed(() => {
    const lang = this.lang();
    return D.NAV.map((n: any) => ({
      id: n.id, href: n.href, label: n.label[lang], active: n.id === this.active(),
      mega: (n.id === 'expertise' ? 'services' : n.id === 'information' ? 'info' : null) as Mega | null,
      menu: (n.menu || []).map((k: string) => {
        const s = D.SERVICES[k];
        if (s) { const e = D.SERVICE_LIST.find((x: any) => x.slug === k); return { href: e.file, label: s.nav[lang], tag: D.COMMON[lang].groups[e.group], icon: k }; }
        const p = D.INFO_PAGES[k]; return { href: p.href, label: p.label[lang], tag: '', icon: ROUTE_ICON[toRoute(p.href)] ?? k };
      }),
    }));
  });

  protected allServices = computed<SvcItem[]>(() => {
    const lang = this.lang();
    return D.SERVICE_LIST.map((e: any) => {
      const s = D.SERVICES[e.slug];
      return { slug: e.slug, href: e.file, group: D.COMMON[lang].groups[e.group], groupId: e.group, label: s.nav[lang], short: s[lang].short, img: (M.SERVICE_IMG[e.slug] || {}).card || (M.SERVICE_IMG[e.slug] || {}).hero || '' };
    });
  });
  protected groups = computed(() => ['pollutants', 'site', 'energy'].map(id => {
    const items = this.allServices().filter(s => s.groupId === id);
    return { id, label: items[0]?.group ?? id, items };
  }));
  protected preview = computed(() => this.allServices().find(s => s.slug === this.hover()) ?? this.allServices()[0]);

  protected infoItems = computed(() => {
    const lang = this.lang();
    return ['about', 'references', 'formations', 'bibliotheque', 'laboratoires'].map(k => ({ key: k, href: D.INFO_PAGES[k].href, label: D.INFO_PAGES[k].label[lang], desc: INFO_DESC[k][lang] }));
  });
  protected latest = computed(() => {
    const a = this.articles.list()[0];
    return a ? { ...a, date: formatDate(a.date, this.lang()) } : null;
  });

  constructor() {
    this.articles.load();
    const sub = this.router.events.subscribe(e => { if (e instanceof NavigationStart) { this.menu.set(false); this.closeMega(true); } });
    inject(DestroyRef).onDestroy(() => { sub.unsubscribe(); clearTimeout(this.closeTimer); document.body.style.overflow = ''; });
    // lock page scroll behind the open mobile menu
    const motion = inject(MotionService);
    effect(() => { const open = this.menu(); document.body.style.overflow = open ? 'hidden' : ''; motion.lock(open); });
  }

  protected openMega(m: Mega | null) {
    if (!m) return;
    clearTimeout(this.closeTimer);
    this.shown.set(m);
    this.mega.set(m);
  }
  /** Close after a short grace period so the pointer can travel from the nav pill to the panel. */
  protected closeMega(now = false) {
    clearTimeout(this.closeTimer);
    if (now) { this.mega.set(null); return; }
    this.closeTimer = setTimeout(() => this.mega.set(null), 180);
  }

  /** Open the booking panel, pre-selecting the given service or the current service page. */
  protected book(slug?: string) {
    this.menu.set(false); this.closeMega(true);
    let r = this.router.routerState.snapshot.root;
    while (r.firstChild) r = r.firstChild;
    this.booking.open(slug ?? r.data['slug'] ?? null);
  }

  protected toggleSub(id: string) { this.sub.update(s => (s === id ? null : id)); }
}
