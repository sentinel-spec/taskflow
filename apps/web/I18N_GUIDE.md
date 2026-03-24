# Internationalization (i18n) Guide

## Overview

This project uses `next-intl` v4 for internationalization with **cookie-based locale storage**. The locale is stored in cookies, so URLs remain clean (e.g., `/workspace` instead of `/en/workspace`).

**Features:**
- ✅ Clean URLs without locale prefix
- ✅ No flicker on page reload
- ✅ Locale persists across sessions (1 year cookie)
- ✅ Server-side locale detection
- ✅ Easy to add more languages

## Architecture

### Key Files

```
├── messages/                    # Translation JSON files
│   ├── en.json                  # English translations
│   └── ru.json                  # Russian translations
├── next.config.ts               # Next.js config with next-intl plugin
├── src/
│   ├── proxy.ts                 # Middleware for locale detection
│   ├── i18n/
│   │   ├── config.ts            # Locale configuration
│   │   ├── routing.ts           # Routing configuration (cookie settings)
│   │   ├── request.ts           # Server-side request config (reads cookies)
│   │   └── hooks.ts             # Client-side translation hooks
│   ├── components/
│   │   └── language-switcher.tsx # Language switcher component
│   └── app/
│       └── layout.tsx           # Root layout with NextIntlClientProvider
```

## How It Works

1. **First Visit**: Middleware detects browser's preferred language
2. **Language Change**: When user selects a language, it's saved to a cookie (`NEXT_LOCALE`)
3. **Subsequent Visits**: Server reads the cookie and renders in the saved locale
4. **No URL Changes**: URLs stay clean (`/workspace` not `/en/workspace`)

## Adding New Languages

### 1. Add locale to config

Edit `src/i18n/config.ts`:

```typescript
export const locales = ["en", "ru", "de"] as const; // Add new locale
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  de: "Deutsch", // Add new language name
};
```

### 2. Create translation file

Create `messages/de.json`:

```json
{
  "common": {
    "loading": "Laden...",
    // ... copy structure from en.json
  },
  "auth": {
    "signIn": "Anmelden",
    // ... copy structure from en.json
  }
  // ... rest of translations
}
```

### 3. That's it!

The middleware and all components will automatically support the new language.

## Using Translations in Components

### Client Components (use client)

```typescript
"use client";

import { useAuthTranslations } from "@/i18n/hooks";

export function MyComponent() {
  const t = useAuthTranslations(); 
  
  return (
    <div>
      <h1>{t("signInTitle")}</h1>
      <p>{t("signInSubtitle")}</p>
    </div>
  );
}
```

### Available Hooks

```typescript
import { 
  useAuthTranslations,      // auth.*
  useWorkspaceTranslations, // workspace.*
  useCommonTranslations,    // common.*
  useOnboardingTranslations,// onboarding.*
  useNavigationTranslations,// navigation.*
  useValidationTranslations,// validation.*
} from "@/i18n/hooks";
```

### Server Components

```typescript
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("auth");
  
  return (
    <div>
      <h1>{t("signInTitle")}</h1>
    </div>
  );
}
```

## Adding New Translation Keys

### 1. Add to both JSON files

`messages/en.json`:
```json
{
  "myNewKey": "My new text"
}
```

`messages/ru.json`:
```json
{
  "myNewKey": "Мой новый текст"
}
```

### 2. Use in components

```typescript
const t = useTranslations();
<p>{t("myNewKey")}</p>
```

## Language Switcher

Use the built-in language switcher component:

```typescript
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

**How it works:**
- Detects current locale from context
- Sets cookie with new locale on change
- Reloads page to apply new locale (server re-renders with correct language)

## Cookie Configuration

Cookie settings in `src/i18n/routing.ts`:

```typescript
cookie: {
  name: "NEXT_LOCALE",
  options: {
    httpOnly: false,      // Accessible from client JS
    secure: true,         // HTTPS only in production
    sameSite: "lax",
    path: "/",
    maxAge: 31536000,     // 1 year
  },
}
```

## URL Structure

**Clean URLs - no locale prefix:**
- `/` - Home (uses cookie locale or browser default)
- `/workspace` - Workspace page
- `/workspace/create` - Create workspace

The middleware automatically:
- Detects user's preferred language from browser
- Reads/writes locale cookie
- Serves correct language without URL changes

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Group translations logically** - Use namespaces (auth, workspace, common, etc.)
3. **Keep JSON structure consistent** - Same keys in all language files
4. **Use hooks in client components** - `useAuthTranslations()`, etc.
5. **Use getTranslations in server components** - For SSR translations

## Example: Complete Component

```typescript
"use client";

import React from "react";
import { useAuthTranslations, useCommonTranslations } from "@/i18n/hooks";

export function LoginForm() {
  const t = useAuthTranslations();
  const tc = useCommonTranslations();
  
  return (
    <form>
      <label>{t("emailAddress")}</label>
      <input placeholder={t("emailPlaceholder")} />
      
      <label>{t("password")}</label>
      <input type="password" placeholder={t("passwordPlaceholder")} />
      
      <button type="submit">
        {tc("loading")}
      </button>
    </form>
  );
}
```

## Troubleshooting

### "Wrong language showing"
1. Check cookie value in browser DevTools → Application → Cookies
2. Clear cookie and reload to reset to browser default
3. Use language switcher to change locale

### "Translations not showing"
1. Check that the key exists in BOTH `en.json` and `ru.json`
2. Make sure you're using the correct hook for your namespace
3. Verify the JSON structure matches your translation path

### "Language doesn't persist after reload"
1. Check if cookies are enabled in browser
2. Verify cookie is being set (DevTools → Application → Cookies)
3. Check cookie name matches: `NEXT_LOCALE`

## Testing

```bash
yarn dev
```

1. Open `http://localhost:3000`
2. Use language switcher to change to Russian
3. Navigate around - language should persist
4. Refresh page - language should persist (cookie-based)
5. Check URL - should NOT contain locale prefix
