import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { isActive, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites-store';

/** Sticky app header, shared by every page. Highlights the active section. */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatToolbar, MatButton, MatIcon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly favoritesCount = inject(FavoritesStore).count;

  /** `/photos/:id` shows a favorite, so the Favorites section stays highlighted there. */
  protected readonly onPhotoPage = isActive('/photos', inject(Router), {
    paths: 'subset',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  });
}
