import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { delayWhen, map, Observable, timer } from 'rxjs';

import { randomInt } from '../../shared/utils/random';
import { Photo } from './photo.model';
import { PICSUM_BASE_URL } from './picsum';

export interface PhotoApiConfig {
  /** Lower bound of the artificial latency added to every response, in ms. */
  readonly minLatencyMs: number;
  /** Upper bound of the artificial latency added to every response, in ms. */
  readonly maxLatencyMs: number;
}

export const PHOTO_API_CONFIG = new InjectionToken<PhotoApiConfig>('PHOTO_API_CONFIG', {
  providedIn: 'root',
  factory: () => ({ minLatencyMs: 200, maxLatencyMs: 300 }),
});

/** Shape of an item returned by `GET https://picsum.photos/v2/list`. */
interface PicsumPhotoDto {
  readonly id: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly download_url: string;
}

/**
 * Thin client over the Picsum list endpoint.
 *
 * The list endpoint is used instead of `picsum.photos/200/300` because it returns
 * real photo ids (with gaps), which are required to show the very same photo later.
 */
@Injectable({ providedIn: 'root' })
export class PhotoApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(PHOTO_API_CONFIG);

  /**
   * Returns a page of the Picsum catalog. Pages past the end of the catalog are empty.
   * Every response is delayed by a random 200–300 ms to emulate a real-world API.
   */
  getPage(page: number, limit: number): Observable<Photo[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get<PicsumPhotoDto[]>(`${PICSUM_BASE_URL}/v2/list`, { params }).pipe(
      map((dtos) => dtos.map(toPhoto)),
      delayWhen(() => timer(randomInt(this.config.minLatencyMs, this.config.maxLatencyMs))),
    );
  }
}

function toPhoto({ id, author, width, height }: PicsumPhotoDto): Photo {
  return { id, author, width, height };
}
