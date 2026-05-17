# UI Context

## Theme

The overall visual language is a dark technical workspace. It is characterized by:

- Dark backgrounds
- Layered surfaces
- Vivid accent colors for interactive elements

## Colors

The following CSS custom properties are used to define the color tokens:

| Role            | CSS Variable       | Value    |
| --------------- | ------------------ | -------- |
| Page background | `--bg-base`        | `#[hex]` |
| Surface         | `--bg-surface`     | `#[hex]` |
| Primary text    | `--text-primary`   | `#[hex]` |
| Muted text      | `--text-muted`     | `#[hex]` |
| Primary accent  | `--accent-primary` | `#[hex]` |
| Border          | `--border-default` | `#[hex]` |
| Error           | `--state-error`    | `#[hex]` |
| Success         | `--state-success`  | `#[hex]` |

## Typography

The following typography is used:

| Role      | Font              | Variable      |
| --------- | ----------------- | ------------- |
| UI text   | [e.g. Geist Sans] | `--font-sans` |
| Code/mono | [e.g. Geist Mono] | `--font-mono` |

## Border Radius

The following border radius values are used:

| Context           | Class            |
| ----------------- | ---------------- |
| Inline / small UI | `rounded-[size]` |
| Cards / panels    | `rounded-[size]` |
| Modals / overlays | `rounded-[size]` |

## Component Library

The component library is based on shadcn/ui on top of Tailwind. Components can be found in the `components/ui/` directory. New components can be added using the CLI rather than writing from scratch.

## Layout Patterns

The following layout patterns are used:

- Editor: full-viewport split with left sidebar, center canvas, right sidebar
- Sidebars: fixed width with border separator
- Modals: centered overlay with backdrop blur
- Navbar: top bar with bottom border

## Icons

Lucide React is used for stroke-based icons. The sizes used are:

- `h-4 w-4` for inline icons
- `h-5 w-5` for button icons
