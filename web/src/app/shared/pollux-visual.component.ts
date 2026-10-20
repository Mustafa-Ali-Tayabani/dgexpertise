import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { PhoneScreen } from './phone-screen.component';

/**
 * Code version of the "Simplifier la gestion de vos rapports d'expertise" Pollux visual:
 * same composition as the original image (lime→blue gradient, phone with the reports screen,
 * white heading, four ticked feature tags, store tiles) — crisp, animated and translatable.
 */
@Component({
  selector: 'dg-pollux-visual',
  imports: [PhoneScreen],
  template: `
@let T = t();
<div class="pv" [class.go]="go()">
  <div class="ph"><dg-phone-screen kind="reports" [lang]="lang()" /></div>
  <div class="txt">
    <div class="ttl">{{ T.title }}</div>
    <ul>
      @for (f of T.items; track f; let i = $index) {
        <li [style.--i]="i" [class.hl]="hl() === i"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/></svg>{{ f }}</li>
      }
    </ul>
  </div>
  <div class="stores">
    <a href="https://apps.apple.com/ch/app/pollux-mobile/id1589255990?l=fr" target="_blank" rel="noopener" aria-label="App Store"><svg viewBox="0 0 24 24"><path fill="#2D9AD7" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2-.1 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/></svg></a>
    <a href="https://play.google.com/store/apps/details?id=ch.dgexpertise.polluxMobile" target="_blank" rel="noopener" aria-label="Google Play"><svg viewBox="0 0 24 24"><path fill="#2D9AD7" d="M6.6 9.2h10.8v7.6a1.2 1.2 0 0 1-1.2 1.2h-.8v2.4a1.1 1.1 0 0 1-2.2 0V18h-2.4v2.4a1.1 1.1 0 0 1-2.2 0V18h-.8a1.2 1.2 0 0 1-1.2-1.2zM4.4 9.2a1.1 1.1 0 0 1 1.1 1.1v4.6a1.1 1.1 0 0 1-2.2 0v-4.6a1.1 1.1 0 0 1 1.1-1.1zm15.2 0a1.1 1.1 0 0 1 1.1 1.1v4.6a1.1 1.1 0 0 1-2.2 0v-4.6a1.1 1.1 0 0 1 1.1-1.1zM15.3 4.6l1.1-1.7a.3.3 0 0 0-.5-.3l-1.1 1.8a6.4 6.4 0 0 0-5.6 0L8.1 2.6a.3.3 0 0 0-.5.3l1.1 1.7A5.5 5.5 0 0 0 6.6 8.3h10.8a5.5 5.5 0 0 0-2.1-3.7zM9.6 6.9a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2zm4.8 0a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z"/></svg></a>
  </div>
</div>`,
  styles: `
    :host{display:block}
    .pv{position:relative;min-height:620px;border-radius:24px;overflow:hidden;display:grid;grid-template-columns:44% 56%;align-items:center;
      background:linear-gradient(180deg,#B9CE1B 0%,#93C26A 38%,#5BAFB7 70%,#2A9FD8 100%);border:1px solid rgba(255,255,255,.12)}
    .pv::after{content:"";position:absolute;inset:0;background:radial-gradient(80% 60% at 30% 40%,rgba(255,255,255,.18),transparent 60%);pointer-events:none}
    .ph{display:grid;place-items:center;height:100%;padding:24px 0}
    .ph dg-phone-screen{scale:.9;transform-origin:center;filter:drop-shadow(0 30px 40px rgba(0,0,0,.25))}
    .txt{position:relative;z-index:1;padding-right:8%}
    .ttl{color:#fff;font-weight:300;font-size:clamp(22px,2.1vw,34px);line-height:1.25;letter-spacing:-.01em;margin-bottom:36px;opacity:0;translate:0 16px;transition:opacity .8s,translate .8s cubic-bezier(.16,1,.3,1)}
    .go .ttl{opacity:1;translate:0 0}
    ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(10px,1.6vw,22px);width:min(100%,280px);margin-left:-4%;margin-bottom:56px}
    li{display:flex;align-items:center;gap:12px;padding:clamp(7px,.8vw,10px) 16px;border-radius:6px;background:#fff;color:#2D9AD7;font-size:clamp(13px,1.1vw,16px);font-weight:500;
      box-shadow:0 6px 16px rgba(0,0,0,.08);opacity:0;translate:-24px 0;transition:opacity .6s,translate .7s cubic-bezier(.16,1,.3,1),box-shadow .3s,scale .3s;transition-delay:calc(.35s + var(--i) * .15s)}
    .go li{opacity:1;translate:0 0}
    li svg{width:20px;height:20px;fill:none;stroke:#2D9AD7;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
    li svg path{stroke-dasharray:14;stroke-dashoffset:14;transition:stroke-dashoffset .5s;transition-delay:calc(.7s + var(--i) * .15s)}
    .go li svg path{stroke-dashoffset:0}
    li.hl{scale:1.05;box-shadow:0 10px 26px rgba(0,0,0,.18);transition-delay:0s}
    li.hl svg{stroke:#fff;background:#A6CE00;border-radius:50%}
    .stores{position:absolute;right:3%;bottom:4%;display:flex;gap:12px;z-index:1}
    .stores a{width:clamp(36px,4vw,50px);aspect-ratio:1;border-radius:8px;background:#fff;display:grid;place-items:center;transition:translate .3s}
    .stores a:hover{translate:0 -3px}
    .stores svg{width:60%;height:60%}
    @media (max-width:640px){
      .pv{aspect-ratio:auto;grid-template-columns:1fr;padding:24px 0 70px}
      .ph{order:2;margin-top:-10px}.ph dg-phone-screen{scale:.8;margin:-50px 0}
      .txt{padding:0 22px}.ul{margin-left:0}ul{margin-left:0;width:100%}
    }
    @media (prefers-reduced-motion: reduce){.ttl,li{opacity:1;translate:none;transition:none}li svg path{stroke-dashoffset:0}}
  `,
})
export class PolluxVisual {
  readonly lang = input('fr');
  protected go = signal(false);
  /** The highlighted feature tag (slowly cycles once the visual is on screen). */
  protected hl = signal(-1);
  protected t = computed(() => this.lang() === 'en'
    ? { title: 'Simplify the management of your survey reports', items: ['Optimise', 'Order', 'Geolocate', 'Stay informed'] }
    : { title: 'Simplifier la gestion de vos rapports d’expertise', items: ['Optimiser', 'Commander', 'Géolocaliser', 'S’informer'] });

  constructor() {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    let timer: ReturnType<typeof setInterval>;
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    afterNextRender(() => {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect(); this.go.set(true);
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setTimeout(() => { timer = setInterval(() => this.hl.update(i => (i + 1) % 4), 1600); }, 1600);
      }, { threshold: 0.35 });
      io.observe(host);
    });
  }
}
