---
name: hds
description: Helsinki Design System usage guide. Use when working with HDS components, design tokens, or UI development.
---

# HDS Skill - Helsinki Design System

Quick reference for building City of Helsinki prototypes with HDS React.

---

## Quick Reference

### ✅ Drupal-Ready Components (Direct mapping)

```tsx
<Button>Lähetä</Button>                    // Primary action
<Button variant="secondary">Peruuta</Button>
<TextInput id="x" label="Nimi" />          // Text field
<TextArea id="x" label="Viesti" />         // Long text
<Checkbox id="x" label="Hyväksyn" />       // Boolean
<RadioButton id="x" label="Opt" name="g"/> // Single choice
<Select label="X" options={[...]} />       // Dropdown (basic)
<Card border>Content</Card>                // Content container
<Tag>Label</Tag>                           // Category/status
<Notification type="success">OK</Notification>
<LoadingSpinner />                         // Loading state
<Logo size="medium" />                     // Helsinki logo
<Link href="/x">Text</Link>                // Navigation
```

### ⚠️ React-Only Components (Need Drupal adaptation)

```tsx
<DateInput label="Pvm" language="fi" />    // → Flatpickr
<TimeInput label="Aika" />                 // → HTML5 time
<PhoneInput label="Puh" />                 // → Pattern validation
<FileInput label="Liite" />                // → managed_file
<Tabs>...</Tabs>                           // → Custom JS
<Accordion heading="X">...</Accordion>     // → details/summary
<Stepper steps={[...]} />                  // → Multi-step form
<Dialog isOpen={x}>...</Dialog>            // → Drupal modal
<Navigation>...</Navigation>               // → Menu system + JS
<Table cols={[...]} rows={[...]} />        // → Views + DataTables
```

---

## Import Patterns

### Standard Component Import

```tsx
import {
  Button,
  TextInput,
  TextArea,
  Checkbox,
  RadioButton,
  Select,
  SelectionGroup,
  Card,
  Tag,
  Notification,
  LoadingSpinner,
  Logo,
  Link,
  // Complex (⚠️ Drupal)
  DateInput,
  Tabs,
  Dialog,
  // Icons
  IconArrowRight,
  IconCheck,
  IconCross,
  IconAlertCircle,
} from 'hds-react';
```

### Styles Import (Required in main.tsx)

```tsx
import 'hds-react/styles.css';
```

### Design Tokens (CSS Variables)

```css
/* Colors */
var(--color-coat-of-arms)      /* #0000BF - Primary */
var(--color-black-90)          /* #1A1A1A - Text */
var(--color-black-5)           /* #F2F2F2 - Light bg */
var(--color-success)           /* #007A64 */
var(--color-error)             /* #C4123E */

/* Spacing */
var(--spacing-xs)   /* 12px */
var(--spacing-s)    /* 16px */
var(--spacing-m)    /* 24px */
var(--spacing-l)    /* 32px */
var(--spacing-xl)   /* 40px */

/* Typography */
var(--fontsize-heading-xl)     /* 40px */
var(--fontsize-heading-l)      /* 32px */
var(--fontsize-heading-m)      /* 24px */
var(--fontsize-body-m)         /* 16px */
var(--font-default)            /* HelsinkiGrotesk */

/* Breakpoints */
/* xs: 320px, s: 576px, m: 768px, l: 992px, xl: 1248px */
```

---

## Documentation Rules

### Always Add Component Comments

```tsx
// ✅ HDS Core: [Component] - Suoraan Drupalissa
<Button>Click</Button>

// ⚠️ HDS React: [Component] - VAATII Drupal-sovituksen
// Drupal: [Implementation approach]
<DateInput label="Date" />
```

### Extended Format (for complex components)

```tsx
// ⚠️ HDS React: DateInput - VAATII Drupal-sovituksen
// Drupal: Date field + Flatpickr widget + HDS CSS
// Tarvitaan: Flatpickr.js, fi-locale
// Estimated: 4-6h
<DateInput
  id="birthdate"
  label="Syntymäaika"
  language="fi"
  required
/>
```

---

## Common Patterns

### Form with Validation

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ✅ HDS Core: TextInput - Suoraan Drupalissa */}
      <TextInput
        id="name"
        label="Nimi"
        required
        invalid={!!errors.name}
        errorText={errors.name}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      {/* ✅ HDS Core: TextInput (email) - Suoraan Drupalissa */}
      <TextInput
        id="email"
        label="Sähköposti"
        type="email"
        required
        invalid={!!errors.email}
        errorText={errors.email}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      {/* ✅ HDS Core: TextArea - Suoraan Drupalissa */}
      <TextArea
        id="message"
        label="Viesti"
        required
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />

      {/* ✅ HDS Core: Button - Suoraan Drupalissa */}
      <Button type="submit">Lähetä</Button>
    </form>
  );
}
```

### Card Grid Layout

```tsx
<div
  style={{
    display: 'grid',
    gap: 'var(--spacing-m)',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
  }}
>
  {items.map((item) => (
    // ✅ HDS Core: Card - Suoraan Drupalissa
    <Card key={item.id} border>
      <h3 style={{ marginBottom: 'var(--spacing-s)' }}>{item.title}</h3>
      <p style={{ color: 'var(--color-black-70)', marginBottom: 'var(--spacing-m)' }}>
        {item.description}
      </p>
      <Tag>{item.category}</Tag>
    </Card>
  ))}
</div>
```

### Page Layout with Header/Footer

```tsx
import { Header, Footer, Logo } from 'hds-react';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ⚠️ HDS React: Header - VAATII Drupal-sovituksen */}
      <Header>
        <Header.ActionBarItem>
          <a href="/" aria-label="Etusivu">
            <Logo size="medium" />
          </a>
        </Header.ActionBarItem>
      </Header>

      <main
        id="main-content"
        style={{
          flex: 1,
          padding: 'var(--spacing-layout-m)',
          maxWidth: 'var(--container-width-xl)',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </main>

      {/* ✅ HDS Core: Footer - Suoraan Drupalissa */}
      <Footer title="Helsingin kaupunki" theme="dark">
        <Footer.Base copyrightHolder="Helsingin kaupunki" copyrightText="Kaikki oikeudet pidätetään" />
      </Footer>
    </div>
  );
}
```

### Button Group (Action Hierarchy)

```tsx
<div style={{ display: 'flex', gap: 'var(--spacing-s)', flexWrap: 'wrap' }}>
  {/* ✅ HDS Core: Button (primary) - Main action */}
  <Button>Lähetä</Button>

  {/* ✅ HDS Core: Button (secondary) - Alternative action */}
  <Button variant="secondary">Tallenna luonnos</Button>

  {/* ✅ HDS Core: Button (supplementary) - Tertiary action */}
  <Button variant="supplementary">Peruuta</Button>
</div>
```

### Notification States

```tsx
// Success
<Notification type="success" label="Onnistui!">
  Lomake lähetetty onnistuneesti.
</Notification>

// Error
<Notification type="error" label="Virhe">
  Täytä kaikki pakolliset kentät.
</Notification>

// Info
<Notification type="info" label="Huomio">
  Palvelu on käytettävissä arkisin klo 8-16.
</Notification>

// Alert/Warning
<Notification type="alert" label="Varoitus">
  Istunto vanhenee 5 minuutin kuluttua.
</Notification>
```

---

## Anti-Patterns to Avoid

### ❌ DON'T: Use Non-HDS Components

```tsx
// Bad - using Material UI or other libraries
import { Button } from '@mui/material';
<Button variant="contained">Click</Button>

// Good - use HDS
import { Button } from 'hds-react';
<Button>Click</Button>
```

### ❌ DON'T: Skip Drupal Documentation

```tsx
// Bad - no documentation
<DateInput label="Date" />

// Good - documented
// ⚠️ HDS React: DateInput - VAATII Drupal-sovituksen
// Drupal: Date field + Flatpickr
<DateInput label="Date" />
```

### ❌ DON'T: Use Hardcoded Colors/Spacing

```tsx
// Bad - hardcoded values
<div style={{ color: '#333', padding: '24px' }}>

// Good - design tokens
<div style={{ color: 'var(--color-black-80)', padding: 'var(--spacing-m)' }}>
```

### ❌ DON'T: Forget Accessibility

```tsx
// Bad - missing label, no id
<TextInput placeholder="Enter name" />

// Good - proper labeling
<TextInput
  id="name"
  label="Nimi"
  required
  helperText="Etunimi ja sukunimi"
/>
```

### ❌ DON'T: Mix Multiple Primary Buttons

```tsx
// Bad - confusing hierarchy
<Button>Save</Button>
<Button>Submit</Button>
<Button>Publish</Button>

// Good - clear hierarchy
<Button>Publish</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="supplementary">Cancel</Button>
```

### ❌ DON'T: Ignore Form Error States

```tsx
// Bad - no error handling
<TextInput id="email" label="Email" value={email} onChange={...} />

// Good - with validation
<TextInput
  id="email"
  label="Email"
  value={email}
  onChange={...}
  invalid={!!errors.email}
  errorText={errors.email}
/>
```

---

## Checklist Before Completion

```
□ All components from hds-react
□ Design tokens for all styling
□ ✅/⚠️ comments on every component
□ Finnish language for UI text
□ Keyboard navigation works
□ Form labels properly associated
□ Error states handled
□ Responsive at all breakpoints
□ No TypeScript errors
□ DRUPAL_IMPLEMENTATION.md updated
```

---

## References

### Local Guide Files

- [HDS_OVERVIEW.md](../../../HDS_OVERVIEW.md) - System overview
- [HDS_COMPONENTS.md](../../../HDS_COMPONENTS.md) - Full component catalog
- [HDS_DESIGN_TOKENS.md](../../../HDS_DESIGN_TOKENS.md) - All token values
- [HDS_DRUPAL_MAPPING.md](../../../HDS_DRUPAL_MAPPING.md) - Drupal compatibility guide
- [HDS_WORKFLOW.md](../../../HDS_WORKFLOW.md) - Complete workflow

### Official Documentation

- HDS Docs: https://hds.hel.fi/
- Component Storybook: https://city-of-helsinki.github.io/helsinki-design-system/
- GitHub: https://github.com/City-of-Helsinki/helsinki-design-system
- NPM: https://www.npmjs.com/package/hds-react

---

*Helsinki Design System Skill for Codex*
