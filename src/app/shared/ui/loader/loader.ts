import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  imports: [MatProgressSpinner],
  template: `
    <mat-progress-spinner mode="indeterminate" [diameter]="40" aria-hidden="true" />
    <span>{{ label() }}</span>
  `,
  styleUrl: './loader.scss',
  host: { role: 'status', 'aria-live': 'polite' },
})
export class Loader {
  readonly label = input('Loading…');
}
