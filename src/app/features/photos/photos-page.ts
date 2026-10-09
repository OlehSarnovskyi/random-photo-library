import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { Photo } from '../../core/photos/photo.model';
import { InfiniteScroll } from '../../shared/directives/infinite-scroll';
import { Loader } from '../../shared/ui/loader/loader';
import { PhotoCard } from '../../shared/ui/photo-card/photo-card';
import { PhotoGrid } from '../../shared/ui/photo-grid/photo-grid';
import { PhotoStreamStore } from './photo-stream-store';

/** `/` — endless random photostream. Clicking a photo saves it to favorites. */
@Component({
  selector: 'app-photos-page',
  imports: [PhotoGrid, PhotoCard, Loader, InfiniteScroll, MatButton, MatIcon],
  templateUrl: './photos-page.html',
  styleUrl: './photos-page.scss',
})
export class PhotosPage implements OnInit {
  protected readonly stream = inject(PhotoStreamStore);
  protected readonly favorites = inject(FavoritesStore);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    if (this.stream.photos().length === 0) {
      this.stream.loadMore();
    }
  }

  protected addToFavorites(photo: Photo): void {
    const added = this.favorites.add(photo);
    this.snackBar.open(added ? 'Added to favorites' : 'Already in favorites', 'OK');
  }
}
