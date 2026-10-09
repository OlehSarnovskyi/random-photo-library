export const PICSUM_BASE_URL = 'https://picsum.photos';

export interface Size {
  readonly width: number;
  readonly height: number;
}

/** URL of a specific (non-random) Picsum photo, cropped to the requested size. */
export function picsumImageUrl(id: string, { width, height }: Size): string {
  return `${PICSUM_BASE_URL}/id/${encodeURIComponent(id)}/${Math.round(width)}/${Math.round(height)}`;
}

/** Scales `size` down (never up) so that it fits into `bounds`, preserving the aspect ratio. */
export function fitWithin(size: Size, bounds: Size): Size {
  const ratio = Math.min(1, bounds.width / size.width, bounds.height / size.height);
  return {
    width: Math.round(size.width * ratio),
    height: Math.round(size.height * ratio),
  };
}
