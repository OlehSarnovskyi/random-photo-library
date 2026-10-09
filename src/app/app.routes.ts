import { Routes } from '@angular/router';

const APP_TITLE = 'Photo Library';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: `Photos · ${APP_TITLE}`,
    loadComponent: () => import('./features/photos/photos-page').then((m) => m.PhotosPage),
  },
  {
    path: 'favorites',
    title: `Favorites · ${APP_TITLE}`,
    loadComponent: () => import('./features/favorites/favorites-page').then((m) => m.FavoritesPage),
  },
];
