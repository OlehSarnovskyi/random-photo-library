import { TestBed } from '@angular/core/testing';

import { Loader } from './loader';

describe('Loader', () => {
  it('announces loading to assistive technology', async () => {
    const fixture = TestBed.createComponent(Loader);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.getAttribute('role')).toBe('status');
    expect(element.textContent).toContain('Loading…');
    expect(element.querySelector('mat-progress-spinner')).not.toBeNull();
  });

  it('supports a custom label', async () => {
    const fixture = TestBed.createComponent(Loader);
    fixture.componentRef.setInput('label', 'Fetching photos');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Fetching photos');
  });
});
