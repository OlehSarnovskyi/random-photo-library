import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PhotoApi } from './photo-api';
import { Photo } from './photo.model';

describe('PhotoApi', () => {
  let api: PhotoApi;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PhotoApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('requests the given page of the Picsum catalog and maps it to photos', () => {
    let result: Photo[] | undefined;
    api.getPage(3, 24).subscribe((photos) => (result = photos));

    const req = http.expectOne('https://picsum.photos/v2/list?page=3&limit=24');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: '10',
        author: 'Paul Jarvis',
        width: 2500,
        height: 1667,
        url: 'https://unsplash.com/photos/6J--NXulQCs',
        download_url: 'https://picsum.photos/id/10/2500/1667',
      },
    ]);
    vi.advanceTimersByTime(300);

    expect(result).toEqual([{ id: '10', author: 'Paul Jarvis', width: 2500, height: 1667 }]);
  });

  it('emulates network latency between 200 and 300 ms', () => {
    let result: Photo[] | undefined;
    api.getPage(1, 1).subscribe((photos) => (result = photos));
    http.expectOne(() => true).flush([]);

    vi.advanceTimersByTime(199);
    expect(result).toBeUndefined();

    vi.advanceTimersByTime(101);
    expect(result).toEqual([]);
  });

  it('propagates HTTP errors', () => {
    let error: unknown;
    api.getPage(1, 1).subscribe({ error: (e) => (error = e) });

    http.expectOne(() => true).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(error).toBeTruthy();
  });
});
