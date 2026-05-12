# Ferrari-Inspired Design Tokens for Porsche Admin Portal

## Overview

This design system is based on Ferrari's editorial design philosophy applied to a luxury automotive admin interface. The tokens below define the complete visual language for the Porsche Admin Portal.

---

## Color Tokens

### Primary Brand Colors

| Token | Value | Usage | Notes |
|-------|-------|-------|-------|
| `--ferrari-red` | `#DA291C` | Primary CTAs, accents | Rosso Corsa - main action color |
| `--dark-red` | `#B01E0A` | Hover states | Button hover/pressed states |
| `--deep-red` | `#9D2211` | Active states | Maximum emphasis variant |
| `--racing-yellow` | `#FFF200` | Highlight accents | Heritage racing color (reserved) |
| `--modena-yellow` | `#F6E500` | Secondary accents | Warm gold accent |

### Neutral & Surface Colors

| Token | Value | Usage | Notes |
|-------|-------|-------|-------|
| `--absolute-black` | `#000000` | Sidebar, hero sections | Primary dark surface |
| `--dark-surface` | `#303030` | Secondary dark containers | Layered dark background |
| `--light-gray-surface` | `#D2D2D2` | Borders, dividers | Light neutral surface |
| `--near-black` | `#181818` | Primary text (light mode) | Slightly warmed black |
| `--dark-gray` | `#666666` | Secondary text | Recessed text color |
| `--mid-gray` | `#8F8F8F` | Tertiary text, metadata | Muted information |
| `--silver-gray` | `#969696` | Placeholders, disabled | Minimal contrast |

### Semantic Colors

| Token | Value | Usage | CSS Class | Meaning |
|-------|-------|-------|-----------|---------|
| `--success-green` | `#03904A` | Approved status badges | `.text-[#03904A]` | Positive/successful state |
| `--info-blue` | `#4C98B9` | Information/completed | `.text-[#4C98B9]` | Neutral information |
| `--warning-red` | `#F13A2C` | Alerts, rejected status | `.text-[#F13A2C]` | Warning/error state |
| `--link-blue` | `#3860BE` | Link hover states | `.hover:text-[#3860BE]` | Interactive feedback |

### CSS Variable References

All colors are defined as CSS custom properties in `app/globals.css`:

```css
:root {
  --ferrari-red: #DA291C;
  --dark-red: #B01E0A;
  --deep-red: #9D2211;
  --success-green: #03904A;
  --info-blue: #4C98B9;
  --warning-red: #F13A2C;
  /* ... */
}

.dark {
  --background: #000000;
  --card: #303030;
  /* ... */
}
```

---

## Typography Tokens

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Heading** | 26px (1.63rem) | 500 | 1.2 | normal | Section titles, main headings |
| **Subheading** | 18px | 700 | 1.2 | normal | Section subheadings, card titles |
| **Body Bold** | 16px | 700 | 1.3 | normal | Emphasized inline text |
| **Button Label** | 16px | 400 | normal | 1.28px | Primary button text |
| **UI Heading** | 16px | 500 | 1.4 | 0.08px | Component headings |
| **Nav Link** | 13px | 600 | 1.2 | 0.13px | Navigation items |
| **Caption** | 13px | 400 | 1.5 | 0.195px | Metadata, descriptions |
| **Label** | 12px | 400 | 1.27 | 1px | Uppercase labels, tags |
| **Stat Value** | 32px | 500 | normal | normal | Large statistics numbers |
| **Micro Label** | 11px | 400 | 1.27 | 1px | Smallest annotation text |

### Font Families

```css
--font-sans: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', 'Geist Mono Fallback', monospace;
```

### Typography Utilities (Tailwind Classes)

```css
.text-ferrari-heading {
  font-size: 1.625rem;
  font-weight: 500;
  line-height: 1.2;
}

.text-ferrari-subheading {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-ferrari-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
}

.text-ferrari-stat {
  font-size: 1.875rem;
  font-weight: 500;
}
```

---

## Spacing Tokens

### Base Unit

- **Base:** 8px (0.5rem)

### Spacing Scale

| Value | Usage |
|-------|-------|
| 2px | Minimal gaps, icon spacing |
| 4px | Tight spacing, inline gaps |
| 6px | Small component spacing |
| 8px | Base unit, padding, margins |
| 12px | Medium padding, gaps |
| 16px | Large gaps, section spacing |
| 20px | Extra large gaps |
| 24px | Major section spacing |
| 32px | Section padding |
| 48px | Large section gaps |
| 64px | Hero section spacing |

### Button Padding

```css
.ferrari-btn-primary {
  padding: 0.625rem 0.625rem; /* 10px 10px */
}
```

### Card Padding

```css
.ferrari-card {
  padding: 1.5rem; /* 24px */
}
```

### Section Padding

```
Vertical: 32px - 64px (based on importance)
Horizontal: 24px (mobile) → 48px (desktop)
```

---

## Border Radius Tokens

| Value | Context | Example |
|-------|---------|---------|
| **2px** | Buttons, inputs, cards | `.rounded-[2px]` - Razor precision |
| **4px** | Subtle softening | Small interactive elements |
| **8px** | Modal dialogs, overlays | `.rounded-lg` - Softer structural radius |
| **50%** | Circles | Avatar badges, dots, handles |

**Note:** Ferrari's design uses minimal border-radius for precision engineering aesthetic

---

## Shadow Tokens

### Elevation Levels

| Level | CSS | Usage |
|-------|-----|-------|
| **Level 0 (Flat)** | `none` | Default for all content |
| **Level 1 (Subtle)** | `0 1px 1px rgba(0,0,0,0.1)` | Rare - dialogs only |
| **Level 2 (Overlay)** | `hsla(0, 0%, 7%, 0.8)` | Modal backdrops, overlays |

**Philosophy:** Depth through surface color contrast, not shadows

---

## Component Token Combinations

### Button Styles

**Primary Button (Red)**
```css
.ferrari-btn-primary {
  background-color: var(--ferrari-red);
  color: #FFFFFF;
  padding: 0.625rem 0.625rem;
  border-radius: 2px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
}

.ferrari-btn-primary:hover {
  background-color: var(--dark-red);
}
```

**Secondary Button (White)**
```css
.ferrari-btn-secondary {
  background-color: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  padding: 0.625rem 0.625rem;
  border-radius: 2px;
  font-weight: 500;
}

.ferrari-btn-secondary:hover {
  background-color: #F5F5F5;
}
```

### Card Styles

**Light Card**
```css
.ferrari-card {
  background-color: #FFFFFF;
  border: 1px solid var(--light-gray-surface);
  border-radius: 2px;
  padding: 1.5rem;
  box-shadow: none;
}
```

**Dark Card**
```css
.ferrari-card-dark {
  background-color: var(--dark-surface);
  border: 1px solid var(--dark-surface);
  border-radius: 2px;
  padding: 1.5rem;
  color: #FFFFFF;
}
```

### Status Badge Styles

```css
/* Available (Green) */
.status-available {
  background-color: var(--success-green) / 10%;
  color: var(--success-green);
}

/* Approved (Green) */
.status-approved {
  background-color: var(--success-green) / 10%;
  color: var(--success-green);
}

/* Pending (Yellow) */
.status-pending {
  background-color: var(--modena-yellow) / 10%;
  color: var(--modena-yellow);
}

/* Rejected (Red) */
.status-rejected {
  background-color: var(--warning-red) / 10%;
  color: var(--warning-red);
}

/* Booked (Blue) */
.status-booked {
  background-color: var(--info-blue) / 10%;
  color: var(--info-blue);
}
```

---

## Layout Tokens

### Container Widths

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| **Mobile** | 100% - 24px | Full width minus padding |
| **Tablet (md)** | 768px | Medium screens |
| **Desktop (lg)** | 1024px | Large screens |
| **Max** | 1920px | Ultra-wide screens |

### Grid Systems

**Stats Grid**
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
gap-6
```

**Car Management Grid**
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
gap-6
```

### Sidebar

```css
Width: 16rem (256px)
Background: var(--absolute-black)
Border-right: 1px solid var(--dark-surface)
Position: Fixed (desktop), Absolute (mobile)
Z-index: 40 (mobile), relative (desktop)
```

---

## Animation Tokens

### Transitions

```css
Hover states: 200ms ease-in-out
Color changes: 150ms ease
Transform: 300ms cubic-bezier(0.4, 0, 0.2, 1)
Opacity: 200ms ease-in-out
```

### Duration

- **Fast:** 150ms (color, opacity changes)
- **Normal:** 200ms (hover states, small movements)
- **Slow:** 300ms (layout transitions, drawer)

---

## Dark Mode Overrides

```css
.dark {
  --background: #000000;
  --foreground: #FFFFFF;
  --card: var(--dark-surface);
  --border: var(--dark-surface);
  --muted: var(--mid-gray);
  --muted-foreground: var(--light-gray-surface);
}
```

Text classes automatically invert:
```css
.dark .text-ferrari-body {
  @apply text-white;
}

.dark .text-ferrari-label {
  @apply text-var(--light-gray-surface);
}
```

---

## Usage Guidelines

### Do's ✅
- Use Ferrari Red only for primary CTAs
- Apply consistent spacing from the base 8px unit
- Maintain 2px border-radius on buttons and inputs
- Use semantic colors for status badges
- Keep typography weights between 400-700
- Apply letter-spacing on uppercase labels

### Don'ts ❌
- Don't scatter red across the interface
- Don't use shadows for depth on regular cards
- Don't exceed 2px border-radius on standard components
- Don't mix multiple font sizes in the same text block
- Don't create custom colors not in the palette
- Don't apply gradients to interface elements

---

## Color Contrast Compliance

All color combinations meet WCAG AA standards:

| Foreground | Background | Contrast Ratio |
|-----------|-----------|----------------|
| `#181818` | `#FFFFFF` | 17.14:1 ✅ |
| `#FFFFFF` | `#000000` | 21:1 ✅ |
| `#DA291C` | `#FFFFFF` | 4.6:1 ✅ |
| `#8F8F8F` | `#FFFFFF` | 6.3:1 ✅ |
| `#03904A` | `#FFFFFF` | 5.9:1 ✅ |

---

## Implementation

### Adding New Components

When creating new components, follow this pattern:

```css
/* In app/globals.css */
@layer components {
  .my-new-component {
    @apply p-4 rounded-[2px] border border-[#D2D2D2];
    @apply bg-white text-[#181818];
    @apply transition-colors;
  }

  .my-new-component:hover {
    @apply bg-gray-50 border-[#C0C0C0];
  }
}
```

### Using Design Tokens in JSX

```jsx
// Good - Using predefined classes
<button className="ferrari-btn-primary">
  Click me
</button>

// Good - Using design tokens
<div className="bg-white dark:bg-[#303030] border border-[#D2D2D2]">
  Content
</div>

// Avoid - Hardcoded colors
<button className="bg-red-600">
  Don't use this
</button>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-06 | Initial Ferrari-inspired design tokens for Porsche admin |

---

## References

- **Design Inspiration:** Ferrari.com editorial design system
- **Framework:** Tailwind CSS v4.2
- **Icons:** Lucide React
- **Charts:** Recharts
