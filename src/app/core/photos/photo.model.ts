/**
 * A photo with a stable identity.
 *
 * `id` is a real Picsum id, so the same photo can be rendered again at any size
 * (`/id/{id}/{width}/{height}`) — e.g. after a page refresh or on the detail page.
 */
export interface Photo {
  readonly id: string;
  readonly author: string;
  /** Original width in pixels, used to preserve the aspect ratio on the detail page. */
  readonly width: number;
  /** Original height in pixels. */
  readonly height: number;
}

export function isPhoto(value: unknown): value is Photo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    candidate['id'].length > 0 &&
    typeof candidate['author'] === 'string' &&
    typeof candidate['width'] === 'number' &&
    typeof candidate['height'] === 'number'
  );
}
