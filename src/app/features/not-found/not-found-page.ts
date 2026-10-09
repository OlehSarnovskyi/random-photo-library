import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { EmptyState } from '../../shared/ui/empty-state/empty-state';

/** Wildcard route target. */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, MatButton, EmptyState],
  template: `
    <app-empty-state
      icon="explore_off"
      heading="Page not found"
      message="The page you are looking for does not exist."
    >
      <a matButton="filled" routerLink="/">Go to photos</a>
    </app-empty-state>
  `,
})
export class NotFoundPage {}
