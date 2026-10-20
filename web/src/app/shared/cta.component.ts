import { Component } from '@angular/core';

/** Green pill CTA with the looping arrow and shine sweep: <a dgCta [dgLink]="url">Label</a> */
@Component({
  selector: 'a[dgCta]',
  host: { class: 'dg-cta' },
  template: `<span class="dg-cta-label"><ng-content /></span><span class="dg-cta-arrow"><span>→</span></span><span class="dg-cta-shine"></span>`,
})
export class Cta {}
