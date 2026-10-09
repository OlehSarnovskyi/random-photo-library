import { Component } from '@angular/core';

/** Responsive grid layout for projected photo tiles. */
@Component({
  selector: 'app-photo-grid',
  template: '<ng-content />',
  styleUrl: './photo-grid.scss',
})
export class PhotoGrid {}
