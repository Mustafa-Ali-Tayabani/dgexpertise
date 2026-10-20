import { Component, computed, effect, input, signal } from '@angular/core';

/**
 * Port of the design's <image-slot>: fills its container with a cover-cropped image,
 * or shows the dashed placeholder with a caption when there is no (loadable) image.
 */
@Component({
  selector: 'image-slot',
  host: { '[attr.data-fit]': 'fit()' },
  template: `
    <div class="frame">
      @if (showImg()) {
        <img [src]="src()" [alt]="placeholder()" loading="lazy" (error)="failed.set(true)" [style.object-fit]="fit()" />
      } @else {
        <div class="empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          <div class="cap">{{ placeholder() }}</div>
        </div>
        <div class="ring"></div>
      }
    </div>
  `,
  styles: `
    :host{display:block;position:relative;font:13px/1.3 system-ui,-apple-system,sans-serif;width:100%;height:100%;aspect-ratio:3/2}
    .frame{position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)}
    img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;user-select:none}
    .empty svg{opacity:.45}
    .empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em;opacity:.75}
    .ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed currentColor;opacity:.35}
  `,
})
export class ImageSlot {
  readonly src = input<string | null | undefined>('');
  readonly placeholder = input<string>('Drop an image');
  readonly fit = input<'cover' | 'contain'>('cover');
  protected failed = signal(false);
  protected showImg = computed(() => !!this.src() && !this.failed());

  constructor() {
    effect(() => { this.src(); this.failed.set(false); });
  }
}
