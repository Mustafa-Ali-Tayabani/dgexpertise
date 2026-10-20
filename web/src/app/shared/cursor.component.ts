import { Component, ElementRef, NgZone, afterNextRender, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LangService } from '../core/lang.service';
import { ROUTE_ICON, SERVICE_TAG, iconSvg } from './icons';
import * as D from '../data/site-data';

/**
 * Service-themed cursor. It is pinned exactly to the pointer (no easing, no idle motion);
 * animation only plays when what's under the pointer changes:
 *  - default        → small detector reticle
 *  - links/buttons  → reticle tightens into a green ring
 *  - service links  → a badge with that service's animated icon (asbestos fibres, Pb tile, PCB molecule…)
 *  - photos/videos  → framed scan lens with a single sweep + "Scan · Pb" style tag on service pages
 *  - article links  → "Lire" badge
 * Only on fine pointers without reduced-motion; native cursor stays on form fields.
 */
@Component({
  selector: 'dg-cursor',
  template: `
<div #c class="c">
  <div class="ret"><i></i><i></i><i></i><i></i></div>
  <div class="lens"><b></b><b></b><b></b><b></b><span class="sweep"></span></div>
  <div class="dot"></div>
  <div #badge class="badge"><span #bi class="bi"></span><span #bl class="bl"></span></div>
</div>`,
  styles: `
    :host{position:fixed;inset:0;pointer-events:none;z-index:2000;display:none}
    :host(.on){display:block}
    .c{position:fixed;left:0;top:0;will-change:transform}
    .dot,.ret,.lens{position:absolute;left:0;top:0;transform:translate(-50%,-50%)}
    .dot{width:6px;height:6px;border-radius:50%;background:#A6CE00;box-shadow:0 0 0 2px rgba(26,26,26,.45);transition:opacity .2s,scale .25s}

    .ret{width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(255,255,255,.9);mix-blend-mode:difference;
      transition:width .3s cubic-bezier(.2,.8,.2,1),height .3s cubic-bezier(.2,.8,.2,1),background .3s,border-color .3s,opacity .2s}
    .ret i{position:absolute;background:rgba(255,255,255,.9);transition:opacity .25s,translate .3s cubic-bezier(.2,.8,.2,1)}
    .ret i:nth-child(1),.ret i:nth-child(2){left:50%;width:1.5px;height:5px;margin-left:-.75px}
    .ret i:nth-child(1){top:-7px}.ret i:nth-child(2){bottom:-7px}
    .ret i:nth-child(3),.ret i:nth-child(4){top:50%;height:1.5px;width:5px;margin-top:-.75px}
    .ret i:nth-child(3){left:-7px}.ret i:nth-child(4){right:-7px}

    .lens{width:84px;height:84px;opacity:0;scale:.6;transition:opacity .25s,scale .35s cubic-bezier(.2,.8,.2,1);overflow:hidden;border-radius:6px}
    .lens b{position:absolute;width:16px;height:16px;border:2px solid #A6CE00}
    .lens b:nth-child(1){left:0;top:0;border-right:0;border-bottom:0}
    .lens b:nth-child(2){right:0;top:0;border-left:0;border-bottom:0}
    .lens b:nth-child(3){left:0;bottom:0;border-right:0;border-top:0}
    .lens b:nth-child(4){right:0;bottom:0;border-left:0;border-top:0}
    .sweep{position:absolute;left:6px;right:6px;top:0;height:2px;background:linear-gradient(90deg,transparent,#A6CE00,transparent);box-shadow:0 0 12px #A6CE00;opacity:0}

    .badge{position:absolute;left:18px;top:18px;display:flex;align-items:center;gap:10px;padding:5px 14px 5px 5px;border-radius:999px;background:#1A1A1A;border:1px solid rgba(255,255,255,.16);
      box-shadow:0 12px 30px rgba(0,0,0,.35);white-space:nowrap;opacity:0;scale:.6;transform-origin:0 0;transition:opacity .2s,scale .3s cubic-bezier(.2,.8,.2,1)}
    .bi{width:34px;height:34px;border-radius:50%;background:#A6CE00;color:#1A1A1A;display:grid;place-items:center;padding:6px}
    .bl{font:600 12px/1 Inter,sans-serif;letter-spacing:.04em;color:#fff}

    :host(.link) .ret{width:40px;height:40px;background:rgba(255,255,255,.14)}
    :host(.link) .ret i{opacity:0}
    :host(.link) .dot{scale:.6}

    :host(.badge-on) .badge{opacity:1;scale:1}
    :host(.badge-on) .ret{width:16px;height:16px}
    :host(.badge-on) .ret i{opacity:0}

    :host(.scan) .lens{opacity:1;scale:1}
    :host(.scan) .sweep{animation:sweep .9s cubic-bezier(.65,0,.35,1) .05s 1 both}
    :host(.scan) .ret{opacity:0}
    :host(.scan) .badge{left:50px;top:30px}
    @keyframes sweep{0%{opacity:0;top:4px}15%{opacity:1}85%{opacity:1}100%{opacity:0;top:calc(100% - 6px)}}

    :host(.down) .ret{width:20px;height:20px}
    :host(.hide) .c{opacity:0}
    .c{transition:opacity .2s}
  `,
})
export class Cursor {
  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private c = viewChild.required<ElementRef<HTMLElement>>('c');
  private bi = viewChild.required<ElementRef<HTMLElement>>('bi');
  private bl = viewChild.required<ElementRef<HTMLElement>>('bl');
  private lang = inject(LangService).lang;
  private router = inject(Router);

  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => {
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      zone.runOutsideAngular(() => this.start());
    });
  }

  /** Service slug of the current page, if it is a service page. */
  private pageService() {
    let r = this.router.routerState.snapshot.root;
    while (r.firstChild) r = r.firstChild;
    return r.data['slug'] as string | undefined;
  }

  private start() {
    const c = this.c().nativeElement, bi = this.bi().nativeElement, bl = this.bl().nativeElement;
    const cls = this.host.classList;
    document.documentElement.classList.add('has-cursor');
    cls.add('on', 'hide');
    let magnet: HTMLElement | null = null, lastKey = '';

    const badge = (key: string, icon: string, label: string) => {
      if (key === lastKey) return;
      lastKey = key;
      bi.innerHTML = iconSvg(icon, 'ic-draw'); // re-inserting restarts the draw-in animation
      bl.textContent = label;
    };

    addEventListener('mousemove', e => {
      c.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      cls.remove('hide');
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        magnet.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1)}px`;
      }
    }, { passive: true });
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) cls.add('hide'); });
    addEventListener('mousedown', () => cls.add('down'));
    addEventListener('mouseup', () => cls.remove('down'));

    document.addEventListener('mouseover', e => {
      const t = e.target as HTMLElement;
      const fr = this.lang() === 'fr';
      cls.toggle('hide', !!t.closest('input, textarea, select, iframe'));

      const a = t.closest<HTMLAnchorElement>('a[href]');
      const href = a?.getAttribute('href') ?? '';
      const svcIcon = ROUTE_ICON[href.split(/[?#]/)[0]];
      const media = !a && t.closest('image-slot, video, .where figure');
      const link = t.closest('a, button, [role=button], label');

      cls.remove('link', 'scan', 'badge-on');
      if (href.startsWith('/actualites/')) {
        badge('read', 'article', fr ? 'Lire l’article' : 'Read article'); cls.add('badge-on');
      } else if (svcIcon && a?.closest('dg-header, .mega, .sheet') === null && !t.closest('dg-footer')) {
        const lang = this.lang(), svc = D.SERVICES[svcIcon], info = D.INFO_PAGES[svcIcon === 'about' ? 'about' : svcIcon];
        const label = svc ? svc.nav[lang] : info ? info.label[lang] : svcIcon === 'expertise' ? (fr ? 'Nos expertises' : 'Our expertise') : svcIcon;
        badge('svc:' + svcIcon, svcIcon, label); cls.add('badge-on');
      } else if (media) {
        const s = this.pageService();
        cls.add('scan');
        if (s) { badge('scan:' + s, s, `Scan · ${SERVICE_TAG[s]}`); cls.add('badge-on'); }
        // restart the single sweep each time a new photo is entered
        const sw = c.querySelector<HTMLElement>('.sweep')!; sw.style.animation = 'none'; void sw.offsetWidth; sw.style.animation = '';
      } else if (link) {
        cls.add('link'); lastKey = '';
      } else lastKey = '';

      const m = t.closest<HTMLElement>('.dg-cta, .dg-dark-pill, .meet');
      if (m !== magnet) { if (magnet) magnet.style.translate = ''; magnet = m; }
    });
  }
}
