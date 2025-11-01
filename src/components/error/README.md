# Error Page Component

A reusable error page component with animated robot illustration and gradient styling.

## Structure

```
src/
├── components/
│   └── error/
│       ├── ErrorPage.jsx    # Reusable error page component
│       └── README.md         # This file
└── app/
    ├── not-found.js          # 404 handler (uses ErrorPage)
    ├── error.js              # Runtime error handler (uses ErrorPage)
    └── global-error.js       # Critical error handler (standalone)
```

## Component: ErrorPage

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Oops!" | Main heading text |
| `buttonText` | string | "Take me Home" | Button label |
| `onAction` | function | - | Button click handler |

### Features

- **Transparent Button** with gradient text (White → Gold)
- **Animated Robot** with floating effect
- **Spinning Gears** decorative elements
- **Responsive Design** (mobile & desktop)
- **Dark Background** (#101014)

### Usage

```jsx
import ErrorPage from '@/components/error/ErrorPage';

<ErrorPage 
  title="Oops!"
  buttonText="Go Home"
  onAction={() => router.push('/')}
/>
```

## Design Specifications

### Colors
- Background: `#101014`
- Button Gradient: `#FFFFFF` → `#D4AF37`
- Gear Color: `#6B7280`
- Accent Gold: `#F9BD1D`

### Animations
- `float-gentle`: Robot floating animation (4s)
- `pulse-glow`: Glow effect (2s)
- `gear-spin`: Clockwise rotation (4s)
- `gear-spin-reverse`: Counter-clockwise (3s)
- `bounceIn`: Title entrance animation
- `slideUp`: Button entrance animation

## Error Handling Flow

1. **404 Errors** → `not-found.js` → `ErrorPage` component
2. **Runtime Errors** → `error.js` → `ErrorPage` component
3. **Critical Errors** → `global-error.js` → Standalone page

