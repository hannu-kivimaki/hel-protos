# Adding Alternative Demo Routes

Guide for creating alternative versions of the SideNavigation demo accessible via different routes.

## Overview

Use React Router to serve multiple demo versions:
- `/` - Current version
- `/v2` - Alternative version

## Steps

### 1. Install React Router

```bash
cd hel-proto-sidenavigation
npm install react-router-dom
```

### 2. Create V2 Demo Component

Copy the current demo as a starting point:

```bash
cp src/App.tsx src/V2Demo.tsx
```

Rename the component inside `V2Demo.tsx` from `App` to `V2Demo`.

### 3. Update App.tsx with Routes

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { V2Demo } from './V2Demo';
import { CurrentDemo } from './CurrentDemo'; // rename current App content

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CurrentDemo />} />
        <Route path="/v2" element={<V2Demo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
```

**Note:** Using `HashRouter` instead of `BrowserRouter` works better with GitHub Pages since it doesn't require server-side routing configuration.

### 4. Add Navigation Between Versions (Optional)

Add a simple version switcher in each demo:

```tsx
import { Link } from 'react-router-dom';

// In your demo component:
<nav className="version-switcher">
  <Link to="/">v1</Link>
  <Link to="/v2">v2</Link>
</nav>
```

### 5. Deploy

No changes needed to the deploy workflow. Push to main and both versions will be available:
- `https://hannu-kivimaki.github.io/hel-protos/` → current
- `https://hannu-kivimaki.github.io/hel-protos/#/v2` → alternative

## Alternative: BrowserRouter with 404 Handling

If you prefer clean URLs without `#`, use `BrowserRouter` and add a 404.html redirect:

1. Create `public/404.html` that redirects to index with path preserved
2. Add script in `index.html` to restore the path
3. Use `BrowserRouter` with `basename="/hel-protos"`

This is more complex but gives cleaner URLs like `/hel-protos/v2`.
