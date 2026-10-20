import { Component, computed, inject } from '@angular/core';
import { LangService } from '../core/lang.service';
import { DgLink } from './dg-link.directive';
import { SocialLinks } from './social-links.component';
import * as D from '../data/site-data';

@Component({
  selector: 'dg-footer',
  imports: [DgLink, SocialLinks],
  template: `
<div style="background:#1A1A1A;color:rgba(255,255,255,0.7);font-family:Inter,sans-serif;padding:calc(96px*var(--k)) var(--gx) 40px;display:flex;flex-direction:column;gap:var(--g64);border-top:1px solid rgba(255,255,255,0.12);font-size:14px;line-height:1.5">
  <div class="r-footer" style="display:grid;grid-template-columns:200px minmax(0,1fr) 340px 220px;gap:48px">
    <div><img src="/assets/logo-wordmark.png" alt="DG Expertise" style="height:18px;width:auto"></div>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="dg-label">{{ f().addresses }}</div>
      <div class="r-g2s" style="display:grid;grid-template-columns:1fr 1fr;gap:28px 32px">
        @for (o of f().offices; track o.city) {
          <div style="display:flex;flex-direction:column;gap:4px"><span style="font-weight:600;color:#fff">{{ o.city }}</span><span>{{ o.addr }}</span><a [href]="'tel:' + o.dial" class="hv-green" style="color:inherit;text-decoration:none">{{ o.tel }}</a></div>
        }
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="dg-label">{{ f().hours }}</div>
      <p style="margin:0">{{ f().h1 }}</p>
      <p style="margin:0">{{ f().h2 }}</p>
      <div style="display:flex;flex-direction:column;gap:4px;color:#fff"><a href="tel:+41225359364" class="hv-green" style="color:inherit;text-decoration:none">+41 (0)22 535 93 64</a><a href="mailto:contact@dgexpertise.ch" class="hv-green" style="color:inherit;text-decoration:none">contact&#64;dgexpertise.ch</a></div>
      <dg-social />
    </div>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="dg-label">{{ f().legal }}</div>
      <div style="display:flex;flex-direction:column;gap:10px;color:#fff"><a dgLink="/mentions-legales" class="hv-green" style="color:inherit;text-decoration:none">{{ f().notice }}</a><a dgLink="/protection-des-donnees" class="hv-green" style="color:inherit;text-decoration:none">{{ f().data }}</a></div>
    </div>
  </div>
  <div class="r-wrap" style="display:flex;justify-content:space-between;align-items:center;gap:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.12);font-size:12px;color:rgba(255,255,255,0.5)">
    <span>© 2026 DG Expertise SA</span>
    <div class="r-wrap" style="display:flex;gap:24px">
      @for (l of links(); track l.href) {<a [dgLink]="l.href" class="hv-white" style="color:inherit;text-decoration:none">{{ l.label }}</a>}
    </div>
  </div>
</div>`,
})
export class Footer {
  private lang = inject(LangService).lang;
  protected f = computed(() => D.COMMON[this.lang()].footer);
  protected links = computed(() => D.NAV.map((n: any) => ({ href: n.href, label: n.label[this.lang()] })));
}
