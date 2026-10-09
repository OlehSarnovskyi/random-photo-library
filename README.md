# Photo Library

An Angular app with an endless random photostream and a "Favorites" library that is kept
in the browser.

| Route         | What it does                                                                 |
| ------------- | ---------------------------------------------------------------------------- |
| `/`           | Endless grid of random photos. **Clicking a photo adds it to Favorites.**    |
| `/favorites`  | Every saved photo (no pagination). Clicking a photo opens it.                |
| `/photos/:id` | One favorite photo, full screen, with a **Remove from favorites** button.    |
| `**`          | "Page not found".                                                            |

A sticky header with **Photos** and **Favorites** links is shown on every page. The active
link is highlighted with `routerLinkActive`. On `/photos/:id` the Favorites section stays
highlighted, because that page shows a favorite. It gets no `aria-current`, since it is not the
favorites page itself.

## Getting started

Requirements: **Node.js ^22.22.3, ^24.15 or >=26** (as required by Angular 22) and npm.

```bash
npm install
npm start            # http://localhost:4200
```

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm start`       | Dev server with live reload                  |
| `npm run build`   | Production build in `dist/`                  |
| `npm test`        | Unit tests (Vitest) in watch mode            |
| `npm run test:ci` | Unit tests, single run                       |
| `npm run format`  | Format sources with Prettier                 |
| `npm run lint`    | Lint TypeScript and templates with ESLint    |

## Tech stack

- **Angular 22**: standalone components, signals, zoneless change detection, built-in
  control flow (`@if` / `@for`), lazy-loaded routes, and `OnPush` (the default in v22).
- **Angular Material 22** (M3 theme): toolbar, buttons, icons, progress spinner, snack bar.
- **SCSS** for styles. Colors and typography come from Material system tokens (`--mat-sys-*`).
- **Vitest** + jsdom for unit tests (the default runner of the Angular CLI).
- **ESLint** (`angular-eslint`, including template accessibility rules) and **Prettier**.
- No backend. Favorites are stored in `localStorage`.

## Project structure

```
src/app
├── core/                       app-wide services and models (no UI)
│   ├── photos/                 Photo model, Picsum API client, URL helpers
│   ├── favorites/              FavoritesStore: signal state + localStorage
│   └── storage/                BROWSER_STORAGE injection token
├── features/                   one folder per route (lazy loaded)
│   ├── photos/                 PhotosPage + PhotoStreamStore (endless stream state)
│   ├── favorites/              FavoritesPage
│   ├── photo-detail/           PhotoDetailPage
│   └── not-found/              NotFoundPage (wildcard route)
├── layout/header/              sticky header with navigation
├── shared/
│   ├── directives/             InfiniteScroll (IntersectionObserver)
│   ├── ui/                     PhotoCard, PhotoGrid, Loader, EmptyState
│   └── utils/                  randomInt, shuffle
└── testing/                    test helpers (excluded from the production build)
```

Pages are thin containers. They inject stores and compose presentational components from
`shared/ui`, which only take inputs and have no dependencies. This keeps `PhotoCard`,
`PhotoGrid`, `Loader` and `EmptyState` reusable on every page.

## Design decisions

### Photos with stable ids

`https://picsum.photos/200/300` returns a *different* random image on every request. If that
URL were saved, a favorite would turn into another photo after a reload, and `/photos/:id`
would have nothing to show. So the stream is built from Picsum's list endpoint
(`/v2/list?page=N&limit=24`), which returns **real photo ids**. Picsum ids have gaps, so they
are never guessed. Images are then loaded with `https://picsum.photos/id/{id}/{w}/{h}`, which
always gives back the same photo.

To keep the stream random and endless:

- it starts at a **random page** of the catalog, so each session looks different;
- each batch is **shuffled**;
- when the catalog runs out (an empty page comes back), it **wraps around** to page 1.

### Emulated API latency

`PhotoApi` adds a random **200–300 ms** delay to each response
(`delayWhen(() => timer(randomInt(200, 300)))`). The range can be configured through the
`PHOTO_API_CONFIG` token.

### Infinite scroll, written from scratch

`InfiniteScroll` is a small directive placed on a sentinel element below the grid. It uses an
`IntersectionObserver` with a `600px` bottom margin, so the next batch starts loading before
the user reaches the end. There are no scroll listeners and no third-party libraries.

- **No duplicate requests.** `PhotoStreamStore.loadMore()` does nothing while a batch is
  loading. The directive also stops observing while `loading` (or `error`) is set.
- **No stuck stream on tall screens.** If the first batch does not fill the viewport, no
  scrollbar appears and a scroll-based approach never fires again. Each time the directive is
  re-enabled, it creates a **new** observer. A new observer always reports the current
  intersection state right away, so if the sentinel is still on screen after a batch renders,
  the next batch loads at once. I checked this manually with a 2560×4000 viewport: the
  stream filled the screen and then stopped.
- A **loader** shows while a batch is loading. If a request fails, an error appears with a
  **Try again** button, and the photos already loaded stay on screen.

### Favorites

- `FavoritesStore` keeps favorites in a signal and writes them to `localStorage` on every
  change, so they **survive a page reload**.
- **No duplicates.** `add()` returns `false` if the photo is already saved. The user sees
  feedback in a `MatSnackBar` ("Added to favorites" or "Already in favorites"), and saved
  photos get a ♥ badge in the stream.
- Stored data is treated as untrusted. Invalid JSON, invalid entries and duplicates are
  dropped when it is read.
- If `localStorage` is not available or is full (private mode, quota), the app keeps working
  with in-memory state.
- **Tabs stay in sync** through the `storage` event.

### Unknown `/photos/:id`

A link may point to a photo that is not in Favorites: an old bookmark, a hand-typed URL, or a
photo removed in another tab. In that case the page shows a **"Photo not found"** state with a
link back to Favorites. Any other unknown URL goes to the wildcard route (**"Page not
found"**).

### After "Remove from favorites"

Once a photo is removed, there is nothing left to show on its page. So the user is
**redirected to `/favorites`**, and a snack bar offers **Undo**, which puts the photo back in
its original position. The redirect happens *before* the removal, so the detail page never
flashes its "not found" state.

### Other details

- The photostream store is provided in root on purpose. Loaded photos survive a trip to
  Favorites and back, and `withInMemoryScrolling` restores the scroll position on back
  navigation.
- Route params are bound straight to component inputs (`withComponentInputBinding`).
- Thumbnails are requested at about 2× their display size (600×450) and use
  `loading="lazy"`. Full-screen images are scaled to at most 1920px on the longest side,
  keeping the original aspect ratio.
- Accessibility: photo tiles are real `<button>` and `<a>` elements with descriptive labels
  and visible focus rings. The loader uses `role="status"`, errors use `role="alert"`, the
  active link gets `aria-current="page"`, and `prefers-reduced-motion` is respected.

## Testing

```bash
npm run test:ci
```

The unit tests cover:

- utilities (`randomInt`, `shuffle`, Picsum URL and size helpers);
- `PhotoApi`: request shape, DTO mapping, and the 200–300 ms latency (with fake timers);
- `PhotoStreamStore`: paging, the in-flight guard, wrap-around, error and retry, and an
  empty catalog;
- `FavoritesStore`: add and remove, no duplicates, persistence, corrupted storage, storage
  failures, and cross-tab sync;
- `InfiniteScroll`: observing, emitting, pausing, and re-observing on re-enable (with a mock
  `IntersectionObserver`);
- components: header highlighting, the photos page (click to favorite, loader, errors), the
  favorites list, the detail page (not found, remove, redirect, undo), and routing (including
  the wildcard).

## Known limitations

- **The stream grows without bound.** Every loaded photo stays in memory and in the DOM, so a
  very long session keeps adding `<img>` elements. This is fine for this task. A production
  app would virtualize the grid (render only the rows near the viewport, e.g. with a
  virtual-scroll viewport) and maybe cap how many photos are kept in memory.
- **Picsum is a third-party dependency.** If it is down, the stream shows an error with a
  **Try again** button. Favorites still open, but their images will not load.
