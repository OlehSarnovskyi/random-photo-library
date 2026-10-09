import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createPhoto } from '../../../testing/photo-fixtures';
import { PhotoCard } from './photo-card';

describe('PhotoCard', () => {
  let fixture: ComponentFixture<PhotoCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PhotoCard);
    fixture.componentRef.setInput('photo', createPhoto('237', { author: 'André Spieker' }));
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders a lazy-loaded thumbnail for the photo id', () => {
    const img = element.querySelector('img');

    expect(img?.getAttribute('src')).toBe('https://picsum.photos/id/237/600/450');
    expect(img?.getAttribute('alt')).toBe('Photo by André Spieker');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('hides the favorite badge and caption by default', () => {
    expect(element.querySelector('.photo-card__badge')).toBeNull();
    expect(element.querySelector('.photo-card__caption')).toBeNull();
  });

  it('shows the favorite badge', async () => {
    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();

    expect(element.querySelector('.photo-card__badge')?.textContent).toContain('In favorites');
  });

  it('shows the author caption', async () => {
    fixture.componentRef.setInput('showAuthor', true);
    await fixture.whenStable();

    expect(element.querySelector('.photo-card__caption')?.textContent).toContain('André Spieker');
  });
});
