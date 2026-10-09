import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { Photo } from '../../core/photos/photo.model';
import { fitWithin, picsumImageUrl, Size } from '../../core/photos/picsum';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';

/** Largest image requested for the full-screen view. */
const MAX_IMAGE_SIZE: Size = { width: 1920, height: 1920 };

/** `/photos/:id` — a single favorite photo, full screen. */
@Component({
  selector: 'app-photo-detail-page',
  imports: [RouterLink, MatButton, MatIcon, EmptyState],
  templateUrl: './photo-detail-page.html',
  styleUrl: './photo-detail-page.scss',
})
export class PhotoDetailPage {
  /** Bound from the `:id` route parameter. */
  readonly id = input.required<string>();

  private readonly favorites = inject(FavoritesStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  /** `undefined` when the id is not among favorites (stale link, removed in another tab, …). */
  protected readonly photo = computed(() => this.favorites.getById(this.id()));
  protected readonly imageSize = computed(() => {
    const photo = this.photo();
    return photo ? fitWithin(photo, MAX_IMAGE_SIZE) : null;
  });
  protected readonly imageUrl = computed(() => {
    const photo = this.photo();
    const size = this.imageSize();
    return photo && size ? picsumImageUrl(photo.id, size) : null;
  });

  /**
   * Removes the photo and returns to the favorites list, since there is nothing left to show here.
   * Navigating first keeps this page from flashing its "not found" state.
   */
  protected async remove(photo: Photo): Promise<void> {
    await this.router.navigate(['/favorites']);
    const removed = this.favorites.remove(photo.id);
    if (!removed) {
      return;
    }
    this.snackBar
      .open('Removed from favorites', 'Undo')
      .onAction()
      .subscribe(() => this.favorites.add(removed.photo, removed.index));
  }
}
