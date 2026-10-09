import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { BROWSER_STORAGE } from './core/storage/browser-storage';
import { MemoryStorage } from './testing/memory-storage';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: BROWSER_STORAGE, useValue: new MemoryStorage() }],
    });
  });

  it('renders the header above the routed page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('app-header')).not.toBeNull();
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });
});
