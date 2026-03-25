# Frontend Development Guide

> Follow these rules strictly to maintain consistency across the codebase.

---

## 1. Project Structure (FSD Architecture)

### Layer Hierarchy

```
app/
├── app/           # Global providers, Zustand stores
├── pages/         # Page compositions (route-level)
├── widgets/       # Complex composite components
├── features/      # User interactions, business logic
├── entities/      # Domain models, API, data
└── shared/        # Reusable utilities, UI, config
```

### Layer Rules

| Layer    | Can Import From                            | Cannot Import From            |
| -------- | ------------------------------------------ | ----------------------------- |
| app      | pages, widgets, features, entities, shared | -                             |
| pages    | widgets, features, entities, shared        | app                           |
| widgets  | features, entities, shared                 | app, pages                    |
| features | entities, shared                           | app, pages, widgets           |
| entities | shared                                     | app, pages, widgets, features |
| shared   | -                                          | all other layers              |

### Segment Structure

| Segment      | Purpose                            | Used In            |
| ------------ | ---------------------------------- | ------------------ |
| `api/`       | API functions + `hooks/` subfolder | entities, features |
| `ui/`        | React components                   | all layers         |
| `lib/`       | Custom hooks, utilities            | features, shared   |
| `model/`     | Types, interfaces                  | entities, features |
| `config/`    | Constants                          | shared             |
| `store/`     | Zustand stores                     | app only           |
| `providers/` | React providers                    | app only           |

---

## 2. Creating New Code

### Adding a New Entity

```
entities/[entity-name]/
├── api/
│   ├── get-[entity].ts
│   ├── create-[entity].ts
│   ├── update-[entity].ts
│   ├── delete-[entity].ts
│   ├── hooks/
│   │   ├── useGet[Entity].ts
│   │   ├── useCreate[Entity].ts
│   │   └── index.ts
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── ui/
│   ├── [Entity]Card.tsx
│   └── index.ts
└── index.ts
```

### Adding a New Feature

```
features/[feature-name]/
├── lib/
│   ├── use[Feature].ts
│   └── index.ts
├── ui/
│   ├── [Feature]Form.tsx
│   └── index.ts
└── index.ts
```

### Adding a New Widget

```
widgets/[widget-name]/
├── ui/
│   ├── [Widget].tsx
│   └── index.ts
└── index.ts
```

---

## 3. Import Rules

### Cross-Layer Imports (Absolute Path)

Always use `app/` prefix:

```typescript
// CORRECT
import { Button } from "app/shared/ui";
import { useGetUser } from "app/entities/user";
import { LoginForm } from "app/features/auth";

// WRONG
import { Button } from "../../../shared/ui";
import { Button } from "@/shared/ui";
```

### Same-Slice Imports (Relative Path)

```typescript
// Inside features/auth/ui/LoginForm.tsx
import { useAuth } from "../lib"; // CORRECT
import { useAuth } from "app/features/auth/lib"; // Also OK but verbose
```

### Import Grouping Order

```typescript
// 1. External libraries
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. App layer imports
import { useUserStore } from "app/app/store";

// 3. Other FSD layers (top to bottom)
import { Sidebar } from "app/widgets/sidebar";
import { LoginForm } from "app/features/auth";
import { useGetUser } from "app/entities/user";
import { Button, Input } from "app/shared/ui";
import { axiosInstance } from "app/shared/lib";

// 4. Relative imports (same slice)
import { useFeatureHook } from "../lib";
import type { IFeatureProps } from "../model";
```

---

## 4. TypeScript Conventions

### Naming

| Type               | Convention        | Example                         |
| ------------------ | ----------------- | ------------------------------- |
| Interface          | `I` + PascalCase  | `IUserProps`, `IAuthState`      |
| Type (union/combo) | PascalCase        | `ButtonVariant`, `AuthStatus`   |
| Component          | PascalCase        | `UserCard`, `LoginForm`         |
| Hook               | use + PascalCase  | `useAuth`, `useGetUser`         |
| API function       | kebab-case file   | `get-user.ts`, `update-user.ts` |
| Store              | camelCase + Store | `userStore.ts`                  |
| Utility            | camelCase         | `formatDate`, `truncate`        |

### Rules

```typescript
// Use interface for object shapes
interface IUserProps {
  name: string;
  email: string;
}

// Use type for unions/combinations
type ButtonVariant = "primary" | "secondary" | "outlined";
type UserOrNull = IUser | null;

// Always use const - never use let
const Component = () => {};
const value = "string";

// Arrow functions for components
export const UserCard = ({ user }: IUserCardProps) => {
  return <div>{user.name}</div>;
};

// No any - use unknown or proper types
const handleError = (error: unknown) => {};

// as const is the only allowed assertion
const STATUSES = ["active", "inactive"] as const;
```

---

## 5. Code Patterns

### API Function

```typescript
// entities/user/api/get-user.ts
import { isAxiosError } from "axios";
import { axiosInstance } from "app/shared/lib";
import { ValidationError } from "app/shared/api";
import type { IGetUserResponse } from "../model";

export const getUser = async (userId: string): Promise<IGetUserResponse> => {
  try {
    const response = await axiosInstance.get<IGetUserResponse>(
      `users/${userId}`,
    );
    return response.data;
  } catch (error) {
    if (isAxiosError<ValidationError>(error)) {
      throw new Error(
        error.response?.data?.detail?.[0]?.msg || "Validation error",
      );
    }
    throw error;
  }
};
```

### React Query Hook

```typescript
// entities/user/api/hooks/useGetUser.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUser } from "../get-user";
import type { IUser, IGetUserResponse } from "../../model";

export function useGetUser(
  userId: string,
  options?: Omit<
    UseQueryOptions<IGetUserResponse, Error, IUser>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<IGetUserResponse, Error, IUser>({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    select: (response) => response.data,
    enabled: !!userId,
    ...options,
  });
}
```

### Zustand Store

```typescript
// app/app/store/userStore.ts
import { create } from "zustand";
import type { IUser } from "app/entities/user";

interface IUserState {
  // State
  user: IUser | null;
  isLoading: boolean;

  // Actions
  setUser: (user: IUser | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<IUserState>((set) => ({
  // State
  user: null,
  isLoading: false,

  // Actions
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### React Component

```typescript
// features/auth/ui/LoginForm.tsx
"use client";

import { useState, useCallback } from "react";
import { Button, Input } from "app/shared/ui";
import { useAuth } from "../lib";

interface ILoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: ILoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await login(email, password);
      if (success) onSuccess?.();
    },
    [email, password, login, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Login"}
      </Button>
    </form>
  );
};
```

### Public API (index.ts)

```typescript
// entities/user/index.ts
export * from "./api";
export * from "./model";
export * from "./ui";

// entities/user/api/index.ts
export * from "./get-user";
export * from "./update-user";
export * from "./delete-user";
export * from "./hooks";
```

---

## 6. Styling (Tailwind)

### Rules

- Tailwind only - no inline styles or `style` prop
- Use `clsx` for conditional classes
- Mobile-first responsive design (`sm:`, `md:`, `lg:`)

### Class Order

```typescript
className={clsx(
  // 1. Layout
  'flex flex-col items-center',
  // 2. Sizing
  'w-full max-w-md h-auto',
  // 3. Spacing
  'p-4 m-2 gap-4',
  // 4. Typography
  'text-base font-medium',
  // 5. Colors
  'bg-white text-neutral-900 border-neutral-200',
  // 6. Effects
  'shadow-md opacity-100',
  // 7. Transitions
  'transition-all duration-200',
  // 8. Conditional
  { 'opacity-50': disabled },
)}
```

---

## 7. Comments

```typescript
// File-level: describe layer and purpose
// Entity layer: API functions for user domain

// Complex logic only
const calculateDiscount = (price: number, tier: string) => {
  // Apply tier-based discount: premium gets 20%, standard gets 10%
  const discountRate = tier === "premium" ? 0.2 : 0.1;
  return price * (1 - discountRate);
};
```

---

## 8. Common Mistakes to Avoid

| Mistake                           | Correct                             |
| --------------------------------- | ----------------------------------- |
| `import { x } from '@/shared/ui'` | `import { x } from 'app/shared/ui'` |
| `interface UserProps`             | `interface IUserProps`              |
| `const x: any`                    | `const x: unknown` or proper type   |
| `function Component()`            | `const Component = () => {}`        |
| Inline styles                     | Tailwind classes                    |
| `for` loops                       | `map`/`filter`/`reduce`             |
| Nested if-else                    | Early returns                       |
| `useEffect` for fetching          | React Query hooks                   |
| `let` variable                    | `const` with immutable patterns     |

## 9. Web Accessibility (A11y)

### Semantic HTML

- Use semantic tags: `<button>` for actions, `<a>` for navigation, `<header>`, `<main>`, `<nav>`, `<footer>`
- Use `<article>` for self-contained content, `<section>` for thematic grouping
- Use `<time datetime="">` for dates and times
- Never use `<div>` or `<span>` for clickable elements without proper role/tabIndex
- Use heading hierarchy properly: `<h1>` to `<h6>` in order without skipping levels
- One `<main>` landmark per page, use landmark roles appropriately

### Images & Media

- All `<img>` must have `alt` attribute (empty `alt=""` for decorative images)
- Icons with meaning need `aria-label` or visually hidden text

### Forms

- Every input must have associated `<label>` (htmlFor/id matching)
- Use `aria-describedby` for error messages and helper text
- Use `aria-invalid="true"` for invalid form fields
- Group related inputs with `<fieldset>` and `<legend>`

### Keyboard Navigation

- All interactive elements must be keyboard accessible (Tab, Enter, Space, Escape)
- Never remove focus styles; customize with `focus-visible` if needed
- Maintain logical tab order; avoid positive `tabIndex` values
- Trap focus inside modals/dialogs and return focus on close
- Implement roving tabindex for component lists (radio groups, toolbars, menus)
- Dropdowns/Menus: Arrow keys for navigation, Enter to select, Escape to close
- Modals: Focus first focusable element on open, Escape to close

### ARIA Usage

- Don't use ARIA when native HTML works (prefer `<button>` over `<div role="button">`)
- Use `aria-label` or `aria-labelledby` for elements without visible text
- Use `aria-expanded` for collapsible content (accordion, dropdown)
- Use `aria-hidden="true"` for decorative/duplicate content
- Use `role="dialog"` with `aria-modal="true"` and `aria-labelledby` for modals
- Use `aria-live` regions for dynamic content updates (toasts, alerts)
- Use `aria-current="page"` for current navigation item
- Use `aria-pressed` for toggle buttons
- Loading states: `aria-busy="true"` or `aria-live="polite"`

### Color & Visual

- Maintain color contrast ratio of 4.5:1 (text) and 3:1 (UI elements)
- Never convey information by color alone; add icons or text

### Interactive Components

- Buttons: use `<button type="button">` (prevent form submit) or `type="submit"`
- Links: use `<a href>` for navigation; add `target="_blank" rel="noopener noreferrer"` for external links
- Modals: include close button, handle Escape key, return focus on close
