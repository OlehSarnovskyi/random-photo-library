import { DestroyRef, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, map, Observable, of, switchMap } from 'rxjs';

import { PhotoApi } from '../../core/photos/photo-api';
import { Photo } from '../../core/photos/photo.model';
import { randomInt, shuffle } from '../../shared/utils/random';

export interface PhotoStreamConfig {
  /** Number of photos requested per batch. */
  readonly pageSize: number;
  /**
   * Rough lower bound of the Picsum catalog size (it has ~1000 photos). Used only to pick a
   * random starting page; running past the real end of the catalog simply wraps around.
   */
  readonly estimatedCatalogSize: number;
}

export const PHOTO_STREAM_CONFIG = new InjectionToken<PhotoStreamConfig>('PHOTO_STREAM_CONFIG', {
  providedIn: 'root',
  factory: () => ({ pageSize: 24, estimatedCatalogSize: 900 }),
});

const FIRST_PAGE = 1;

interface Batch {
  readonly page: number;
  readonly photos: Photo[];
}

/**
 * State of the endless random photostream.
 *
 * Provided in root on purpose: photos that were already loaded survive navigation to
 * Favorites and back, so the user does not lose their place in the stream.
 */
@Injectable({ providedIn: 'root' })
export class PhotoStreamStore {
  private readonly api = inject(PhotoApi);
  private readonly config = inject(PHOTO_STREAM_CONFIG);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _photos = signal<readonly Photo[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly photos = this._photos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Start at a random page so every session gets a different stream. */
  private nextPage = randomInt(
    FIRST_PAGE,
    Math.max(FIRST_PAGE, Math.floor(this.config.estimatedCatalogSize / this.config.pageSize)),
  );

  /**
   * Loads the next batch and appends it to the stream.
   * Calls made while a batch is in flight are ignored, so fast scrolling cannot fire
   * duplicate requests.
   */
  loadMore(): void {
    if (this._loading()) {
      return;
    }
    this._loading.set(true);
    this._error.set(null);

    this.fetchNextBatch()
      .pipe(
        finalize(() => this._loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ page, photos }) => {
          if (photos.length === 0) {
            // Even the first page is empty: stop instead of re-requesting forever.
            this._error.set('No photos are available right now.');
            return;
          }
          this.nextPage = page + 1;
          this._photos.update((current) => [...current, ...shuffle(photos)]);
        },
        error: () => this._error.set('Could not load photos. Check your connection and try again.'),
      });
  }

  /** Requests the next catalog page, wrapping around to the first page past the end. */
  private fetchNextBatch(): Observable<Batch> {
    const page = this.nextPage;
    return this.api
      .getPage(page, this.config.pageSize)
      .pipe(
        switchMap((photos) =>
          photos.length > 0 || page === FIRST_PAGE
            ? of({ page, photos })
            : this.api
                .getPage(FIRST_PAGE, this.config.pageSize)
                .pipe(map((firstPage) => ({ page: FIRST_PAGE, photos: firstPage }))),
        ),
      );
  }
}
