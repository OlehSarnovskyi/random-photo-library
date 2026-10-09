import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { BROWSER_STORAGE } from '../../core/storage/browser-storage';
import { MemoryStorage } from '../../testing/memory-storage';
import { createPhoto } from '../../testing/photo-fixtures';
import { FavoritesPage } from './favorites-page';

describe('FavoritesPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: BROWSER_STORAGE, useValue: new MemoryStorage() }],
    });
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(FavoritesPage);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('shows an empty state with a link to the stream', async () => {
    const element = await render();

    expect(element.textContent).toContain('No favorites yet');
    expect(element.querySelector('app-empty-state a')?.getAttribute('href')).toBe('/');
  });

  it('lists every favorite, linking to its photo page', async () => {
    const store = TestBed.inject(FavoritesStore);
    store.add(createPhoto('10'));
    store.add(createPhoto('20'));

    const element = await render();
    const links = Array.from(element.querySelectorAll('a.photo-tile'));

    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/photos/20', '/photos/10']);
    expect(element.querySelectorAll('app-photo-card')).toHaveLength(2);
  });
});
