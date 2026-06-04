# Porsche Design Tokens

## Vai Trò

`frontend/src/index.css` là source of truth kỹ thuật cho CSS variables, Tailwind v4 `@theme inline`, utility class và component class.

Tài liệu này chỉ mô tả các token đang có để thiết kế, review và triển khai thống nhất. Nếu có xung đột, ưu tiên:

`index.css > base components > DESIGN_TOKENS.md > DESIGN.md`

## Color Tokens

### Brand

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--brand-red` | `#DA291C` | `brand-red` | Primary CTA, accents |
| `--dark-red` | `#B01E0A` | `dark-red` | Hover state for red actions |
| `--deep-red` | `#9D2211` | `deep-red` | Pressed/active state |
| `--racing-yellow` | `#FFF200` | `racing-yellow` | Reserved heritage accent |
| `--modena-yellow` | `#F6E500` | `modena-yellow` | Reserved warm accent |

### Surfaces And Text

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--absolute-black` | `#000000` | `absolute-black` | Dark cinematic sections |
| `--dark-surface` | `#303030` | `dark-surface` | Secondary dark surfaces |
| `--light-gray-surface` | `#D2D2D2` | `light-gray-surface` | Borders and dividers |
| `--near-black` | `#181818` | `near-black` | Primary text |
| `--dark-gray` | `#666666` | `dark-gray` | Secondary text |
| `--mid-gray` | `#8F8F8F` | `mid-gray` | Metadata and quiet labels |
| `--silver-gray` | `#969696` | `silver-gray` | Placeholder/disabled tone |

### Semantic

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--warning-red` | `#F13A2C` | `warning-red` | Error and warning state |
| `--success-green` | `#03904A` | `success-green` | Success state |
| `--info-blue` | `#4C98B9` | `info-blue` | Informational state |
| `--link-blue` | `#3860BE` | `link-blue` | Link hover/active feedback |

## Layout Tokens

| Token | Value | Tailwind Example | Usage |
|---|---:|---|---|
| `--container-showroom` | `110rem` | `max-w-showroom` | Wide showroom pages |
| `--container-page` | `100rem` | `max-w-page` | Wide page content |
| `--container-modal` | `31.25rem` | `max-w-modal` | Standard modal |
| `--container-modal-wide` | `32.5rem` | `max-w-modal-wide` | Wider modal |
| `--container-toolbar-code` | `12.5rem` | `max-w-toolbar-code` | Toolbar code text |
| `--container-toolbar-price` | `11.25rem` | `max-w-toolbar-price` | Toolbar price/model text |
| `--container-mobile-model-name` | `50%` | `max-w-mobile-model-name` | Mobile toolbar model label |
| `--container-bottom-bar-model` | `13.75rem` | `max-w-bottom-bar-model` | Bottom bar model label |

## Typography Tokens

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--text-heading` | `1.625rem / 1.2` | `text-heading` | Section headings |
| `--text-subheading` | `1.125rem / 1.2` | `text-subheading` | Compact section headings |
| `--text-caption` | `0.8125rem / 1.5` | `text-caption` | Metadata and descriptions |
| `--text-eyebrow` | `0.625rem / 0.875rem` | `text-eyebrow` | Uppercase labels |
| `--tracking-porsche` | `0.16em` | `tracking-porsche` | Porsche-style uppercase spacing |
| `--tracking-label` | `0.0625rem` | `tracking-label` | Dense UI labels |

## Layering And Viewer Tokens

| Token | Value | Tailwind | Usage |
|---|---:|---|---|
| `--z-toolbar` | `40` | `z-toolbar` | Sticky toolbar/bottom bar |
| `--z-overlay` | `50` | `z-overlay` | Page overlays |
| `--z-modal` | `60` | `z-modal` | Modals |
| `--height-viewer-mobile` | `22.5rem` | `min-h-viewer-mobile` | Mobile configurator viewer |
| `--height-viewer-desktop` | `35rem` | `md:min-h-viewer-desktop` | Desktop configurator viewer |

## Component Utilities

Defined in `frontend/src/index.css`:

- `.porsche-btn-primary`
- `.porsche-btn-secondary`
- `.porsche-btn-ghost`
- `.porsche-card`
- `.porsche-card-dark`
- `.porsche-heading`
- `.porsche-subheading`
- `.porsche-label`
- `.porsche-stat-label`
- `.porsche-border-subtle`
- `.text-porsche-heading`
- `.text-porsche-subheading`
- `.text-porsche-body`
- `.text-porsche-label`
- `.text-porsche-stat`

## Implementation Rules

- Dùng token màu thay vì hardcode hex khi token đã có.
- Dùng token typography thay vì `text-[...]` khi giá trị có ý nghĩa UI lặp lại.
- Dùng `max-w-showroom`, `max-w-modal`, `z-modal`, `text-eyebrow` thay cho arbitrary class tương đương.
- Nếu cần giá trị mới, thêm token semantic vào `frontend/src/index.css` trước rồi mới dùng trong JSX.
- `DESIGN.md` chỉ mô tả visual direction Porsche/luxury/editorial, không khai báo token kỹ thuật.
