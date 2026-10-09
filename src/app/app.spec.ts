import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

import { App } from './app';
import { appConfig } from './app.config';
import { BROWSER_STORAGE } from './core/storage/browser-storage';
import { MemoryStorage } from './testing/memory-storage';

describe('App', () => {
  beforeEach(() => {
    // Use the real application providers (router features included); isolate only storage.
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
      ],
    });
  });

  it('renders the header above the routed page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('app-header')).not.toBeNull();
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });

  describe('routes', () => {
    let harness: RouterTestingHarness;

    beforeEach(async () => {
      harness = await RouterTestingHarness.create();
    });

    it('shows the favorites page at /favorites', async () => {
      await harness.navigateByUrl('/favorites');
      expect(harness.routeNativeElement?.textContent).toContain('No favorites yet');
    });

    it('binds :id on /photos/:id', async () => {
      await harness.navigateByUrl('/photos/1');
      expect(harness.routeNativeElement?.textContent).toContain('Photo not found');
    });

    it('shows "Page not found" for unknown URLs', async () => {
      await harness.navigateByUrl('/this/does/not/exist');
      expect(harness.routeNativeElement?.textContent).toContain('Page not found');
    });
  });
});
