import { Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LangService } from '../../core/lang.service';
import { BookingService } from '../../core/booking.service';
import { MotionService } from '../../core/motion.service';
import { sendForm } from '../../core/form-sender';
import { DgLink } from '../dg-link.directive';
import * as D from '../../data/site-data';

type Mode = 'site' | 'call' | 'office';
const SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const CANTONS = ['Genève', 'Vaud', 'Valais', 'Fribourg', 'Neuchâtel'];

const T = {
  fr: {
    title: 'Prendre rendez-vous', close: 'Fermer', back: 'Retour', next: 'Continuer', send: 'Envoyer la demande', sending: 'Envoi…',
    steps: ['Besoin', 'Lieu', 'Créneau', 'Coordonnées'],
    s0h: 'De quoi avez-vous besoin ?', s0p: 'Choisissez une ou plusieurs prestations — nous regroupons les diagnostics en une seule visite.',
    advice: 'Je ne sais pas encore — conseil', modeH: 'Type de rendez-vous',
    modes: { site: ['Visite sur site', "Nos experts se déplacent dans toute la Suisse romande."], call: ['Appel ou visio', 'Un premier échange de 15 minutes, sans engagement.'], office: ['À nos bureaux', 'Genève, Vaud, Fribourg ou Neuchâtel.'] },
    s1h: 'Où se situe le bâtiment ?', canton: 'Canton', address: 'Adresse du bien', addressPh: 'Rue, numéro, NPA, localité', addressOpt: 'Adresse (facultatif)',
    building: 'Type de bâtiment', buildings: ['Appartement', 'Villa', 'Immeuble', 'Bureaux / commerce', 'Industriel', 'Bâtiment public'],
    year: 'Année de construction', years: ['Avant 1991', '1991 – 2005', 'Après 2005', 'Je ne sais pas'],
    s2h: 'Quand vous conviendrait-il ?', s2p: 'Lundi au vendredi, 8h–12h et 13h–17h. Nous confirmons le créneau sous 24h ouvrées.',
    slot: 'Heure souhaitée', flex: 'Indifférent', pick: 'Choisissez une date',
    s3h: 'Vos coordonnées', name: 'Nom et prénom', company: 'Entreprise / régie (facultatif)', email: 'E-mail', phone: 'Téléphone', message: 'Message (facultatif)', messagePh: 'Travaux prévus, accès, délais…',
    consent: "J'accepte que mes données soient utilisées pour traiter ma demande", privacy: 'Protection des données',
    summary: 'Récapitulatif', okH: 'Demande envoyée', okP: 'Merci ! Un expert DG Expertise vous recontacte sous 24h ouvrées pour confirmer votre rendez-vous.',
    mailH: 'Presque terminé', mailP: "Votre messagerie s'est ouverte avec la demande pré-remplie — il ne reste qu'à l'envoyer. Vous pouvez aussi nous appeler au 022 535 93 64.",
    ics: 'Ajouter à mon agenda', done: 'Fermer', again: 'Nouvelle demande', error: "L'envoi a échoué. Réessayez ou appelez-nous au 022 535 93 64.",
    days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], tbc: 'à confirmer',
  },
  en: {
    title: 'Schedule a meeting', close: 'Close', back: 'Back', next: 'Continue', send: 'Send request', sending: 'Sending…',
    steps: ['Need', 'Location', 'Time', 'Details'],
    s0h: 'What do you need?', s0p: 'Pick one or more services — we combine surveys into a single visit.',
    advice: 'Not sure yet — advice', modeH: 'Meeting type',
    modes: { site: ['On-site visit', 'Our experts travel across French-speaking Switzerland.'], call: ['Call or video', 'A free 15-minute first conversation.'], office: ['At our offices', 'Geneva, Vaud, Fribourg or Neuchâtel.'] },
    s1h: 'Where is the building?', canton: 'Canton', address: 'Property address', addressPh: 'Street, number, postcode, town', addressOpt: 'Address (optional)',
    building: 'Building type', buildings: ['Apartment', 'House', 'Apartment block', 'Office / retail', 'Industrial', 'Public building'],
    year: 'Year of construction', years: ['Before 1991', '1991 – 2005', 'After 2005', "I don't know"],
    s2h: 'When would suit you?', s2p: 'Monday to Friday, 8am–12pm and 1pm–5pm. We confirm the slot within 24 working hours.',
    slot: 'Preferred time', flex: 'Any time', pick: 'Pick a date',
    s3h: 'Your details', name: 'Full name', company: 'Company / agency (optional)', email: 'Email', phone: 'Phone', message: 'Message (optional)', messagePh: 'Planned works, access, deadlines…',
    consent: 'I agree that my data is used to handle my request', privacy: 'Data protection',
    summary: 'Summary', okH: 'Request sent', okP: 'Thank you! A DG Expertise expert will get back to you within 24 working hours to confirm your meeting.',
    mailH: 'Almost done', mailP: 'Your email app has opened with the request pre-filled — just hit send. You can also call us on 022 535 93 64.',
    ics: 'Add to my calendar', done: 'Close', again: 'New request', error: 'Sending failed. Please try again or call us on 022 535 93 64.',
    days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], tbc: 'to be confirmed',
  },
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'dg-booking',
  imports: [DgLink],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class Booking {
  protected bk = inject(BookingService);
  private motion = inject(MotionService);
  private router = inject(Router);
  protected lang = inject(LangService).lang;
  protected t = computed(() => T[this.lang()]);
  private panel = viewChild<ElementRef<HTMLElement>>('panel');

  // flow
  protected step = signal(0);
  protected dir = signal<1 | -1>(1);
  protected result = signal<'none' | 'sent' | 'mail'>('none');
  protected sending = signal(false);
  protected error = signal(false);

  // answers
  protected services = signal<string[]>([]);
  protected mode = signal<Mode>('site');
  protected canton = signal('');
  protected address = signal('');
  protected building = signal(-1);
  protected year = signal(-1);
  protected date = signal('');
  protected slot = signal('');
  protected name = signal('');
  protected company = signal('');
  protected email = signal('');
  protected phone = signal('');
  protected message = signal('');
  protected consent = signal(false);

  protected slots = SLOTS;
  protected cantons = CANTONS;
  protected modes: Mode[] = ['site', 'call', 'office'];

  protected serviceOptions = computed(() => [
    ...D.SERVICE_LIST.map((s: any) => ({ id: s.slug, label: D.SERVICES[s.slug].nav[this.lang()] })),
    { id: 'conseil', label: this.t().advice },
  ]);

  // ── calendar ──
  private earliest = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6); return d; })();
  private latest = (() => { const d = new Date(this.earliest); d.setDate(d.getDate() + 60); return d; })();
  protected month = signal(new Date(this.earliest.getFullYear(), this.earliest.getMonth(), 1));
  protected monthLabel = computed(() => this.month().toLocaleDateString(this.lang() === 'en' ? 'en-GB' : 'fr-CH', { month: 'long', year: 'numeric' }));
  protected canPrev = computed(() => this.month() > new Date(this.earliest.getFullYear(), this.earliest.getMonth(), 1));
  protected canNext = computed(() => new Date(this.month().getFullYear(), this.month().getMonth() + 1, 1) <= this.latest);
  protected days = computed(() => {
    const m = this.month(), first = new Date(m.getFullYear(), m.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7, count = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const cells: { iso: string; n: number; ok: boolean }[] = [];
    for (let i = 0; i < lead; i++) cells.push({ iso: '', n: 0, ok: false });
    for (let n = 1; n <= count; n++) {
      const d = new Date(m.getFullYear(), m.getMonth(), n), wd = d.getDay();
      cells.push({ iso: iso(d), n, ok: wd !== 0 && wd !== 6 && d >= this.earliest && d <= this.latest });
    }
    return cells;
  });
  protected moveMonth(k: number) { const m = this.month(); this.month.set(new Date(m.getFullYear(), m.getMonth() + k, 1)); }
  protected dateLabel = computed(() => this.date() ? new Date(this.date() + 'T12:00:00').toLocaleDateString(this.lang() === 'en' ? 'en-GB' : 'fr-CH', { weekday: 'long', day: 'numeric', month: 'long' }) : '');

  // ── validation ──
  private emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email().trim()));
  protected valid = computed(() => [
    this.services().length > 0,
    !!this.canton() && this.building() >= 0 && (this.mode() !== 'site' || this.address().trim().length > 4),
    !!this.date() && !!this.slot(),
    this.name().trim().length > 1 && this.emailOk() && this.phone().replace(/\D/g, '').length >= 9 && this.consent(),
  ][this.step()]);

  protected summary = computed(() => {
    const t = this.t(), opts = this.serviceOptions();
    return [
      [t.steps[0], this.services().map(id => opts.find(o => o.id === id)?.label).join(', ')],
      [t.modeH, t.modes[this.mode()][0]],
      [t.steps[1], [this.address(), this.canton()].filter(Boolean).join(', ') + (this.building() >= 0 ? ` · ${t.buildings[this.building()]}` : '') + (this.year() >= 0 ? ` · ${t.years[this.year()]}` : '')],
      [t.steps[2], `${this.dateLabel()} · ${this.slot() === 'flex' ? t.flex : this.slot()} (${t.tbc})`],
    ];
  });

  constructor() {
    effect(() => {
      const open = this.bk.isOpen();
      document.body.style.overflow = open ? 'hidden' : '';
      this.motion.lock(open);
      if (open) {
        const pre = this.bk.prefill();
        if (pre && this.result() === 'none' && !this.services().length) this.services.set([pre]);
        setTimeout(() => this.panel()?.nativeElement.focus(), 50);
      }
    });
    // deep link: any URL with ?rdv (optionally ?rdv=<service slug>) opens the panel
    this.router.events.subscribe(e => {
      if (!(e instanceof NavigationEnd)) return;
      const q = this.router.parseUrl(e.urlAfterRedirects).queryParams['rdv'];
      if (q !== undefined) this.bk.open(D.SERVICES[q] ? q : null);
    });
  }

  @HostListener('document:keydown.escape') onEsc() { if (this.bk.isOpen()) this.bk.close(); }

  protected toggleService(id: string) { this.services.update(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  protected go(k: 1 | -1) {
    if (k === 1 && !this.valid()) return;
    this.dir.set(k); this.step.update(s => Math.max(0, Math.min(3, s + k)));
    this.panel()?.nativeElement.querySelector('.body')?.scrollTo({ top: 0 });
  }
  protected jump(i: number) { if (i < this.step()) { this.dir.set(-1); this.step.set(i); } }

  protected async submit() {
    if (!this.valid() || this.sending()) return;
    this.error.set(false);
    const t = T.fr;
    const data: Record<string, string> = {
      _subject: `Demande de rendez-vous — ${this.name().trim()}`,
      _replyto: this.email().trim(),
      Prestations: this.services().map(id => (id === 'conseil' ? t.advice : D.SERVICES[id].nav.fr)).join(', '),
      'Type de rendez-vous': t.modes[this.mode()][0],
      Canton: this.canton(), Adresse: this.address().trim(),
      'Type de bâtiment': this.building() >= 0 ? t.buildings[this.building()] : '',
      'Année de construction': this.year() >= 0 ? t.years[this.year()] : '',
      Date: this.date(), Heure: this.slot() === 'flex' ? t.flex : this.slot(),
      Nom: this.name().trim(), Entreprise: this.company().trim(), 'E-mail': this.email().trim(), Téléphone: this.phone().trim(),
      Message: this.message().trim(), Langue: this.lang(),
    };
    this.sending.set(true);
    try {
      const { _subject, _replyto, ...fields } = data;
      this.result.set(await sendForm(_subject, fields, _replyto));
    } catch { this.error.set(true); }
    this.sending.set(false);
  }

  /** Tentative calendar entry for the requested slot. */
  protected icsHref = computed(() => {
    if (!this.date()) return '';
    const [h, m] = (this.slot() === 'flex' ? '09:00' : this.slot()).split(':');
    const d = this.date().replace(/-/g, ''), start = `${d}T${h}${m}00`, end = `${d}T${String(+h + 1).padStart(2, '0')}${m}00`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DG Expertise//RDV//FR', 'BEGIN:VEVENT', `UID:${Date.now()}@dgexpertise.ch`,
      `DTSTART;TZID=Europe/Zurich:${start}`, `DTEND;TZID=Europe/Zurich:${end}`, `SUMMARY:DG Expertise — ${this.t().title} (${this.t().tbc})`,
      `LOCATION:${[this.address(), this.canton()].filter(Boolean).join(', ')}`, 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  });

  protected reset() {
    this.step.set(0); this.result.set('none'); this.services.set([]); this.date.set(''); this.slot.set(''); this.message.set(''); this.consent.set(false); this.error.set(false);
  }
  protected finish() { this.bk.close(); setTimeout(() => this.reset(), 500); }
}
