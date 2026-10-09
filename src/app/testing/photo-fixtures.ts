import { Photo } from '../core/photos/photo.model';

export function createPhoto(id: string, overrides: Partial<Photo> = {}): Photo {
  return { id, author: `Author ${id}`, width: 4000, height: 3000, ...overrides };
}

export function createPhotos(count: number, startId = 0): Photo[] {
  return Array.from({ length: count }, (_, i) => createPhoto(String(startId + i)));
}
