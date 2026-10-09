import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { Photo } from '../../core/photos/photo.model';
import { BROWSER_STORAGE } from '../../core/storage/browser-storage';
import { MockIntersectionObserver } from '../../testing/intersection-observer-mock';
import { MemoryStorage } from '../../testing/memory-storage';
import { createPhotos } from '../../testing/photo-fixtures';
import { PhotoStreamStore } from './photo-stream-store';
import { PhotosPage } from './photos-page';

describe('PhotosPage', () => {
  let fixture: ComponentFixture<PhotosPage>;
  let element: HTMLElement;
  let stream: {
    photos: ReturnType<typeof signal<readonly Photo[]>>;
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    loadMore: ReturnType<typeof vi.fn>;
  };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  async function render(initialPhotos: Photo[] = []): Promise<void> {
    stream.photos.set(initialPhotos);
    fixture = TestBed.createComponent(PhotosPage);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function tiles(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll('button.photo-tile'));
  }

  beforeEach(() => {
    MockIntersectionObserver.install();
    stream = {
      photos: signal<readonly Photo[]>([]),
      loading: signal(false),
      error: signal<string | null>(null),
      loadMore: vi.fn(),
    };
    snackBar = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: PhotoStreamStore, useValue: stream },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
      ],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('loads the first batch when the stream is empty', async () => {
    await render();
    expect(stream.loadMore).toHaveBeenCalled();
  });

  it('does not reload a stream that already has photos', async () => {
    await render(createPhotos(3));
    expect(stream.loadMore).not.toHaveBeenCalled();
  });

  it('renders a tile for every photo', async () => {
    await render(createPhotos(6));
    expect(tiles()).toHaveLength(6);
  });

  it('adds a photo to favorites on click instead of opening it', async () => {
    const photos = createPhotos(3);
    await render(photos);

    tiles()[1].click();
    await fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).favorites()).toEqual([photos[1]]);
    expect(snackBar.open).toHaveBeenCalledWith('Added to favorites', 'OK');
    expect(tiles()[1].querySelector('.photo-card__badge')).not.toBeNull();
  });

  it('does not add the same photo twice and tells the user', async () => {
    await render(createPhotos(1));

    tiles()[0].click();
    tiles()[0].click();

    expect(TestBed.inject(FavoritesStore).count()).toBe(1);
    expect(snackBar.open).toHaveBeenLastCalledWith('Already in favorites', 'OK');
  });

  it('shows the loader while a batch is loading', async () => {
    await render(createPhotos(3));
    expect(element.querySelector('app-loader')).toBeNull();

    stream.loading.set(true);
    await fixture.whenStable();

    expect(element.querySelector('app-loader')).not.toBeNull();
  });

  it('loads more photos when the end of the list is reached', async () => {
    await render(createPhotos(3));

    MockIntersectionObserver.latest()?.trigger(true);

    expect(stream.loadMore).toHaveBeenCalledTimes(1);
  });

  it('pauses infinite scroll while loading', async () => {
    await render(createPhotos(3));
    stream.loading.set(true);
    await fixture.whenStable();

    expect(MockIntersectionObserver.latest()).toBeUndefined();
  });

  it('shows an error with a retry button', async () => {
    await render(createPhotos(3));
    stream.error.set('Could not load photos.');
    await fixture.whenStable();

    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Could not load photos.');

    alert?.querySelector('button')?.click();
    expect(stream.loadMore).toHaveBeenCalledTimes(1);
  });
});
