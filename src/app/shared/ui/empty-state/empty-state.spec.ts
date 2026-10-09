import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `
    <app-empty-state icon="favorite" heading="Nothing here" message="Add something">
      <button type="button">Action</button>
    </app-empty-state>
  `,
})
class Host {}

describe('EmptyState', () => {
  it('renders the icon, heading, message and projected actions', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('mat-icon')?.textContent).toContain('favorite');
    expect(element.querySelector('h1')?.textContent).toContain('Nothing here');
    expect(element.querySelector('p')?.textContent).toContain('Add something');
    expect(element.querySelector('.empty-state__actions button')?.textContent).toContain('Action');
  });
});
