import { Component, input } from '@angular/core';

/** Round social icon buttons used in both footers. `alt` = the homepage's filled Instagram glyph. */
@Component({
  selector: 'dg-social',
  template: `
<div style="display:flex;gap:10px;color:#fff">
  <a href="https://www.facebook.com/dgexpertisech" aria-label="Facebook" class="s hv-social"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"></path></svg></a>
  <a href="https://www.instagram.com/dg_expertise_sa/" aria-label="Instagram" class="s hv-social">
    @if (alt()) {
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.8c2.7 0 3 0 4 .1 2.7.1 3.9 1.4 4 4 .1 1.1.1 1.4.1 4.1s0 3-.1 4c-.1 2.7-1.4 3.9-4 4-1.1.1-1.4.1-4 .1s-3 0-4-.1c-2.7-.1-3.9-1.4-4-4-.1-1.1-.1-1.4-.1-4s0-3 .1-4c.1-2.7 1.4-3.9 4-4 1-.1 1.3-.1 4-.1zM12 2c-2.7 0-3.1 0-4.1.1-3.6.2-5.6 2.2-5.8 5.8C2 8.9 2 9.3 2 12s0 3.1.1 4.1c.2 3.6 2.2 5.6 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.6-.2 5.6-2.2 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.2-3.6-2.2-5.6-5.8-5.8C15.1 2 14.7 2 12 2z"/></svg>
    } @else {
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor"></circle></svg>
    }
  </a>
  <a href="https://www.youtube.com/channel/UCS46ciHJ6JuzE_pIWRVwy5Q" aria-label="YouTube" class="s hv-social"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2c-.3-1-1-1.8-2-2C19.2 4.7 12 4.7 12 4.7s-7.2 0-9 .5c-1 .3-1.7 1-2 2C.5 9 .5 12 .5 12s0 3 .5 4.8c.3 1 1 1.8 2 2 1.8.5 9 .5 9 .5s7.2 0 9-.5c1-.3 1.7-1 2-2 .5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.7 15.3V8.7l6 3.3-6 3.3z"></path></svg></a>
  <a href="https://www.linkedin.com/in/dg-expertise-sa-986302105/" aria-label="LinkedIn" class="s hv-social"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.3-1.9 3.6 0 4.2 2.4 4.2 5.4v6.3zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.4H3.6V9h3.5v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"></path></svg></a>
</div>`,
  styles: `.s{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.25);display:grid;place-items:center;color:inherit;transition:background .3s,border-color .3s,color .3s}`,
})
export class SocialLinks {
  readonly alt = input(false);
}
