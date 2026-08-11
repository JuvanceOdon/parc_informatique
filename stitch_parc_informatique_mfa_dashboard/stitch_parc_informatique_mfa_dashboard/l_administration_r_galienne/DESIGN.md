---
name: L'Administration Régalienne
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d4e4fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#43474e'
  inverse-surface: '#223144'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#3b6090'
  on-secondary: '#ffffff'
  secondary-container: '#a5c8ff'
  on-secondary-container: '#2e5484'
  tertiary: '#321b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f2e00'
  on-tertiary-container: '#c6955e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a5c8ff'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#204877'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#f2bc82'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#633f0f'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d4e4fc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 280px
  container-max-width: 1440px
  gutter: 24px
---

## Brand & Style
The design system is engineered for the high-stakes environment of the Madagascar Ministry of Armed Forces. It prioritizes institutional authority, operational clarity, and unwavering reliability. The aesthetic follows a **Corporate / Modern** direction, utilizing a rigorous 8px grid to ensure structural integrity and professional alignment. 

The UI avoids decorative flourishes, focusing instead on information density and task efficiency for administrative personnel managing critical IT infrastructure. The emotional response is one of security, discipline, and stability.

## Colors
The palette is rooted in deep naval tones to evoke trust and institutional hierarchy. 
- **Primary (Deep Navy):** Reserved for high-level navigation, primary brand elements, and the persistent sidebar.
- **Secondary (Steel Blue):** Used for supporting UI elements, active states, and sub-navigation.
- **Accent (Muted Gold):** Strategically applied to critical Calls to Action (CTAs) and active highlights to provide visibility without sacrificing gravity.
- **Surface & Background:** A soft cool gray background provides a low-strain canvas for pure white surfaces, ensuring high contrast for data readability.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy environments. The scale is optimized for desktop-first administrative tasks.
- **Headlines:** Bold and impactful to anchor page sections.
- **Body Text:** Standardized at 16px for readability, with 14px variations for denser data tables.
- **Labels:** Uppercase labels with slight letter-spacing are used for categorization and table headers to distinguish them from interactive data.
- **Language:** All microcopy and system labels are provided in French, maintaining formal and professional terminology (e.g., "Tableau de Bord," "Inventaire," "Utilisateurs").

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for the desktop dashboard to ensure predictable data alignment.
- **Sidebar:** A persistent 280px navy sidebar houses the primary application architecture.
- **Main Content:** Occupies the remaining width with a maximum container cap of 1440px to prevent excessive line lengths.
- **Grid:** A strict 8px incremental system governs all padding, margins, and component heights.
- **Adaptation:** On smaller screens (Tablets), the sidebar collapses into a narrow icon-rail, and margins reduce from 32px to 16px to maximize data real estate.

## Elevation & Depth
Hierarchy is established through **Tonal Layers** and subtle atmospheric depth rather than dramatic shadows.
- **Level 0 (Background):** #F7FAFC — The foundation layer.
- **Level 1 (Cards):** White surfaces with a 1px border (#E2E8F0) and a soft, low-blur shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Modals/Dropdowns):** White surfaces with a more pronounced shadow for focus (0px 10px 15px rgba(0,0,0,0.1)).
- **Separators:** 1px solid lines are used within cards to divide header sections from data content, maintaining a clean, technical feel.

## Shapes
The shape language is **Rounded**, strike a balance between modern software design and institutional tradition.
- **Containers/Cards:** 12px - 16px radius to soften the large data tables.
- **Buttons/Inputs:** 8px radius for a precise, professional appearance.
- **Status Chips:** Full pill-shaped (100px) to distinguish them from interactive buttons.
- **Iconography:** Geometric and linear, utilizing a 2px stroke weight to match the border language.

## Components
- **Buttons:** Primary buttons use the Muted Gold (#C9A227) for high-importance actions (e.g., "Ajouter un équipement"). Secondary buttons use white fills with Steel Blue borders.
- **Data Tables:** High-density rows with alternating subtle fills for readability. Headers must be "Label-caps" with sort indicators.
- **Status Chips:** Use high-contrast background tints with dark text (e.g., Success: Green-100 bg / Green-800 text) for clear operational status (Actif, En maintenance, Hors service).
- **KPI Cards:** Feature a large "Display-lg" metric, a "Title-sm" label, and a small trend indicator at the top right.
- **Input Fields:** 1px border with a 2px Steel Blue focus ring. Labels always sit above the field, never as placeholders only.
- **Sidebar Items:** High-contrast text on Primary Navy background. Active states use a subtle left-hand Accent Gold border (4px) and a lighter blue background tint.