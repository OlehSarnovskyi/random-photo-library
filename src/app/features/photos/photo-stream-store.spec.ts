import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';

import { PhotoApi } from '../../core/photos/photo-api';
import { Photo } from '../../core/photos/photo.model';
import { createPhotos } from '../../testing/photo-fixtures';
import { PHOTO_STREAM_CONFIG, PhotoStreamStore } from './photo-stream-store';

describe('PhotoStreamStore', () => {
  let getPage: ReturnType<typeof vi.fn<(page: number, limit: number) => Observable<Photo[]>>>;

  function createStore(): PhotoStreamStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: PhotoApi, useValue: { getPage } },
        // A catalog-size hint of one page makes the random start page deterministic (page 1).
        { provide: PHOTO_STREAM_CONFIG, useValue: { pageSize: 3, estimatedCatalogSize: 3 } },
      ],
    });
    return TestBed.inject(PhotoStreamStore);
  }

  const ids = (photos: readonly Photo[]): string[] => photos.map((p) => p.id).sort();

  beforeEach(() => {
    getPage = vi.fn();
  });

  it('starts with an empty, idle stream', () => {
    const store = createStore();

    expect(store.photos()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loads consecutive pages and appends them to the stream', () => {
    getPage.mockImplementation((page) => of(createPhotos(3, (page - 1) * 3)));
    const store = createStore();

    store.loadMore();
    store.loadMore();

    expect(getPage.mock.calls).toEqual([
      [1, 3],
      [2, 3],
    ]);
    expect(ids(store.photos())).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('exposes a loading flag while a batch is in flight', () => {
    const response = new Subject<Photo[]>();
    getPage.mockReturnValue(response);
    const store = createStore();

    store.loadMore();
    expect(store.loading()).toBe(true);

    response.next(createPhotos(3));
    response.complete();
    expect(store.loading()).toBe(false);
  });

  it('ignores loadMore calls while a batch is in flight', () => {
    getPage.mockReturnValue(new Subject<Photo[]>());
    const store = createStore();

    store.loadMore();
    store.loadMore();
    store.loadMore();

    expect(getPage).toHaveBeenCalledTimes(1);
  });

  it('wraps around to the first page when the catalog is exhausted', () => {
    getPage.mockImplementation((page) => of(page <= 2 ? createPhotos(3, (page - 1) * 3) : []));
    const store = createStore();

    store.loadMore(); // page 1
    store.loadMore(); // page 2
    store.loadMore(); // page 3 is empty -> page 1 again

    expect(getPage.mock.calls.map(([page]) => page)).toEqual([1, 2, 3, 1]);
    expect(store.photos()).toHaveLength(9);

    store.loadMore();
    expect(getPage).toHaveBeenLastCalledWith(2, 3);
  });

  it('reports an error and keeps already loaded photos when a request fails', () => {
    getPage
      .mockReturnValueOnce(of(createPhotos(3)))
      .mockReturnValueOnce(throwError(() => new Error()));
    const store = createStore();

    store.loadMore();
    store.loadMore();

    expect(store.error()).toContain('Could not load photos');
    expect(store.photos()).toHaveLength(3);
    expect(store.loading()).toBe(false);
  });

  it('retries the same page after an error', () => {
    getPage
      .mockReturnValueOnce(throwError(() => new Error()))
      .mockReturnValueOnce(of(createPhotos(3)));
    const store = createStore();

    store.loadMore();
    store.loadMore();

    expect(getPage.mock.calls.map(([page]) => page)).toEqual([1, 1]);
    expect(store.error()).toBeNull();
    expect(store.photos()).toHaveLength(3);
  });

  it('stops with an error instead of looping when the catalog is empty', () => {
    getPage.mockReturnValue(of([]));
    const store = createStore();

    store.loadMore();

    expect(getPage).toHaveBeenCalledTimes(1);
    expect(store.error()).toBeTruthy();
  });
});
