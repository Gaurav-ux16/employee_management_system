# TRIAL_3 Frontend

A cross-platform Expo and React Native operations workspace for managing employees, departments, attendance, and leave requests.

The interface is designed as an editorial-style operations console: a compact command rail, a persistent operational header, dense data views, and focused modal workflows.

## Quick Start

### Requirements

- Node.js 18 or newer
- npm
- Expo Go for testing on a physical device, or a browser/device emulator

### Install and run

```bash
npm install
npm start
```

The Expo CLI displays a QR code and local development URLs. Useful platform commands are:

```bash
npm run web
npm run android
npm run ios
```

The project currently targets Expo SDK 57. Check the Expo SDK documentation for the installed major version before changing native or Expo APIs.

## Demo Access

The frontend uses mock data by default. Use an email ending in `@ops.co` to sign in. The primary demo account is:

- Email: `admin@ops.co`
- Password: any value

The password is not validated by the mock authentication flow. This is intentional for local development only.

## Frontend Architecture

```text
App.js
├── AuthScreen
└── EditorialLayout
    ├── DashboardScreen
    ├── EmployeesScreen
    │   ├── EmployeeDetailModal
    │   └── EmployeeFormModal
    ├── DepartmentsScreen
    ├── AttendanceScreen
    └── LeavesScreen

src/api/
├── client.js       API facade, mock store, and Axios client
└── mockData.js     Initial employees, departments, attendance, leaves, and activity

src/components/common/
├── Badge.js
├── Button.js
├── Card.js
├── EmptyState.js
├── Input.js
├── LoadingState.js
├── Modal.js
└── Select.js

src/theme/colors.js   Shared visual tokens
```

### Application shell

`App.js` is the composition root. It controls:

- Whether the user is authenticated.
- Which workspace section is active.
- Whether the Employees screen should open its quick-add form.
- Dashboard statistics displayed in the navigation rail.
- Periodic statistics refresh every 10 seconds after login.

Unauthenticated users see `AuthScreen`. After login, the shared `EditorialLayout` renders the active screen and provides navigation, logout, quick-add, user metadata, and live rail counters.

### Navigation

Navigation is intentionally local state rather than a separate routing package. `currentSection` accepts:

- `dashboard`
- `employees`
- `departments`
- `attendance`
- `leaves`

To add a section, add a navigation item in `EditorialLayout.js`, render its screen in `App.js`, and keep the screen outside the navigation component.

### Reusable UI

Common controls live in `src/components/common`. Screens should use these components for consistent spacing, borders, loading states, empty states, buttons, badges, inputs, selects, and modal behavior. Shared colors belong in `src/theme/colors.js` rather than being duplicated in screen styles.

## Data Layer

`src/api/client.js` provides a frontend-facing API facade. It exports the Axios instance and domain APIs for authentication, dashboard data, employees, departments, attendance, and leaves.

The current configuration is:

```js
export const USE_MOCK_DATA = true;
export const API_BASE_URL = 'http://localhost:8000/api/v1';
```

When mock mode is enabled, the client:

- Returns the data in `mockData.js`.
- Simulates network latency.
- Mutates an in-memory store for create, update, delete, and approval actions.
- Resets when the JavaScript process reloads.

When a compatible FastAPI backend is available, set `USE_MOCK_DATA` to `false` and ensure the device can reach `API_BASE_URL`. `localhost` refers to the device or emulator itself, so a physical device generally needs the host machine's LAN IP instead.

Keep API calls in `src/api/client.js`; screens should consume the domain methods and should not access the mock arrays directly.

## Main User Flows

1. **Sign in**: `AuthScreen` calls `authApi.login`, then passes the returned user to `App.js`.
2. **Review dashboard**: `DashboardScreen` shows operational totals and recent activity.
3. **Browse employees**: `EmployeesScreen` supports search, filtering, details, creation, editing, and deletion.
4. **Use quick add**: The header action navigates to Employees and triggers the employee form.
5. **Review operations**: Departments, attendance, and leaves expose their respective data views and actions.
6. **Sign out**: The header clears the local user state and returns to authentication.

## Styling and Layout Conventions

- Use `StyleSheet.create` for component styles.
- Reuse values from `src/theme/colors.js` for palette and status colors.
- Keep content inside the shared `ScrollView` supplied by `EditorialLayout`.
- Use stable dimensions for compact rail controls and table-like rows.
- Test both narrow mobile widths and web/tablet layouts when changing shared components.
- Preserve the visual distinction between the dark navigation rail and the light workspace surface.

## Adding a New Screen

1. Create the screen in `src/screens/`.
2. Add its API methods in `src/api/client.js` if it needs data.
3. Add initial mock records to `src/api/mockData.js` when mock mode needs sample content.
4. Add a navigation item to `EditorialLayout.js`.
5. Render the screen in `App.js` using the matching section id.
6. Reuse common controls and theme tokens.
7. Test login, navigation, refresh behavior, and the web/mobile layout.

## Validation

Run the Expo development server and inspect the console for runtime warnings:

```bash
npm start
```

Before sharing a change, exercise the affected workflow in at least one mobile-sized viewport and the web target. If native behavior or dependencies change, also run the relevant Expo diagnostics for the installed SDK.

## Known Development Boundaries

- Authentication is a mock flow and is not suitable for production.
- Mock mutations exist only in memory and disappear after reload.
- No persistent client-side auth token is stored yet.
- The live backend must implement the endpoint contracts used by `src/api/client.js`.
- `API_BASE_URL` may need a platform-specific host address for Android emulators or physical devices.
