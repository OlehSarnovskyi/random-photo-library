import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites-store';
import { BROWSER_STORAGE } from '../../core/storage/browser-storage';
import { MemoryStorage } from '../../testing/memory-storage';
import { createPhoto } from '../../testing/photo-fixtures';
import { Header } from './header';

@Component({ template: '' })
class Blank {}

describe('Header', () => {
  // The header lives outside the router outlet, like in the app, so it must react to navigation.
  let fixture: ComponentFixture<Header>;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Blank }]),
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
      ],
    });
    fixture = TestBed.createComponent(Header);
    element = fixture.nativeElement;
    await navigate('/');
  });

  async function navigate(url: string): Promise<void> {
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
  }

  function links(): HTMLAnchorElement[] {
    return Array.from(element.querySelectorAll('a'));
  }

  function highlighted(): string[] {
    return links()
      .filter((link) => link.classList.contains('mat-tonal-button'))
      .map((link) => link.getAttribute('href') ?? '');
  }

  it('renders the Photos and Favorites navigation', () => {
    expect(links().map((link) => link.getAttribute('href'))).toEqual(['/', '/favorites']);
  });

  it('highlights Photos on the root path', () => {
    expect(highlighted()).toEqual(['/']);
    expect(links()[0].getAttribute('aria-current')).toBe('page');
  });

  it('moves the highlight to Favorites on /favorites', async () => {
    await navigate('/favorites');

    expect(highlighted()).toEqual(['/favorites']);
    expect(links()[0].getAttribute('aria-current')).toBeNull();
    expect(links()[1].getAttribute('aria-current')).toBe('page');
  });

  it('keeps the Favorites section highlighted on a photo page, without aria-current', async () => {
    await navigate('/favorites');
    await navigate('/photos/42');

    expect(highlighted()).toEqual(['/favorites']);
    expect(links()[1].getAttribute('aria-current')).toBeNull();

    await navigate('/');
    expect(highlighted()).toEqual(['/']);
  });

  it('shows the number of favorites', async () => {
    expect(element.querySelector('.header__count')).toBeNull();

    TestBed.inject(FavoritesStore).add(createPhoto('1'));
    await fixture.whenStable();

    expect(element.querySelector('.header__count')?.textContent).toContain('1');
  });
});
