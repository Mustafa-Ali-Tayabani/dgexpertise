import { Directive, HostBinding, HostListener, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { isInternal, toRoute } from '../core/links';

/**
 * <a [dgLink]="href"> — accepts design-style hrefs (./Page.dc.html, tel:, https:, #)
 * and routes internal ones through the Angular router without a full reload.
 */
@Directive({ selector: 'a[dgLink]' })
export class DgLink {
  readonly dgLink = input<string | null | undefined>('#');
  private router = inject(Router);

  @HostBinding('attr.href') get href() { return toRoute(this.dgLink()); }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    const url = this.href;
    if (url === '#') { e.preventDefault(); return; }
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (isInternal(url)) { e.preventDefault(); this.router.navigateByUrl(url); }
  }
}
