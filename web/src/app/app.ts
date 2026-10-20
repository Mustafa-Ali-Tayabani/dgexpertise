import { Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MotionService } from './core/motion.service';
import { Cursor } from './shared/cursor.component';
import { Booking } from './shared/booking/booking.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Cursor, Booking],
  template: '<router-outlet /><dg-booking /><dg-cursor />',
})
export class App {
  constructor() {
    const motion = inject(MotionService);
    afterNextRender(() => motion.init());
  }
}
