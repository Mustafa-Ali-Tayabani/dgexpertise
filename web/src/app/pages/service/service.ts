import { Component, computed, inject, input, signal } from '@angular/core';
import { LangService } from '../../core/lang.service';
import { pad } from '../../core/links';
import { Header } from '../../shared/header.component';
import { Footer } from '../../shared/footer.component';
import { Cta } from '../../shared/cta.component';
import { DgLink } from '../../shared/dg-link.directive';
import { ImageSlot } from '../../shared/image-slot.component';
import { Band, Faq, Hero, Promises, Steps } from '../../shared/sections';
import { Inspect } from '../../shared/inspect.component';
import { Timeline } from '../../shared/timeline.component';
import { SERVICE_TAG } from '../../shared/icons';
import * as D from '../../data/site-data';
import * as M from '../../data/site-images';
import { ReviewsService } from '../../core/reviews.service';

const H2 = 'margin:0;font-weight:700;font-size:clamp(28px,3.056vw,44px);line-height:1.05;letter-spacing:-0.03em;text-wrap:pretty';

@Component({
  selector: 'dg-service',
  imports: [Header, Footer, Cta, DgLink, ImageSlot, Band, Faq, Hero, Promises, Steps, Inspect, Timeline],
  template: `
@let c = C();
@let s = S();
<div style="width:100%;margin:0 auto;background:#1A1A1A;color:#fff;font-family:Inter,sans-serif;overflow:hidden">
  <dg-hero [height]="820" [mid]="30" [end]="0.94">
    <image-slot slot="bg" [src]="img().hero" [placeholder]="svc().img[lang()]" />
    <dg-header slot="header" active="expertise" [overlay]="true" />
    <div class="r-split r-hero-body" style="position:absolute;left:var(--gx);right:var(--gx);bottom:72px;display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:var(--g64);align-items:end;pointer-events:none">
      <div style="display:flex;flex-direction:column;gap:28px">
        <div style="display:flex;align-items:center;gap:12px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.88);pointer-events:auto"><a dgLink="./Expertise.dc.html" class="hv-green" style="color:rgba(255,255,255,0.88)">{{ c.back }}</a><span class="dg-dot"></span><span>{{ groupLabel() }}</span></div>
        <h1 style="margin:0;font-size:clamp(37px,6.111vw,88px);line-height:0.94;letter-spacing:-0.045em;font-weight:300;text-wrap:pretty">{{ title().a }} <span style="font-weight:700;color:#A6CE00">{{ title().b }}</span><span style="font-weight:700;color:#0075D6">{{ title().mark }}</span></h1>
        <p style="margin:0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.85);max-width:680px;text-wrap:pretty">{{ s.intro[0] }}</p>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;pointer-events:auto">
          <a dgCta [dgLink]="svc().quote">{{ s.ctaLabel }}</a>
          <a href="tel:+41225359364" class="dg-ghost"><span class="dg-ping"></span>{{ c.ctaCall }}</a>
        </div>
      </div>
      @if (s.fact) {
        <div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);color:#1A1A1A;padding:24px;border-radius:12px;display:flex;flex-direction:column;gap:12px;box-shadow:0 24px 60px rgba(0,0,0,0.35)">
          <span style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#0075D6"><span style="width:6px;height:6px;border-radius:50%;background:#A6CE00"></span>{{ c.didYouKnow }}</span>
          <span style="font-size:18px;font-weight:500;line-height:1.4;text-wrap:pretty">{{ s.fact }}</span>
        </div>
      }
    </div>
  </dg-hero>

  @if (s.intro.length > 1) {
    <div class="r-split" style="padding:calc(96px*var(--k)) var(--gx) 0;display:grid;grid-template-columns:380px minmax(0,1fr);gap:var(--g64)">
      <div class="dg-label">{{ groupLabel() }}</div>
      <div style="display:flex;flex-direction:column;gap:20px;max-width:820px">@for (p of s.intro.slice(1); track $index) {<p style="margin:0;font-size:20px;line-height:1.6;color:rgba(255,255,255,0.82);font-weight:300;text-wrap:pretty">{{ p }}</p>}</div>
    </div>
  }

  <dg-promises style="margin:calc(96px*var(--k)) var(--gx) 0" [items]="promises()" />

  @if (entry().group === 'pollutants') {
    <dg-steps style="display:block;margin-top:calc(96px*var(--k))" [half]="true" [sub]="c.stepsSub" [title]="c.stepsTitle" [steps]="c.steps" />
  }

  @for (sec of sections(); track $index) {
    <div style="padding:calc(112px*var(--k)) var(--gx) 0">
      @switch (sec.type) {
        @case ('text') {
          @if (!sec.ps?.length && sec.src) {
            <div style="display:flex;flex-direction:column;gap:40px">
              <h2 [style]="H2 + ';max-width:900px'">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>
              <div style="position:relative;height:clamp(260px,42vw,640px);border-radius:20px;overflow:hidden;background:#fff;border:1px solid rgba(255,255,255,0.12);color:#1A1A1A"><image-slot [src]="sec.src" [placeholder]="sec.img" fit="contain" /></div>
            </div>
          } @else if (sec.src) {
            <div class="feat r-split" [class.flip]="sec.flip" [class.cred]="sec.credential">
              <div class="feat-txt">
                <span class="eyebrow" [class.risk]="sec.health">
                  @if (sec.health) {<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/></svg>{{ lang() === 'fr' ? 'Risque pour la santé' : 'Health risk' }}}
                  @else if (sec.credential) {<svg viewBox="0 0 24 24"><path d="M12 2l3 2.5 3.9.3.3 3.9L22 12l-2.8 3.3-.3 3.9-3.9.3L12 22l-3-2.5-3.9-.3-.3-3.9L2 12l2.8-3.3.3-3.9 3.9-.3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>{{ lang() === 'fr' ? 'Certification' : 'Accreditation' }}}
                  @else {{{ tag() }} · {{ pad(sec.fn) }}}
                </span>
                <h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>
                @if (sec.ps[0]) {<p class="lead">{{ sec.ps[0] }}</p>}
                @if (sec.credential) {
                  <ul class="checks">@for (p of sec.ps.slice(1); track $index) {<li><i><svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg></i>{{ p }}</li>}</ul>
                } @else {
                  @for (p of sec.ps.slice(1); track $index) {<p class="body">{{ p }}</p>}
                }
              </div>
              <figure class="feat-media" [class.graphic]="sec.graphic">
                <div class="frame"><image-slot [src]="sec.src" [placeholder]="sec.img" [fit]="sec.graphic ? 'contain' : 'cover'" /></div>
                @if (sec.img && sec.graphic) {<figcaption>{{ sec.img }}</figcaption>}
              </figure>
            </div>
          } @else {
            <div class="r-split" style="display:grid;grid-template-columns:380px minmax(0,1fr);gap:var(--g64);align-items:start">
              <h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>
              <div style="display:flex;flex-direction:column;gap:20px;max-width:820px">
                @for (p of sec.ps; track $index) {<p style="margin:0;font-size:17px;line-height:1.65;color:rgba(255,255,255,0.78);text-wrap:pretty">{{ p }}</p>}
              </div>
            </div>
          }
        }
        @case ('bullets') {
          <div class="r-split" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--g64);align-items:start">
            <div style="display:flex;flex-direction:column;gap:24px"><h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>@if (sec.intro) {<p style="margin:0;font-size:17px;line-height:1.65;color:rgba(255,255,255,0.78);text-wrap:pretty">{{ sec.intro }}</p>}@if (sec.outro) {<p style="margin:0;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.6);text-wrap:pretty">{{ sec.outro }}</p>}</div>
            @if (sec.longItems) {
              <div style="display:flex;flex-direction:column;gap:14px">
                @for (b of sec.items; track $index) {<div class="lcard"><span>{{ pad($index + 1) }}</span><p>{{ b }}</p></div>}
              </div>
            } @else {
              <div style="display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,0.15)">
                @for (b of sec.items; track $index) {<div style="display:grid;grid-template-columns:48px minmax(0,1fr);gap:16px;padding:22px 0;border-bottom:1px solid rgba(255,255,255,0.15);font-size:16px;line-height:1.5"><span style="color:#A6CE00;font-weight:600">{{ pad($index + 1) }}</span><span style="color:rgba(255,255,255,0.85)">{{ b }}</span></div>}
              </div>
            }
          </div>
        }
        @case ('cards') {
          <div style="display:flex;flex-direction:column;gap:48px">
            <h2 [style]="H2 + ';max-width:820px'">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>
            <div class="r-g4" style="display:grid;gap:16px" [style.grid-template-columns]="'repeat(' + (sec.items.length > 4 ? 4 : sec.items.length) + ',minmax(0,1fr))'">
              @for (cd of sec.items; track $index) {
                <div class="hv-lift" style="display:flex;flex-direction:column;gap:20px;padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);transition:border-color .3s,transform .3s">
                  <span style="font-size:12px;color:#A6CE00;font-weight:600">{{ pad($index + 1) }}</span>
                  <span style="font-weight:600;font-size:22px;letter-spacing:-0.01em;line-height:1.15">{{ cd.h }}</span>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);flex:1;text-wrap:pretty">{{ cd.p }}</p>
                  <a [dgLink]="svc().quote" class="hv-green" style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500;color:#fff"><span style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);display:grid;place-items:center;font-size:12px">→</span>{{ cd.cta }}</a>
                </div>
              }
            </div>
          </div>
        }
        @case ('cantons') {
          <div class="r-split" style="display:grid;gap:var(--g64);align-items:start" [style.grid-template-columns]="sec.few ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)'" [style.row-gap.px]="sec.few ? 24 : null">
            <div style="display:flex;flex-direction:column;gap:24px;max-width:760px"><h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>@if (sec.intro) {<p style="margin:0;font-size:17px;line-height:1.65;color:rgba(255,255,255,0.78);text-wrap:pretty">{{ sec.intro }}</p>}</div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start">
              @for (ct of sec.items; track $index) {<span style="display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:999px;border:1px solid rgba(255,255,255,0.2);font-size:15px"><span style="width:8px;height:8px;border-radius:50%;background:#A6CE00"></span>{{ ct }}</span>}
            </div>
          </div>
        }
        @case ('compare') {
          <div class="cmp r-split">
            <div class="feat-txt"><h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>
              @if (sec.ps?.[0]) {<p class="lead">{{ sec.ps[0] }}</p>}
              @for (p of sec.ps?.slice(1); track $index) {<p class="body">{{ p }}</p>}
            </div>
            <div class="cmp-card" role="table">
              <div class="cmp-row head" role="row">@for (c of sec.cols; track $index) {<span role="columnheader" [class.plus]="$index === 2">{{ c }}</span>}</div>
              @for (r of sec.rows; track $index) {
                <div class="cmp-row" role="row" [style.--i]="$index">
                  <span role="cell">{{ r.label }}</span>
                  <span role="cell" class="mk" [class.yes]="r.a">@if (r.a) {<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg>} @else {<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>}</span>
                  <span role="cell" class="mk" [class.yes]="r.b">@if (r.b) {<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg>}@if (r.note) {<em>{{ r.note }}</em>}</span>
                </div>
              }
            </div>
          </div>
        }
        @case ('tabs') {
          @let tab = sec.tabs[tabIdx()[sec.n] ?? 0];
          <div class="tabs-sec">
            <div class="tabs-head r-split">
              <h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>
              @if (sec.intro) {<p class="body" style="max-width:520px">{{ sec.intro }}</p>}
            </div>
            <div class="tab-bar" role="tablist">
              @for (t of sec.tabs; track $index; let ti = $index) {
                <button role="tab" [class.on]="tab === t" [attr.aria-selected]="tab === t" (click)="setTab(sec.n, ti)"><span class="dot"></span>{{ t.label }}<i>{{ t.items.length }}</i></button>
              }
            </div>
            @for (k of [tab]; track k.label) {
              <div class="tab-panel" role="tabpanel">
                @if (k.intro) {<div class="dg-label" style="margin-bottom:14px">{{ k.intro }}</div>}
                <ol class="tab-list">@for (it of k.items; track $index) {<li [style.--i]="$index"><span>{{ pad($index + 1) }}</span>{{ it }}</li>}</ol>
              </div>
            }
          </div>
        }
        @case ('timeline') {
          <dg-timeline [title]="sec.h" [sub]="sec.sub" [steps]="sec.steps" />
        }
        @case ('inspect') {
          <dg-inspect [title]="sec.h" [sub]="sec.sub" [img]="sec.img" [items]="sec.items" [tag]="sec.tag" [lang]="lang()" />
        }
        @case ('where') {
          <div style="display:flex;flex-direction:column;gap:40px">
            <div class="r-split" style="display:grid;grid-template-columns:minmax(0,1fr) 440px;gap:var(--g64);align-items:end"><h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>@if (sec.sub) {<p style="margin:0;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.7)">{{ sec.sub }}</p>}</div>
            @if (sec.items.length === 1) {
              <div style="position:relative;height:clamp(280px,40vw,560px);border-radius:20px;overflow:hidden;background:#fff;border:1px solid rgba(255,255,255,0.12);color:#1A1A1A"><image-slot [src]="sec.items[0].src" [placeholder]="sec.items[0].label" fit="contain" /></div>
            } @else {
              <div class="where">
                @for (w of sec.items; track $index) {
                  <figure style="margin:0;display:flex;flex-direction:column;gap:12px">
                    <div style="position:relative;aspect-ratio:1;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.12)"><image-slot [src]="w.src" [placeholder]="w.label" /></div>
                    <figcaption style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:500"><span style="width:6px;height:6px;border-radius:50%;background:#A6CE00;flex-shrink:0"></span>{{ w.label }}</figcaption>
                  </figure>
                }
              </div>
            }
          </div>
        }
        @case ('links') {
          <div class="r-split" style="display:grid;grid-template-columns:380px minmax(0,1fr);gap:var(--g64);align-items:start">
            <div style="display:flex;flex-direction:column;gap:16px"><h2 [style]="H2">{{ sec.hA }} <span style="color:#A6CE00">{{ sec.hB }}</span></h2>@if (sec.sub) {<p style="margin:0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.65)">{{ sec.sub }}</p>}</div>
            <div style="display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,0.15)">
              @for (l of sec.items; track $index) {
                <a [dgLink]="l.href" class="rel" style="display:grid;grid-template-columns:minmax(0,1fr) 32px;gap:24px;align-items:center;padding:22px 0;border-bottom:1px solid rgba(255,255,255,0.15);transition:padding-left .3s">
                  <span style="display:flex;flex-direction:column;gap:4px"><span style="font-size:19px;font-weight:500;letter-spacing:-0.01em;line-height:1.3">{{ l.label }}</span>@if (l.sub) {<span style="font-size:14px;color:rgba(255,255,255,0.6)">{{ l.sub }}</span>}</span>
                  <span style="color:#0075D6;font-size:18px;text-align:right">{{ l.href.startsWith('http') ? '↗' : '→' }}</span>
                </a>
              }
            </div>
          </div>
        }
        @case ('faq') {
          <dg-faq [sticky]="true" [title]="sec.h" [items]="sec.items" />
        }
      }
    </div>
  }

  @if (s.related.length) {
    <div class="r-split" style="padding:calc(112px*var(--k)) var(--gx) 0;display:grid;grid-template-columns:380px minmax(0,1fr);gap:var(--g64);align-items:start">
      <div style="display:flex;flex-direction:column;gap:16px"><div class="dg-label">{{ c.relatedTitle }}</div><a dgLink="./Actualites.dc.html" class="dg-clink" style="font-size:15px"><i>→</i>{{ lang() === 'fr' ? 'Toutes les actualités' : 'All news' }}</a></div>
      <div style="display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,0.15)">
        @for (r of s.related; track $index) {<a [dgLink]="r.slug ? '/actualites/' + r.slug : './Actualites.dc.html'" class="rel" style="display:grid;grid-template-columns:56px minmax(0,1fr) 32px;gap:24px;align-items:baseline;padding:22px 0;border-bottom:1px solid rgba(255,255,255,0.15);transition:padding-left .3s"><span style="font-size:13px;color:#A6CE00">{{ pad($index + 1) }}</span><span style="font-size:20px;font-weight:500;letter-spacing:-0.01em;line-height:1.3;text-wrap:pretty">{{ r.title ?? r }}</span><span style="color:#0075D6;font-size:18px;text-align:right">→</span></a>}
      </div>
    </div>
  }

  <dg-band [title]="c.bandTitle" [sub]="c.bandSub" [btn]="c.bandBtn" [href]="svc().quote" [meta]="reviewsMeta()" />

  <div style="margin-top:calc(112px*var(--k))"><dg-footer /></div>
</div>`,
  styles: `
    dg-promises{display:block}
    .lcard{display:grid;grid-template-columns:44px minmax(0,1fr);gap:16px;padding:24px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03)}
    .lcard span{width:36px;height:36px;border-radius:50%;background:rgba(166,206,0,.12);color:#A6CE00;font-weight:700;font-size:13px;display:grid;place-items:center}
    .lcard p{margin:0;font-size:16px;line-height:1.65;color:rgba(255,255,255,.82);text-wrap:pretty}
    .cmp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,640px);gap:var(--g64);align-items:start}
    .cmp-card{border-radius:22px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);overflow:hidden}
    .cmp-row{display:grid;grid-template-columns:minmax(0,1.4fr) 90px minmax(0,1.2fr);gap:12px;align-items:center;padding:16px 22px;border-top:1px solid rgba(255,255,255,.08);font-size:15px;color:rgba(255,255,255,.85)}
    .cmp-row.head{border-top:0;background:rgba(255,255,255,.04);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6)}
    .cmp-row.head .plus{color:#A6CE00}
    .mk{display:flex;align-items:center;gap:10px}
    .mk svg{width:22px;height:22px;flex-shrink:0;fill:none;stroke:#E3262A;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:.8}
    .mk.yes svg{stroke:#1A1A1A;background:#A6CE00;border-radius:50%;padding:4px;opacity:1}
    .mk em{font-style:normal;font-size:13px;color:#A6CE00}
    .cmp-row:not(.head){animation:rowIn .6s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(var(--i) * 60ms)}
    @keyframes rowIn{from{opacity:0;translate:0 10px}}
    .tabs-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--g64);align-items:end;margin-bottom:28px}
    .tab-bar{display:flex;flex-wrap:wrap;gap:8px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.12)}
    .tab-bar button{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:rgba(255,255,255,.8);font:500 15px Inter,sans-serif;cursor:pointer;transition:background .25s,color .25s,border-color .25s}
    .tab-bar button:hover{border-color:#A6CE00}
    .tab-bar button .dot{width:8px;height:8px;border-radius:50%;background:#A6CE00}
    .tab-bar button i{font-style:normal;font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.1)}
    .tab-bar button.on{background:#A6CE00;color:#1A1A1A;border-color:#A6CE00}
    .tab-bar button.on .dot{background:#1A1A1A}
    .tab-bar button.on i{background:rgba(26,26,26,.15)}
    .tab-panel{padding-top:24px;animation:rowIn .45s cubic-bezier(.16,1,.3,1) both}
    .tab-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px}
    .tab-list li{display:grid;grid-template-columns:40px minmax(0,1fr);gap:12px;padding:15px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:16px;line-height:1.5;color:rgba(255,255,255,.85);animation:rowIn .5s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(var(--i) * 25ms)}
    .tab-list li span{color:#A6CE00;font-weight:600;font-size:13px;padding-top:2px}
    @media (max-width:900px){.cmp,.tabs-head{grid-template-columns:minmax(0,1fr)}.tab-list{grid-template-columns:minmax(0,1fr)}.cmp-row{grid-template-columns:minmax(0,1fr) 44px minmax(0,1fr);padding:14px 16px;font-size:14px}}
    .feat{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,520px);gap:var(--g64);align-items:start}
    .feat.flip{grid-template-columns:minmax(0,520px) minmax(0,1fr)}
    .feat.flip .feat-txt{order:2}
    .feat-txt{display:flex;flex-direction:column;gap:22px;max-width:760px}
    .eyebrow{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;border:1px solid rgba(166,206,0,.35);background:rgba(166,206,0,.07);color:#A6CE00;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
    .eyebrow svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .eyebrow.risk{color:#F2C200;border-color:rgba(242,194,0,.4);background:rgba(242,194,0,.08)}
    .lead{margin:0;font-size:19px;line-height:1.6;color:rgba(255,255,255,.9);font-weight:400;text-wrap:pretty}
    .body{margin:0;font-size:16px;line-height:1.7;color:rgba(255,255,255,.68);text-wrap:pretty}
    .checks{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,.12)}
    .checks li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:14px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.12);font-size:16px;line-height:1.6;color:rgba(255,255,255,.8)}
    .checks i{width:24px;height:24px;border-radius:50%;background:#A6CE00;display:grid;place-items:center;margin-top:1px}
    .checks svg{width:13px;height:13px;fill:none;stroke:#1A1A1A;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    .feat-media{margin:0;position:sticky;top:96px;display:flex;flex-direction:column;gap:12px}
    .frame{position:relative;aspect-ratio:4/3;border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:#111}
    .graphic .frame{background:#F5F5F2;border-color:rgba(255,255,255,.2);padding:clamp(20px,3vw,40px);color:#1A1A1A}
    .graphic .frame image-slot{position:relative}
    .cred .graphic .frame{aspect-ratio:1/1;width:100%;max-width:360px;margin-left:auto;border-radius:50%;padding:clamp(28px,4vw,56px);box-shadow:0 0 0 10px rgba(166,206,0,.08),0 0 0 1px rgba(166,206,0,.35)}
    .cred.flip .graphic .frame{margin-left:0;margin-right:auto}
    figcaption{font-size:13px;color:rgba(255,255,255,.5);text-align:center}
    .cred figcaption{display:none}
    .cred .graphic .frame image-slot{filter:contrast(1.15) brightness(1.08)}
    @media (max-width:900px){.feat,.feat.flip{grid-template-columns:minmax(0,1fr)}.feat.flip .feat-txt{order:0}.feat-media{position:static}.cred .graphic .frame,.cred.flip .graphic .frame{max-width:240px;margin:0 auto}}
    .where{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:24px 16px}
    @media (max-width:640px){.where{grid-template-columns:repeat(2,minmax(0,1fr))}}
    .rel:hover{padding-left:12px!important;color:#fff!important}
  `,
})
export class Service {
  /** Supplied via route data. */
  readonly slug = input<string>('amiante');
  protected lang = inject(LangService).lang;
  protected H2 = H2;
  protected pad = pad;

  protected C = computed(() => D.COMMON[this.lang()]);
  private rv = inject(ReviewsService);
  protected reviewsMeta = computed(() => this.lang() === 'en'
    ? `${this.rv.rating().toFixed(1)}/5 on Google · ${this.rv.count()} reviews`
    : `${this.rv.rating().toFixed(1).replace('.', ',')}/5 sur Google · ${this.rv.count()} avis`);
  constructor() { this.rv.load(); }
  protected svc = computed(() => D.SERVICES[this.slug()] || D.SERVICES.amiante);
  protected S = computed(() => this.svc()[this.lang()]);
  protected entry = computed(() => D.SERVICE_LIST.find((x: any) => x.slug === this.slug()) || D.SERVICE_LIST[0]);
  protected img = computed(() => M.SERVICE_IMG[this.slug()] || {});
  protected groupLabel = computed(() => this.C().groups[this.entry().group]);
  protected title = computed(() => M.splitTitle(this.S().title));

  protected tag = computed(() => SERVICE_TAG[this.slug()] ?? '');
  protected tabIdx = signal<Record<number, number | undefined>>({});
  protected setTab(n: number, i: number) { this.tabIdx.update(t => ({ ...t, [n]: i })); }
  /** Pollutant-specific promise ("prélèvement") only where it applies. */
  protected promises = computed(() => {
    const p = [...this.C().promises];
    if (this.entry().group !== 'pollutants') p[1] = this.lang() === 'fr' ? 'Bureau indépendant et spécialisé' : 'Independent, specialised firm';
    return p;
  });
  protected sections = computed(() => {
    let media = 0, feat = 0;
    return this.S().sections.map((sec: any, i: number) => {
      const h = M.splitHead(sec.h), src = (this.img().sec || [])[i] || '';
      const withMedia = sec.type === 'text' && !!src && !!sec.ps?.length;
      const graphic = /logo|badge|asca|illustration|capture|schema|maison|difference|etape|vignette|cover|\.png|\.webp/i.test(src) && !/IMG_|2025\/09\/DIFFERENCE/.test(src);
      // one long paragraph → lead (first sentence or two) + body, so it doesn't read as a wall of text
      let ps = sec.ps;
      if (sec.type === 'text' && ps?.length === 1 && ps[0].length > 320) {
        const sentences = ps[0].match(/[^.!?]+[.!?]+(\s|$)/g) || [ps[0]];
        let lead = '';
        while (sentences.length > 1 && (lead.length < 140 || lead.length + sentences[0].length < 220)) lead += sentences.shift();
        ps = [lead.trim(), sentences.join('').trim()].filter(Boolean);
      }
      return {
        ...sec, ps, hA: h.a, hB: h.b, src, n: i + 1, fn: withMedia ? ++feat : 0,
        flip: withMedia && media++ % 2 === 1,
        longItems: sec.type === 'bullets' && (sec.items || []).every((t: string) => t.length > 160),
        few: sec.type === 'cantons' && (sec.items || []).length <= 2,
        graphic,
        credential: /asca|logo|badge/i.test(src),
        health: /danger|risque|santé|health|risk/i.test(sec.h),
      };
    });
  });
}
