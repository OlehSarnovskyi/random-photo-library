import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { BROWSER_STORAGE } from '../../core/storage/browser-storage';
import { MemoryStorage } from '../../testing/memory-storage';
import { createPhoto } from '../../testing/photo-fixtures';
import { PhotoDetailPage } from './photo-detail-page';

@Component({ template: 'favorites list' })
class FavoritesStub {}

describe('PhotoDetailPage', () => {
  let harness: RouterTestingHarness;
  let favorites: FavoritesStore;
  let snackBarAction: Subject<void>;
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    snackBarAction = new Subject<void>();
    snackBar = { open: vi.fn(() => ({ onAction: () => snackBarAction })) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'photos/:id', component: PhotoDetailPage },
            { path: 'favorites', component: FavoritesStub },
          ],
          withComponentInputBinding(),
        ),
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    favorites = TestBed.inject(FavoritesStore);
    harness = await RouterTestingHarness.create();
  });

  function element(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  function removeButton(): HTMLButtonElement | undefined {
    return Array.from(element().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Remove from favorites'),
    );
  }

  it('shows the favorite photo in full size', async () => {
    favorites.add(createPhoto('42', { author: 'Jane Doe', width: 5000, height: 3333 }));

    await harness.navigateByUrl('/photos/42', PhotoDetailPage);
    const img = element().querySelector('img');

    expect(img?.getAttribute('src')).toBe('https://picsum.photos/id/42/1920/1280');
    expect(img?.getAttribute('alt')).toBe('Photo by Jane Doe');
    expect(removeButton()).toBeDefined();
  });

  it('shows a "not found" state for a photo that is not a favorite', async () => {
    await harness.navigateByUrl('/photos/does-not-exist', PhotoDetailPage);

    expect(element().textContent).toContain('Photo not found');
    expect(element().querySelector('img')).toBeNull();
    expect(element().querySelector('a')?.getAttribute('href')).toBe('/favorites');
  });

  it('removes the photo and returns to favorites', async () => {
    favorites.add(createPhoto('42'));
    await harness.navigateByUrl('/photos/42', PhotoDetailPage);

    removeButton()?.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/favorites');
    expect(favorites.has('42')).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('Removed from favorites', 'Undo');
  });

  it('restores the photo at its original position on undo', async () => {
    favorites.add(createPhoto('1'));
    favorites.add(createPhoto('2'));
    favorites.add(createPhoto('3'));
    await harness.navigateByUrl('/photos/2', PhotoDetailPage);

    removeButton()?.click();
    await harness.fixture.whenStable();
    snackBarAction.next();

    expect(favorites.favorites().map((p) => p.id)).toEqual(['3', '2', '1']);
  });
});
