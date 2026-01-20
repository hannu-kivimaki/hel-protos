---
name: helsinki-content
description: Helsinki city content guidelines. Use when writing UI text, labels, messages, or any user-facing content.
---

# Helsinki Content Skill

Quick reference for writing UI content for City of Helsinki prototypes.

---

## Quick Principles

1. **Write in Finnish** - Primary language for all Helsinki services
2. **Use plain language** - Selkokieli principles: short sentences, common words
3. **Be action-oriented** - Tell users what to do, not what happened
4. **Consider accessibility** - Clear, descriptive text for all users

---

## Common Patterns - Ready to Use

### Buttons

```tsx
// Primary actions
<Button>Lähetä</Button>           // Submit
<Button>Tallenna</Button>         // Save
<Button>Jatka</Button>            // Continue
<Button>Vahvista</Button>         // Confirm
<Button>Kirjaudu</Button>         // Sign in
<Button>Varaa aika</Button>       // Book appointment

// Secondary actions
<Button variant="secondary">Peruuta</Button>      // Cancel
<Button variant="secondary">Takaisin</Button>     // Back
<Button variant="secondary">Muokkaa</Button>      // Edit
<Button variant="secondary">Esikatsele</Button>   // Preview

// Supplementary actions
<Button variant="supplementary">Sulje</Button>    // Close
<Button variant="supplementary">Ohita</Button>    // Skip

// Destructive actions
<Button variant="danger">Poista</Button>          // Delete
```

### Form Labels

```tsx
// Personal information
<TextInput label="Etunimi" />          // First name
<TextInput label="Sukunimi" />         // Last name
<TextInput label="Henkilötunnus" />    // Personal ID

// Contact information
<TextInput label="Sähköpostiosoite" type="email" />  // Email
<TextInput label="Puhelinnumero" type="tel" />       // Phone

// Address
<TextInput label="Katuosoite" />       // Street address
<TextInput label="Postinumero" />      // Postal code
<TextInput label="Postitoimipaikka" /> // City

// Other common fields
<TextArea label="Viesti" />            // Message
<TextArea label="Lisätiedot" />        // Additional info
<DateInput label="Päivämäärä" />       // Date
<Select label="Valitse..." />          // Select...
```

### Helper Text

```tsx
// Format guidance
helperText="Muodossa ppkkvv-XXXX"           // Personal ID format
helperText="Esimerkiksi +358 40 123 4567"   // Phone format
helperText="Enintään 1000 merkkiä"          // Character limit

// Instructions
helperText="Pakollinen kenttä"                          // Required field
helperText="Lähetämme vahvistuksen tähän osoitteeseen"  // Confirmation info
helperText="Hae paikkaa vähintään 4 kuukautta ennen"    // Application timing
```

### Error Messages

```tsx
// Validation errors
errorText="Pakollinen tieto"                            // Required
errorText="Anna kelvollinen sähköpostiosoite"           // Invalid email
errorText="Puhelinnumero on virheellinen"               // Invalid phone
errorText="Tarkista henkilötunnus"                      // Invalid ID
errorText="Päivämäärä ei voi olla menneisyydessä"       // Past date
errorText="Tiedosto on liian suuri (max 10 MB)"         // File too large

// Form-level errors
<Notification type="error" label="Tarkista tiedot">
  Lomakkeessa on virheitä. Korjaa merkityt kentät.
</Notification>
```

### Success Messages

```tsx
// Confirmations
<Notification type="success" label="Tallennettu">
  Muutokset on tallennettu.
</Notification>

<Notification type="success" label="Lähetetty">
  Hakemuksesi on vastaanotettu.
</Notification>

<Notification type="success" label="Aika varattu">
  Lähetimme vahvistuksen sähköpostiisi.
</Notification>
```

### Info & Alert Messages

```tsx
// Information
<Notification type="info" label="Käsittelyaika">
  Käsittelyaika on noin 2–3 viikkoa.
</Notification>

// Warnings
<Notification type="alert" label="Tallenna työsi">
  Istuntosi vanhenee 5 minuutin kuluttua.
</Notification>
```

### Loading States

```tsx
<LoadingSpinner aria-label="Ladataan..." />

// Loading messages
"Ladataan..."           // Loading...
"Tallennetaan..."       // Saving...
"Lähetetään..."         // Submitting...
"Haetaan tietoja..."    // Fetching data...
```

---

## Multilingual Requirements

### Language Priority

1. **Finnish** - Primary, always required
2. **Swedish** - Legally required for official City of Helsinki services
3. **English** - Recommended for services with international users

### Quick Translation Reference

| Finnish | Swedish | English |
|---------|---------|---------|
| Lähetä | Skicka | Submit |
| Tallenna | Spara | Save |
| Peruuta | Avbryt | Cancel |
| Takaisin | Tillbaka | Back |
| Jatka | Fortsätt | Continue |
| Sulje | Stäng | Close |
| Hae | Sök | Search |
| Kirjaudu | Logga in | Sign in |
| Kirjaudu ulos | Logga ut | Sign out |

### Language Selector

```tsx
// Always include language options in header
const languages = [
  { label: 'Suomi', code: 'fi' },
  { label: 'Svenska', code: 'sv' },
  { label: 'English', code: 'en' },
];
```

---

## Accessibility Rules

### Link Text

```tsx
// ❌ Bad - unclear
<Link href="/info">Klikkaa tästä</Link>
<Link href="/info">Lisää</Link>
<Link href="/info">Lue lisää</Link>

// ✅ Good - descriptive
<Link href="/info">Lue lisää päivähoidosta</Link>
<Link href="/info">Katso palvelun yhteystiedot</Link>
<Link href="/info">Avaa hakemuslomake</Link>
```

### Alt Text

```tsx
// Decorative images - empty alt
<img src="/decorative.jpg" alt="" />

// Informative images - describe content
<img src="/kaupungintalo.jpg" alt="Helsingin kaupungintalo" />

// Functional images - describe action
<img src="/search-icon.svg" alt="Hae sivustolta" />
```

### Error Messages

```tsx
// ❌ Bad - vague
errorText="Virhe"
errorText="Tarkista kenttä"

// ✅ Good - actionable
errorText="Anna kelvollinen sähköpostiosoite (esim. nimi@esimerkki.fi)"
errorText="Valitse vähintään yksi vaihtoehto"
```

### Form Labels

```tsx
// ❌ Bad - missing labels
<TextInput placeholder="Kirjoita nimi" />

// ✅ Good - proper labels
<TextInput
  id="name"
  label="Etunimi"
  required
  helperText="Kirjoita nimi kuten se on henkilöllisyystodistuksessa"
/>
```

---

## Anti-Patterns to Avoid

### ❌ Bureaucratic Language

```tsx
// Bad
"Anomus on vastaanotettu käsiteltäväksi"
"Täytä alla olevat kohdat huolellisesti"

// Good
"Hakemuksesi on vastaanotettu"
"Täytä lomake"
```

### ❌ Unclear Error Messages

```tsx
// Bad
errorText="Virheellinen syöte"
errorText="Validointivirhe"

// Good
errorText="Anna puhelinnumero muodossa +358 40 123 4567"
```

### ❌ "Click Here" Links

```tsx
// Bad
<Link href="/form">Klikkaa tästä</Link>
<Link href="/form">täältä</Link>

// Good
<Link href="/form">Siirry hakemuslomakkeeseen</Link>
```

### ❌ Missing Required Indicators

```tsx
// Bad - no indication of required fields
<TextInput label="Nimi" />

// Good - clear required marking
<TextInput label="Nimi" required />
// Or in helper text:
<TextInput label="Nimi" helperText="Pakollinen kenttä" />
```

### ❌ Forgetting Swedish

```tsx
// Bad - Finnish only for official service
const submitButton = "Lähetä";

// Good - plan for Swedish
const submitButton = {
  fi: "Lähetä",
  sv: "Skicka",
  en: "Submit"
};
```

---

## Content Checklist

Before completing a prototype:

```
□ All UI text in proper Finnish
□ Swedish translations planned or marked
□ Button labels are action verbs
□ Form labels describe the field content
□ Error messages explain how to fix the problem
□ Success messages confirm what happened
□ Link text describes the destination
□ Alt text provided for meaningful images
□ No "lorem ipsum" placeholder text
□ No jargon or bureaucratic language
```

---

## When to Reference Full Guides

| Need | Guide |
|------|-------|
| Complex service descriptions | [CONTENT_GUIDE.md](../../../CONTENT_GUIDE.md) |
| Complete trilingual examples | [CONTENT_EXAMPLES.md](../../../CONTENT_EXAMPLES.md) |
| Writing style principles | [CONTENT_GUIDE.md](../../../CONTENT_GUIDE.md) |
| Full form examples | [CONTENT_EXAMPLES.md](../../../CONTENT_EXAMPLES.md) |
| Accessibility guidelines | [CONTENT_GUIDE.md](../../../CONTENT_GUIDE.md) |
| Service scenarios | [CONTENT_EXAMPLES.md](../../../CONTENT_EXAMPLES.md) |

---

*Helsinki Content Skill for Codex*
