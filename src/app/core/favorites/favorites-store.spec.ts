import { TestBed } from '@angular/core/testing';

import { createPhoto } from '../../testing/photo-fixtures';
import { MemoryStorage } from '../../testing/memory-storage';
import { BROWSER_STORAGE } from '../storage/browser-storage';
import { FAVORITES_STORAGE_KEY, FavoritesStore } from './favorites-store';

describe('FavoritesStore', () => {
  let storage: MemoryStorage;

  function createStore(): FavoritesStore {
    TestBed.configureTestingModule({
      providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
    });
    return TestBed.inject(FavoritesStore);
  }

  function stored(): unknown {
    return JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) ?? 'null');
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('starts empty when nothing is stored', () => {
    const store = createStore();
    expect(store.favorites()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  describe('add', () => {
    it('adds a photo to the top of the list and persists it', () => {
      const store = createStore();

      expect(store.add(createPhoto('1'))).toBe(true);
      expect(store.add(createPhoto('2'))).toBe(true);

      expect(store.favorites().map((p) => p.id)).toEqual(['2', '1']);
      expect(stored()).toEqual([createPhoto('2'), createPhoto('1')]);
    });

    it('does not create duplicates', () => {
      const store = createStore();
      store.add(createPhoto('1'));

      expect(store.add(createPhoto('1'))).toBe(false);
      expect(store.count()).toBe(1);
    });

    it('can insert at a given position', () => {
      const store = createStore();
      store.add(createPhoto('1'));
      store.add(createPhoto('2'));

      store.add(createPhoto('3'), 1);

      expect(store.favorites().map((p) => p.id)).toEqual(['2', '3', '1']);
    });
  });

  describe('remove', () => {
    it('removes a photo, persists the change and reports its former position', () => {
      const store = createStore();
      store.add(createPhoto('1'));
      store.add(createPhoto('2'));

      expect(store.remove('1')).toEqual({ photo: createPhoto('1'), index: 1 });
      expect(store.has('1')).toBe(false);
      expect(stored()).toEqual([createPhoto('2')]);
    });

    it('returns undefined for unknown ids', () => {
      const store = createStore();
      expect(store.remove('missing')).toBeUndefined();
    });
  });

  it('looks photos up by id', () => {
    const store = createStore();
    store.add(createPhoto('7'));

    expect(store.has('7')).toBe(true);
    expect(store.getById('7')).toEqual(createPhoto('7'));
    expect(store.getById('8')).toBeUndefined();
  });

  describe('restoring from storage', () => {
    it('restores favorites saved by a previous session', () => {
      storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([createPhoto('1'), createPhoto('2')]));

      const store = createStore();

      expect(store.favorites()).toEqual([createPhoto('1'), createPhoto('2')]);
    });

    it('ignores corrupted JSON', () => {
      storage.setItem(FAVORITES_STORAGE_KEY, '{not json');
      expect(createStore().favorites()).toEqual([]);
    });

    it('ignores data that is not a list', () => {
      storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ id: '1' }));
      expect(createStore().favorites()).toEqual([]);
    });

    it('drops invalid entries and duplicates', () => {
      storage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify([createPhoto('1'), { id: 2 }, null, createPhoto('1'), createPhoto('3')]),
      );

      expect(
        createStore()
          .favorites()
          .map((p) => p.id),
      ).toEqual(['1', '3']);
    });
  });

  it('keeps working in memory when storage is unavailable', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: null }] });
    const store = TestBed.inject(FavoritesStore);

    expect(store.add(createPhoto('1'))).toBe(true);
    expect(store.count()).toBe(1);
  });

  it('keeps working in memory when writing to storage fails', () => {
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const store = createStore();

    expect(store.add(createPhoto('1'))).toBe(true);
    expect(store.has('1')).toBe(true);
  });

  it('picks up changes made in another tab', () => {
    const store = createStore();
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([createPhoto('42')]));

    window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_STORAGE_KEY }));

    expect(store.favorites()).toEqual([createPhoto('42')]);
  });

  it('ignores storage events for other keys', () => {
    const store = createStore();
    store.add(createPhoto('1'));
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([]));

    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));

    expect(store.count()).toBe(1);
  });
});
