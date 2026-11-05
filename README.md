# Economic Events Manager

Economic Events Manager is a browser-based tool for recording the financial and operational results of fundraising and other group-run economic events. It helps organizers maintain a consistent record of each event, understand its financial performance relative to costs and effort, and compare results over time.

The app is currently a client-side React application. It saves records in the current browser's `localStorage`; there is no server, account system, or cross-device synchronization. The interface and number/date formatting are in Spanish (`es-AR`).

## What the app does

- **Record and maintain events.** Add, edit, and delete events. Each record includes its name, category, date, sales modality (pre-sale or direct sale), revenue, investment, group and seller counts, preparation and selling days, and person-days of work. Categories can be created as needed.
- **Review event performance.** Each event shows its net profit, ROI, profit margin, participation rate, average sales per seller, and profit per person-day. It also provides category-average profit and comparisons with the previous event in the category and the immediately preceding event in the filtered list.
- **Explore annual results.** Select a year to see event count, total revenue and investment, net profit, average profit per event, aggregate ROI, and aggregate profit margin.
- **Filter and export records.** Filter by year, date range, category, or selected events. Download matching records as JSON or create a PDF report with summary totals, charts, and event details. ROI and margin charts support bar, line, and area styles.
- **Keep portable backups.** Import a JSON list of event records. Import merges by ID: matching IDs are updated and new IDs are added. Export JSON regularly if you need a backup or want to move data between browsers.

## Metrics

The app calculates metrics from the values entered for each event:

| Metric                   | Calculation                                |
| ------------------------ | ------------------------------------------ |
| Net profit               | Revenue − investment                       |
| ROI                      | Net profit ÷ investment × 100              |
| Profit margin            | Net profit ÷ revenue × 100                 |
| Participation rate       | Active sellers ÷ total group members × 100 |
| Average sales per seller | Revenue ÷ active sellers                   |
| Profit per person-day    | Net profit ÷ person-days worked            |

Annual ROI and margin are aggregated from the year's total profit, investment, and revenue—not averaged from individual event percentages. When a metric's denominator is zero, the app displays it as unavailable rather than dividing by zero. Monetary amounts are formatted using the `es-AR` locale; the app does not assign or convert a currency.

## Tech stack

- React 19 and TypeScript
- Vite 8 for local development and production builds
- Tailwind CSS 4 for styling
- Recharts for report charts
- `jspdf` and `html2canvas-pro` for PDF generation
- ESLint for linting

## Getting started

### Requirements

- Node.js and npm (use a Node.js release supported by the installed Vite version)

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

### Available scripts

| Command           | Purpose                                                                          |
| ----------------- | -------------------------------------------------------------------------------- |
| `npm run dev`     | Start the Vite development server with hot module replacement.                   |
| `npm run build`   | Type-check the project and create the production build in `dist/`.               |
| `npm run lint`    | Run ESLint across the project.                                                   |
| `npm run preview` | Serve the built production app locally for a preview. Run `npm run build` first. |

There is currently no test script configured in `package.json`.

## Deploy to Firebase Hosting

Firebase Hosting serves the Vite production build from `dist/`. The Hosting rewrite sends application routes to `index.html`, so client-side navigation continues to work after refresh.

### One-time setup

1. Install Node.js 22 and npm.
2. Install the Firebase CLI: `npm install -g firebase-tools`.
3. Sign in with an account that can deploy to the Firebase project: `firebase login`.
4. Confirm the Firebase project `analiceevents` is available to that account and Hosting is enabled for it. The selected default project is recorded in `.firebaserc`.

### Local verification and deployment

- `npm ci` installs the locked project dependencies.
- `npm run build` type-checks and creates the production site in `dist/`.
- `npm run preview` previews the production Vite build locally.
- `npm run firebase:serve` builds the app and runs it in the Firebase Hosting emulator.
- `npm run firebase:deploy` builds and deploys only Hosting to `analiceevents`.

GitHub Actions also deploys on pushes to `master` and creates preview deployments for pull requests. Add the Firebase service-account JSON as the repository Actions secret `FIREBASE_SERVICE_ACCOUNT_ANALICEEVENTS`; the workflows already target project `analiceevents` and use Node.js 22.

Deploying to Hosting does not move event records to Firebase: the current app stores them in each browser's `localStorage`, so they are not shared across browsers or devices.

## Project structure

```text
src/
  App.tsx                     Application state, persistence, validation, and annual calculations
  types.ts                    Event data types and imported-record validation
  components/
    RegistryEvent.tsx         Event create/edit form
    AnaliticsResume.tsx       Event list, filters, and per-event indicators
    AnualAnalitics.tsx        Year selector and annual summary
    Navbar/
      Navbar.tsx              Data management and export controls
      Filter.tsx              Selection filters used by JSON and PDF exports
      RechartsPDF.tsx          Charts and PDF report generation
```

## Data and privacy

Event records stay in the browser's local storage on the device and browser where they were entered. Clearing browser site data, changing browsers, or using another device can make those records unavailable. Use JSON export for backups and transfer; importing a backup validates the record shape and merges it by event ID. The app does not send event data to a backend.

The JSON record shape is defined by the `EventRecord` type and runtime validator in `src/types.ts`. A record contains an ID, title, category, modality, `YYYY-MM-DD` date, timestamps, and an `inputs` object with the financial, participation, and effort values. Derived analytics are calculated from those inputs rather than persisted as event fields.

## Contribution notes

- Keep derived indicators consistent with the formulas above and handle zero denominators explicitly.
- Preserve the `EventRecord` shape and update both the TypeScript type and runtime validation when changing importable data.
- Keep storage and import/export behavior clear: local data is browser-specific, and imports merge by ID.
- The visible product copy is Spanish. When changing user-facing text, keep its language and terminology consistent unless localization is part of the change.
- Before opening a change, run `npm run lint` and `npm run build`.
