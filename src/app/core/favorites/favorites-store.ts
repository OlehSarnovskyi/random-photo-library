import { computed, DestroyRef, DOCUMENT, inject, Injectable, signal } from '@angular/core';

import { isPhoto, Photo } from '../photos/photo.model';
import { BROWSER_STORAGE } from '../storage/browser-storage';

export const FAVORITES_STORAGE_KEY = 'photo-library.favorites';

export interface RemovedFavorite {
  readonly photo: Photo;
  /** Position the photo had in the list, so the removal can be undone in place. */
  readonly index: number;
}

/**
 * Single source of truth for the user's favorites.
 *
 * State lives in a signal and is written through to `localStorage` on every change,
 * so it survives page reloads. Changes made in other tabs are picked up via the
 * `storage` event.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly state = signal<readonly Photo[]>(this.readFromStorage());
  private readonly ids = computed(() => new Set(this.state().map((photo) => photo.id)));

  /** Favorites, most recently added first. */
  readonly favorites = this.state.asReadonly();
  readonly count = computed(() => this.state().length);

  constructor() {
    this.syncAcrossTabs();
  }

  has(id: string): boolean {
    return this.ids().has(id);
  }

  getById(id: string): Photo | undefined {
    return this.state().find((photo) => photo.id === id);
  }

  /**
   * Adds a photo to favorites (at the top by default).
   * @returns `false` if the photo is already a favorite — duplicates are never stored.
   */
  add(photo: Photo, index = 0): boolean {
    if (this.has(photo.id)) {
      return false;
    }
    this.state.update((list) => [...list.slice(0, index), photo, ...list.slice(index)]);
    this.persist();
    return true;
  }

  /** @returns the removed photo and its former position, or `undefined` if it was not a favorite. */
  remove(id: string): RemovedFavorite | undefined {
    const index = this.state().findIndex((photo) => photo.id === id);
    if (index === -1) {
      return undefined;
    }
    const photo = this.state()[index];
    this.state.update((list) => list.filter((_, i) => i !== index));
    this.persist();
    return { photo, index };
  }

  private readFromStorage(): Photo[] {
    try {
      const raw = this.storage?.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      // Stored data is untrusted (manual edits, older app versions): keep only valid, unique photos.
      if (!Array.isArray(parsed)) {
        return [];
      }
      const seen = new Set<string>();
      return parsed.filter(isPhoto).filter(({ id }) => !seen.has(id) && !!seen.add(id));
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      this.storage?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.state()));
    } catch {
      // Storage is full or unavailable: keep working with in-memory state.
    }
  }

  private syncAcrossTabs(): void {
    const window = inject(DOCUMENT).defaultView;
    if (!window) {
      return;
    }
    const onStorage = (event: StorageEvent): void => {
      // `key === null` means the whole storage was cleared.
      if (event.key === FAVORITES_STORAGE_KEY || event.key === null) {
        this.state.set(this.readFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
