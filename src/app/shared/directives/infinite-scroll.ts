import { Directive, effect, ElementRef, inject, input, output } from '@angular/core';

/**
 * Emits `scrolled` when the host element (a sentinel placed after a list) gets close to
 * the viewport. Implemented with `IntersectionObserver`: no scroll listeners, no libraries.
 *
 * Every time the directive is (re-)enabled a fresh observer is created. A new observer always
 * reports the current intersection state, so if the sentinel is still visible after a batch has
 * been rendered (e.g. on a tall screen) the next batch is requested right away instead of the
 * stream getting stuck waiting for a scroll that can never happen.
 */
@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScroll {
  /** Pauses observing, e.g. while a batch is loading or after an error. */
  readonly disabled = input(false, { alias: 'infiniteScrollDisabled' });
  /** How far below the viewport loading should start, as a CSS length. */
  readonly distance = input('600px', { alias: 'infiniteScrollDistance' });

  readonly scrolled = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect((onCleanup) => {
      if (this.disabled() || typeof IntersectionObserver === 'undefined') {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.scrolled.emit();
          }
        },
        { rootMargin: `0px 0px ${this.distance()} 0px` },
      );
      observer.observe(this.host.nativeElement);
      onCleanup(() => observer.disconnect());
    });
  }
}
