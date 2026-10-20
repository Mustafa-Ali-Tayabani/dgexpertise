import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Line icons for DG Expertise services and info pages (32×32, stroke = currentColor).
 * Used by the mega menu and the cursor; strokes draw in when an icon appears (.ic-draw).
 */
export const ICONS: Record<string, string> = {
  // services
  amiante: '<path d="M5 25C11 19 15 13 19 6"/><path d="M8 27C14 21 18 15 22 8"/><path d="M11 28c5-5 9-11 13-18"/><path d="M19 6l2-1M22 8l2-1.5M24 10l2-1"/><circle cx="25" cy="24" r="1.2"/><circle cx="21" cy="27" r=".9"/>',
  plomb: '<rect x="5" y="5" width="22" height="22" rx="3"/><text x="16.5" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none" font-family="Inter,sans-serif">Pb</text><text x="8.5" y="11.5" font-size="5" font-weight="600" fill="currentColor" stroke="none" font-family="Inter,sans-serif">82</text>',
  pcb: '<path d="M14.5 16L12 20.33H7L4.5 16L7 11.67H12Z"/><path d="M27.5 16L25 20.33H20L17.5 16L20 11.67H25Z"/><path d="M14.5 16h3M12 11.67V9M25 11.67V9"/><circle cx="12" cy="7.6" r="1.4"/><circle cx="25" cy="7.6" r="1.4"/>',
  hap: '<path d="M7.34 11l4.33 2.5v5L7.34 21 3 18.5v-5z"/><path d="M16 11l4.33 2.5v5L16 21l-4.33-2.5v-5z"/><path d="M24.66 11L29 13.5v5L24.66 21l-4.33-2.5v-5z"/>',
  hbcd: '<path d="M5 11l11-5 11 5v12l-11 5-11-5z"/><path d="M5 11l11 5 11-5M16 16v12"/><circle cx="10" cy="17" r="1"/><circle cx="12" cy="21.5" r=".8"/><circle cx="21" cy="18" r="1"/><circle cx="23" cy="22.5" r=".8"/>',
  suivi: '<path d="M7 22a9 9 0 0 1 18 0"/><path d="M13 13.5V10h6v3.5"/><path d="M4 22h24v2.5H4z"/><path d="M16 10v-2"/>',
  air: '<path d="M4 12h14a3.5 3.5 0 1 0-3.5-3.5"/><path d="M4 17h20a3.5 3.5 0 1 1-3.5 3.5"/><path d="M4 22h9"/>',
  cecb: '<rect x="5" y="5" width="9" height="3.2" rx="1" fill="#2E9E48" stroke="none"/><rect x="5" y="10" width="12" height="3.2" rx="1" fill="#A6CE00" stroke="none"/><rect x="5" y="15" width="15" height="3.2" rx="1" fill="#F2C200" stroke="none"/><rect x="5" y="20" width="18" height="3.2" rx="1" fill="#EE7D21" stroke="none"/><rect x="5" y="25" width="21" height="3.2" rx="1" fill="#E3262A" stroke="none"/>',
  dechets: '<path d="M26 16a10 10 0 0 1-17.3 6.8"/><path d="M6 16A10 10 0 0 1 23.3 9.2"/><path d="M23.5 4.5v5h-5"/><path d="M8.5 27.5v-5h5"/>',
  energies: '<circle cx="23" cy="8" r="3"/><path d="M23 2.5v.5M28.5 8H28M27 4l-.5.5"/><path d="M4 27l3-12h17l3 12z"/><path d="M5.5 21h20M11.5 15l-1.5 12M18.5 15l1 12"/>',
  // pages
  expertise: '<circle cx="14" cy="14" r="8"/><path d="M20 20l7 7"/><path d="M10.5 14h7M14 10.5v7"/>',
  about: '<circle cx="12" cy="11" r="4"/><path d="M4 26c1-5 4-7 8-7s7 2 8 7"/><circle cx="22.5" cy="12" r="3"/><path d="M21.5 19c3.5 0 5.5 2 6.5 6"/>',
  references: '<path d="M16 4l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8L16 22.4l-7.2 3.8 1.4-8-5.9-5.7 8.1-1.1z"/>',
  formations: '<path d="M3 12l13-6 13 6-13 6z"/><path d="M9 15v6c3 2.5 11 2.5 14 0v-6"/><path d="M29 12v7"/>',
  bibliotheque: '<path d="M5 6h8a3 3 0 0 1 3 3v17a2.5 2.5 0 0 0-2.5-2.5H5z"/><path d="M27 6h-8a3 3 0 0 0-3 3v17a2.5 2.5 0 0 1 2.5-2.5H27z"/>',
  laboratoires: '<path d="M12 4h8M13.5 4v8L6 25a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 26 25l-7.5-13V4"/><path d="M9.5 19h13"/>',
  article: '<path d="M7 4h13l5 5v19H7z"/><path d="M20 4v5h5M11 15h10M11 19h10M11 23h6"/>',
  quote: '<path d="M6 6h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H15l-5 5v-5H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M10 12h12M10 16h8"/>',
  pin: '<path d="M16 29s-9-8.2-9-15a9 9 0 1 1 18 0c0 6.8-9 15-9 15z"/><circle cx="16" cy="14" r="3.2"/>',
  search: '<circle cx="14" cy="14" r="8.5"/><path d="M20.5 20.5L28 28"/>',
  mail: '<rect x="4" y="7" width="24" height="18" rx="3"/><path d="M5 9l11 8 11-8"/>',
  report: '<path d="M8 4h11l6 6v18H8z"/><path d="M19 4v6h6M12 17h9M12 21h6"/>',
  check: '<circle cx="16" cy="16" r="12"/><path d="M10.5 16.5l4 4 7-8"/>',
  eye: '<path d="M3 16s5-9 13-9 13 9 13 9-5 9-13 9S3 16 3 16z"/><circle cx="16" cy="16" r="4"/>',
  shield: '<path d="M16 3l11 4v8c0 7-4.7 11.6-11 14-6.3-2.4-11-7-11-14V7z"/><path d="M11.5 16l3 3 6-6.5"/>',
  calendar: '<rect x="5" y="7" width="22" height="20" rx="3"/><path d="M5 13h22M11 4v6M21 4v6"/><circle cx="16" cy="20" r="2.2"/>',
};

/** Short tag shown in the cursor's scan lens on each service page. */
export const SERVICE_TAG: Record<string, string> = {
  amiante: 'Amiante', plomb: 'Pb', pcb: 'PCB', hap: 'HAP', hbcd: 'HBCD', suivi: 'Chantier', air: 'VDI 3492', cecb: 'CECB', dechets: 'Déchets', energies: 'Énergie',
};

/** Route path → icon key (services + info pages). */
export const ROUTE_ICON: Record<string, string> = {
  '/diagnostic-amiante': 'amiante', '/diagnostic-plomb': 'plomb', '/diagnostic-pcb': 'pcb', '/diagnostic-hap': 'hap', '/diagnostic-hbcd': 'hbcd',
  '/suivi-de-chantier': 'suivi', '/mesures-d-air': 'air', '/certificat-cecb': 'cecb', '/gestion-des-dechets': 'dechets', '/energies-renouvelables': 'energies',
  '/expertise': 'expertise', '/qui-sommes-nous': 'about', '/references': 'references', '/formations-polluants': 'formations',
  '/bibliotheque-des-polluants': 'bibliotheque', '/laboratoires-partenaires': 'laboratoires',
};

export const iconSvg = (name: string, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ICONS['expertise']}</svg>`;

@Component({
  selector: 'dg-icon',
  template: '',
  host: { '[innerHTML]': 'svg()', style: 'display:inline-grid;place-items:center' },
})
export class Icon {
  readonly name = input.required<string>();
  readonly draw = input(false);
  private s = inject(DomSanitizer);
  protected svg = computed(() => this.s.bypassSecurityTrustHtml(iconSvg(this.name(), this.draw() ? 'ic-draw' : '')));
}
