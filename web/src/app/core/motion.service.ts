import { Injectable, NgZone, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import Lenis from 'lenis';

/**
 * Site-wide motion layer, applied without touching page templates:
 *  - Lenis smooth scrolling (desktop pointers only)
 *  - scroll reveals: headings, grid items, split blocks and bands rise in; image frames wipe in
 *  - hero intro on every page load + hero background parallax / content fade on scroll
 *  - gentle parallax on content photos
 *  - top scroll-progress bar
 * Everything is skipped when the visitor prefers reduced motion.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private router = inject(Router);
  private zone = inject(NgZone);

  private lenis?: Lenis;
  private io?: IntersectionObserver;
  private mo?: MutationObserver;
  private seen = new WeakSet<Element>();
  private parallax: HTMLElement[] = [];
  private heroes: { bg: HTMLElement | null; body: HTMLElement | null }[] = [];
  private bar?: HTMLElement;
  private scanTimer?: ReturnType<typeof setTimeout>;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /** Elements that rise in when scrolled into view (first match wins; nested matches are skipped). */
  private static readonly REVEAL = [
    'h2', '.dg-label', 'dg-band', 'dg-trust', 'dg-promises', '.r-split > *',
    '.r-g2 > *', '.r-g3 > *', '.r-g4 > *', '.r-g5 > *', '.r-g6 > *', '.r-gallery > *', '.where > *',
    '.r-press', '.prose > *', 'section', 'figure',
  ].join(',');
  private static readonly EXCLUDE = '.r-hero, dg-header, .sheet, dg-footer, [data-no-reveal]';

  init() {
    if (this.reduced) { document.documentElement.classList.add('motion-off'); return; }
    document.documentElement.classList.add('motion-on');

    this.zone.runOutsideAngular(() => {
      if (this.finePointer) {
        this.lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      }
      this.bar = document.createElement('div');
      this.bar.className = 'scroll-progress';
      document.body.appendChild(this.bar);

      this.io = new IntersectionObserver(entries => {
        const hits = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        hits.forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.setProperty('--rv-d', `${Math.min(i, 6) * 80}ms`);
          el.classList.add('rv-in');
          this.io!.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

      // pick up content rendered after navigation (async data, filters, @if blocks)
      this.mo = new MutationObserver(() => { clearTimeout(this.scanTimer); this.scanTimer = setTimeout(() => this.scan(), 60); });
      this.mo.observe(document.body, { childList: true, subtree: true });

      const raf = (t: number) => { this.lenis?.raf(t); this.frame(); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    });

    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) this.lenis?.stop();
      if (e instanceof NavigationEnd) {
        this.lenis?.scrollTo(0, { immediate: true, force: true });
        this.lenis?.start();
        setTimeout(() => { this.introHero(); this.scan(); }, 0);
      }
    });
  }

  /** Pause/resume smooth scrolling (e.g. while the mobile menu is open). */
  lock(on: boolean) { on ? this.lenis?.stop() : this.lenis?.start(); }

  private introHero() {
    document.querySelectorAll<HTMLElement>('.r-hero-body').forEach(body => {
      // the hero content column(s): stagger their direct children
      const cols = [...body.children].filter(c => getComputedStyle(c).flexDirection === 'column' && c.children.length > 2) as HTMLElement[];
      const items = cols.length ? [...cols.flatMap(c => [...c.children]), ...[...body.children].filter(c => !cols.includes(c as HTMLElement))] : [...body.children];
      items.forEach((el, i) => {
        if (this.seen.has(el)) return;
        this.seen.add(el);
        (el as HTMLElement).style.setProperty('--hi-d', `${150 + i * 110}ms`);
        el.classList.add('hero-in');
      });
    });
    this.heroes = [...document.querySelectorAll<HTMLElement>('.r-hero')].map(h => ({
      bg: (h.querySelector(':scope > video') as HTMLElement) ?? (h.firstElementChild as HTMLElement),
      body: h.querySelector<HTMLElement>('.r-hero-body'),
    }));
  }

  private scan() {
    const vh = innerHeight;
    document.querySelectorAll<HTMLElement>(MotionService.REVEAL).forEach(el => {
      if (this.seen.has(el) || el.closest(MotionService.EXCLUDE)) return;
      this.seen.add(el);
      // skip if an ancestor is already animated, so content doesn't move twice
      let p = el.parentElement, nested = false;
      while (p && p !== document.body) { if (p.classList.contains('rv')) { nested = true; break; } p = p.parentElement; }
      if (nested) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0 && r.top >= 0) return; // already visible on arrival: leave it alone
      if (r.height > vh * 0.9) return; // very tall blocks: never hide them (they could not be "seen" enough to reveal)
      el.classList.add('rv');
      if (el.querySelector(':scope > image-slot') && !el.querySelector(':scope > :not(image-slot)')) el.classList.add('rv-clip');
      this.io!.observe(el);
    });
    this.parallax = innerWidth > 900
      ? [...document.querySelectorAll<HTMLElement>('image-slot:not([data-fit=contain])')].filter(s => !s.closest('.r-hero, dg-header, .sheet, .r-hide-touch') && (s.parentElement?.clientHeight ?? 0) >= 220)
      : [];
  }

  private frame() {
    const y = scrollY, vh = innerHeight;
    if (this.bar) {
      const max = document.documentElement.scrollHeight - vh;
      this.bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
    for (const h of this.heroes) {
      if (y > vh * 1.2) continue;
      if (h.bg) h.bg.style.translate = `0 ${(y * 0.35).toFixed(1)}px`;
      if (h.body) { h.body.style.opacity = String(Math.max(0, 1 - y / (vh * 0.85))); h.body.style.translate = `0 ${(y * -0.12).toFixed(1)}px`; }
    }
    for (const s of this.parallax) {
      const r = s.parentElement!.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1 across the viewport
      s.style.scale = '1.14';
      s.style.translate = `0 ${(p * r.height * -0.06).toFixed(1)}px`;
    }
  }
}
