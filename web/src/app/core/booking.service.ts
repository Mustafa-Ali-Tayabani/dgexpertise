import { Injectable, signal } from '@angular/core';

/** Opens the "Prendre rendez-vous" booking panel from anywhere (optionally pre-selecting a service). */
@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly isOpen = signal(false);
  readonly prefill = signal<string | null>(null);

  open(service?: string | null) {
    this.prefill.set(service ?? null);
    this.isOpen.set(true);
  }

  close() { this.isOpen.set(false); }
}
