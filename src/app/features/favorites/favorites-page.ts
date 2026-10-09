import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PhotoCard } from '../../shared/ui/photo-card/photo-card';
import { PhotoGrid } from '../../shared/ui/photo-grid/photo-grid';

/** `/favorites` — all saved photos (no pagination). Clicking a photo opens it. */
@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, MatButton, PhotoGrid, PhotoCard, EmptyState],
  templateUrl: './favorites-page.html',
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesStore);
}
