import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/** Centered icon + message used for empty lists and "not found" states. Actions are projected. */
@Component({
  selector: 'app-empty-state',
  imports: [MatIcon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input('');
}
