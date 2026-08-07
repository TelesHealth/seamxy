---
name: SeamXY brand tokens
description: Authoritative color palette and type tokens after the crimson rebrand — use for all new SeamXY work including slides, mobile, and web pages.
---

# SeamXY Brand Tokens (post-crimson rebrand)

## Colors
- **Primary red (accent/CTA/active)**: `#CC1519` — all buttons, nav active pills, interactive tabs, link accents, italic emphasis text
- **Dark background**: `#111111` — dark card sections, advisor note panels, dark feature cards; NOT used for interactive states
- **Warm white base**: `#FAF6F2` — page background base color
- **Text**: foreground token (near-black via CSS var), not navy

## Gradient (`.seamxy-bg` class)
```css
background:
  radial-gradient(ellipse 65% 90% at -5% 50%, rgba(255, 170, 170, 0.32) 0%, transparent 65%),
  radial-gradient(ellipse 55% 65% at 55% 10%, rgba(255, 230, 225, 0.30) 0%, transparent 60%),
  radial-gradient(ellipse 55% 70% at 100% 65%, rgba(200, 218, 255, 0.35) 0%, transparent 60%),
  #FAF6F2;
```
Blush-rose on the left, warm cream center, soft periwinkle on the right.

## Typography
- Display: Cormorant Garamond (Google Fonts)
- Body: Inter (Google Fonts)

## CSS variable
- `--primary: 359 81% 44%` (light mode) / `359 81% 50%` (dark mode)
- `--ring: 359 81% 44%`

## What was replaced
- Old navy `#0B1340` → `#CC1519` for buttons/CTAs, `#111111` for dark backgrounds
- Old cobalt `#2236E8` → `#CC1519` everywhere (it was always an accent color)

**Why:** User provided staging screenshots showing a crimson-red brand direction replacing the previous navy/cobalt palette.

**How to apply:** Any new page, slide, or mobile screen must use `#CC1519` for primary actions and `#111111` for dark decorative sections. The investor deck (built with the old palette) still needs updating.
