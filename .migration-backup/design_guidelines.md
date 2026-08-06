# SeamXY Design Guidelines

## Design Approach

**Reference-Based Hybrid Strategy**
Drawing inspiration from premium fashion personalization services (Stitch Fix, Trunk Club) combined with modern e-commerce clarity (Shopify, ASOS) and marketplace trust-building (Etsy). The design must convey expertise, precision, and confidence while maintaining approachability across all demographics (men, women, young adults, children).

**Core Design Principles**
1. **Confidence Through Clarity** - Fit scores, style matches, and recommendations are presented with visual hierarchy that builds trust
2. **Sophisticated Simplicity** - Fashion-forward aesthetics without overwhelming users with data
3. **Dual Marketplace Identity** - Seamless experience between retail discovery and bespoke tailoring

---

## Typography System

**Font Families** (via Google Fonts CDN)
- **Primary**: Inter (400, 500, 600, 700) - Body text, UI elements, data displays
- **Display**: Plus Jakarta Sans (600, 700, 800) - Headlines, hero sections, impact moments

**Type Scale**
- Hero Display: text-5xl to text-7xl (display font, 700-800 weight)
- Section Headers: text-3xl to text-4xl (display font, 600-700 weight)
- Subsections: text-xl to text-2xl (primary font, 600 weight)
- Body Large: text-lg (primary font, 400 weight)
- Body: text-base (primary font, 400 weight)
- Small/Meta: text-sm (primary font, 500 weight)
- Micro/Labels: text-xs (primary font, 600 weight, uppercase tracking-wide)

**Application**
- Product names: text-lg, 600 weight
- Fit scores/percentages: text-2xl to text-3xl, 700 weight (display font)
- Maker names: text-xl, 600 weight
- Price tags: text-xl, 700 weight
- Form labels: text-sm, 500 weight, subtle opacity

---

## Layout System

**Spacing Primitives** (Tailwind units)
- Core rhythm: 4, 6, 8, 12, 16, 24
- Section padding: py-16 md:py-24 lg:py-32
- Card padding: p-6 md:p-8
- Component gaps: gap-4, gap-6, gap-8
- Micro spacing: space-x-2, space-y-3

**Container Strategy**
- Page containers: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Content areas: max-w-6xl mx-auto
- Text content: max-w-prose
- Product grids: grid gap-6 md:gap-8

**Grid Patterns**
- Product results: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Maker profiles: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature sections: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Comparison views: grid-cols-1 lg:grid-cols-2

---

## Component Library

### Navigation
**Primary Header**
- Full-width with max-w-7xl inner container
- Logo (left), main nav (center), user actions (right)
- Sticky positioning on scroll with subtle shadow
- Search bar prominent in center or expandable
- Shopping cart badge with item count
- Demographic switcher (Men/Women/Young Adults/Children) as pill toggles

**Mobile Navigation**
- Hamburger menu (Heroicons: bars-3)
- Full-screen overlay navigation
- Demographic switcher at top

### Product Cards
**Retail Product Card**
- Image aspect ratio: aspect-[3/4] (portrait for clothing)
- Hover state: subtle scale-105 transform, deeper shadow
- Badge system for fit scores: Rounded pills (89% Fit, 94% Style, Budget Match ✓)
- Quick Buy CTA: Prominent, full-width button at bottom
- Brand name: Subtle, above product name
- Price: Bold, display font
- Save/wishlist icon (Heroicons: heart) top-right on image

**Maker/Tailor Profile Card**
- Image aspect ratio: aspect-square for maker photo/logo
- Specialties: Small pill badges
- Rating display: Stars + numeric (4.9)
- Location + delivery zones: Icon + text
- Lead time badge: Distinct treatment (e.g., "14 days")
- "Request Quote" CTA button

### Forms & Inputs
**Measurement Input**
- Visual measurement diagram alongside input fields
- Grouped sections (Upper Body, Lower Body, etc.)
- Unit toggle (inches/cm) as small pill switch
- Real-time validation with success states
- Camera scan option: Large icon button with clear affordance

**Freehand Text Input**
- Generous textarea with placeholder examples
- Character count indicator
- AI parsing status: Loading spinner → Success checkmark
- Extracted tags display below input as dismissible pills

**Budget Slider**
- Dual-handle range slider with visible min/max values
- Preset tier buttons: Affordable ($), Mid-range ($$), Premium ($$$), Luxury ($$$$)
- Visual price range display updates in real-time

### Data Displays
**Fit Score Visualization**
- Large circular progress indicator or horizontal bar
- Percentage in display font, 700 weight
- Supporting micro-copy: "Excellent fit for your measurements"
- Three-tier scoring: Fit / Style / Budget presented as equal-width columns

**Recommendation Rankings**
- List view with subtle numbered badges
- Total score prominently displayed
- Breakdown visible on expand/hover
- Quick compare checkbox for multi-select

### CTAs & Buttons
**Primary Actions** (Quick Buy, Request Quote, Submit)
- Full-width on mobile, auto-width on desktop
- px-8 py-4, rounded-lg
- Font: text-base, 600 weight
- Icons from Heroicons when appropriate (shopping-cart, paper-airplane)

**Secondary Actions** (Save, Share, View Details)
- Outlined or ghost style
- px-6 py-3
- Icons with text labels

**Tertiary Actions** (Edit, Remove)
- Text-only or icon-only
- Subtle hover states

### Overlays & Modals
**Quick View Modal**
- Product details with larger images
- Scrollable when content exceeds viewport
- Measurement comparison table
- Close icon (Heroicons: x-mark) top-right
- Backdrop blur

**Measurement Scan Modal**
- Full-screen on mobile
- Camera view with overlay guides
- Step-by-step instructions
- Progress indicator

---

## Images

**Hero Section**: Full-width, aspect-[21/9] on desktop, aspect-[4/3] on mobile
- Lifestyle photography of well-dressed individuals across demographics
- Multiple hero images in rotation or single impactful shot
- Image: Confident person in perfectly fitted clothing, modern setting
- Overlay: Gradient from transparent to semi-opaque for text legibility
- CTA buttons on hero: Background blur (backdrop-blur-md) with semi-transparent white/dark background

**Product Images**
- Placeholder: https://picsum.photos/seed/[productId]/800/1000
- Clean white or subtle gray backgrounds
- Consistent lighting and styling
- Hover: Secondary angle or detail shot

**Maker Profile Images**
- Placeholder: https://picsum.photos/seed/[makerId]/600/600
- Professional headshots or brand logos
- Workshop/studio imagery for authenticity

**Feature Section Images**
- Measurement diagram illustrations (consider custom illustrations or clear photographic examples)
- AI parsing visualization: Abstract tech-modern imagery
- Before/after fit examples

**Trust Builders**
- Customer photos wearing recommended items (diverse representation)
- Maker workshop imagery
- Quality detail shots (fabric, stitching)

---

## Page-Specific Layouts

### Homepage
1. **Hero** (100vh min, aspect-[21/9] hero image): Value proposition + dual CTAs (Shop Now / Find a Maker)
2. **How It Works** (py-24): 3-column grid (Measure → Match → Buy/Create)
3. **Featured Products** (py-16): Carousel or 4-column grid of top-matched items
4. **Maker Spotlight** (py-20): 3-column grid of featured tailors
5. **Testimonials** (py-16): 2-3 column cards with photos
6. **Trust Section** (py-12): Badges, stats, guarantees
7. **Footer** (py-16): Multi-column with newsletter, social, quick links

### Search Results / Product Listing
- Sticky filter sidebar (left, 25% width on lg+)
- Product grid (right, 75% width)
- Sort controls top-right
- Pagination or infinite scroll
- Empty state: Helpful illustration + suggestion to adjust filters

### Product Detail (Retail)
- Two-column layout: Image gallery (left, 50%), Details + CTA (right, 50%)
- Fit score prominently displayed
- Measurement compatibility table
- Size guide link
- Quick Buy CTA sticky on scroll (mobile)

### Maker Profile
- Header section: Photo, name, rating, location, specialties
- Gallery of previous work (masonry or grid)
- About section with expertise details
- Request Quote form inline or as prominent CTA
- Reviews section

### Custom Request Flow
- Multi-step wizard: Measurement → Style Preferences → Budget → Review
- Progress indicator at top
- Matched makers displayed as cards with match scores
- Quote comparison table

### User Dashboard
- Tab navigation: My Measurements / Saved Items / Orders / Custom Requests
- Summary cards for quick stats
- Order history table with status badges

---

## Iconography

**Icon Library**: Heroicons (outline for most UI, solid for active/filled states)
- Navigation: home, magnifying-glass, shopping-bag, user-circle
- Measurements: ruler, camera, check-circle
- Actions: heart, share, bookmark
- UI: chevron-down, x-mark, bars-3, funnel

---

## Animation & Interactions

**Minimal & Purposeful**
- Page transitions: Smooth fade-ins (200ms)
- Card hovers: Subtle lift (translateY(-4px), 200ms ease)
- Button hover: Background darken/lighten (150ms)
- Loading states: Skeleton screens, not spinners
- Success states: Checkmark micro-animation (scale + fade)
- Quick Buy: Button state changes during processing

**Avoid**: Excessive parallax, scroll-triggered animations, auto-playing carousels

---

## Accessibility
- Focus indicators: 2px solid outline with offset
- Form inputs: High contrast labels, clear error states
- Buttons: Minimum 44px touch targets
- Alt text for all product/maker images
- ARIA labels for icon-only buttons
- Keyboard navigation throughout