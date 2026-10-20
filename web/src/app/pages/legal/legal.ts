import { Component, computed, inject, input } from '@angular/core';
import { LangService } from '../../core/lang.service';
import { Header } from '../../shared/header.component';
import { Footer } from '../../shared/footer.component';
import { LEGAL } from '../../data/legal-data';

/** Mentions légales / Protection des données — text ported from the live site. */
@Component({
  selector: 'dg-legal',
  imports: [Header, Footer],
  template: `
@let p = P();
<div style="width:100%;margin:0 auto;background:#1A1A1A;color:#fff;font-family:Inter,sans-serif;overflow:hidden">
  <dg-header active="" />
  <div style="padding:calc(120px*var(--k)) var(--gx) 0;display:flex;flex-direction:column;gap:24px;max-width:1100px">
    <div style="display:flex;align-items:center;gap:12px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.88)"><span class="dg-dot"></span>{{ lang() === 'fr' ? 'Informations légales' : 'Legal information' }}</div>
    <h1 style="margin:0;font-size:clamp(40px,5.556vw,80px);line-height:0.95;letter-spacing:-0.045em;font-weight:300;text-wrap:balance">{{ p.title }}<span style="font-weight:700;color:#0075D6">.</span></h1>
    @if (p.lead) {<p style="margin:0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.8);max-width:720px">{{ p.lead }}</p>}
  </div>
  <div style="padding:calc(80px*var(--k)) var(--gx) 0;display:flex;flex-direction:column">
    @for (s of p.sections; track $index) {
      <section class="r-split" style="display:grid;grid-template-columns:380px minmax(0,1fr);gap:var(--g64);padding:40px 0;border-top:1px solid rgba(255,255,255,0.12)">
        <h2 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-0.02em;line-height:1.25;color:#fff">{{ s.h }}</h2>
        <div style="display:flex;flex-direction:column;gap:14px;max-width:780px">
          @for (t of s.ps; track $index) {<p style="margin:0;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.75);text-wrap:pretty">{{ t }}</p>}
        </div>
      </section>
    }
  </div>
  <div style="margin-top:calc(112px*var(--k))"><dg-footer /></div>
</div>`,
})
export class LegalPage {
  /** 'mentions' | 'privacy' — supplied via route data. */
  readonly doc = input<string>('mentions');
  protected lang = inject(LangService).lang;
  protected P = computed(() => LEGAL[this.doc()][this.lang()]);
}
