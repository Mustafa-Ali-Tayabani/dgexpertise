/**
 * The design data references pages by their prototype filenames
 * ("./Diagnostic-amiante.dc.html"). Map those to Angular routes.
 */
export function toRoute(href: string | null | undefined): string {
  if (!href) return '#';
  if (/^(https?:|tel:|mailto:|#)/.test(href)) return href;
  if (href.includes('Homepage')) return '/';
  const m = href.match(/^\.?\/?([^?#]+?)\.dc\.html(.*)$/);
  if (m) return '/' + m[1].toLowerCase() + m[2];
  return href;
}

export const isInternal = (url: string) => url.startsWith('/') && !url.startsWith('//');

export const pad = (n: number) => String(n).padStart(2, '0');

export const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
