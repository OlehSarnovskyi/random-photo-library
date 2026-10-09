import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { Photo } from '../../../core/photos/photo.model';
import { picsumImageUrl, Size } from '../../../core/photos/picsum';

/** Requested thumbnail size: ~2x the rendered tile size for sharp images on HiDPI screens. */
export const THUMBNAIL_SIZE: Size = { width: 600, height: 450 };

/** Presentational thumbnail. Interaction (button / link) is up to the parent. */
@Component({
  selector: 'app-photo-card',
  imports: [MatIcon],
  templateUrl: './photo-card.html',
  styleUrl: './photo-card.scss',
})
export class PhotoCard {
  readonly photo = input.required<Photo>();
  /** Shows a "favorite" badge on the thumbnail. */
  readonly favorite = input(false);
  /** Shows the author's name over the bottom of the thumbnail. */
  readonly showAuthor = input(false);

  protected readonly size = THUMBNAIL_SIZE;
  protected readonly src = computed(() => picsumImageUrl(this.photo().id, THUMBNAIL_SIZE));
}
