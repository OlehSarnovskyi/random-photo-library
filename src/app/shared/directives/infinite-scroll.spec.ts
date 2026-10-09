import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockIntersectionObserver } from '../../testing/intersection-observer-mock';
import { InfiniteScroll } from './infinite-scroll';

@Component({
  imports: [InfiniteScroll],
  template: `<div
    appInfiniteScroll
    [infiniteScrollDisabled]="disabled()"
    infiniteScrollDistance="300px"
    (scrolled)="onScrolled()"
  ></div>`,
})
class Host {
  readonly disabled = signal(false);
  readonly onScrolled = vi.fn();
}

describe('InfiniteScroll', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    MockIntersectionObserver.install();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('observes the host element with the configured distance', () => {
    const observer = MockIntersectionObserver.latest();
    const sentinel = fixture.nativeElement.querySelector('div');

    expect(observer?.observed.has(sentinel)).toBe(true);
    expect(observer?.rootMargin).toBe('0px 0px 300px 0px');
  });

  it('emits when the sentinel comes into view', () => {
    MockIntersectionObserver.latest()?.trigger(true);
    expect(host.onScrolled).toHaveBeenCalledTimes(1);
  });

  it('does not emit when the sentinel leaves the view', () => {
    MockIntersectionObserver.latest()?.trigger(false);
    expect(host.onScrolled).not.toHaveBeenCalled();
  });

  it('stops observing while disabled', async () => {
    const observer = MockIntersectionObserver.latest();

    host.disabled.set(true);
    await fixture.whenStable();

    expect(observer?.disconnected).toBe(true);
    expect(MockIntersectionObserver.latest()).toBeUndefined();
  });

  it('re-observes when enabled again, so a still-visible sentinel triggers the next load', async () => {
    host.disabled.set(true);
    await fixture.whenStable();
    host.disabled.set(false);
    await fixture.whenStable();

    const observer = MockIntersectionObserver.latest();
    expect(observer).toBeDefined();
    // A new observer reports the current state right away; simulate "still visible".
    observer?.trigger(true);
    expect(host.onScrolled).toHaveBeenCalledTimes(1);
  });

  it('disconnects when destroyed', () => {
    const observer = MockIntersectionObserver.latest();
    fixture.destroy();
    expect(observer?.disconnected).toBe(true);
  });
});
