---
name: Oceanic Telemetry Console
colors:
  surface: '#061426'
  surface-dim: '#061426'
  surface-bright: '#2d3a4e'
  surface-container-lowest: '#020e21'
  surface-container-low: '#0e1c2f'
  surface-container: '#132033'
  surface-container-high: '#1d2a3e'
  surface-container-highest: '#28354a'
  on-surface: '#d6e3fe'
  on-surface-variant: '#bacac9'
  inverse-surface: '#d6e3fe'
  inverse-on-surface: '#243145'
  outline: '#859493'
  outline-variant: '#3b4949'
  surface-tint: '#26dcdd'
  primary: '#48efef'
  on-primary: '#003737'
  primary-container: '#00d2d3'
  on-primary-container: '#005556'
  inverse-primary: '#006a6a'
  secondary: '#aac9f4'
  on-secondary: '#0e3255'
  secondary-container: '#29486d'
  on-secondary-container: '#99b7e2'
  tertiary: '#acdfff'
  on-tertiary: '#00354a'
  tertiary-container: '#5ac8ff'
  on-tertiary-container: '#005270'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#56f9f9'
  primary-fixed-dim: '#26dcdd'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#aac9f4'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#29486d'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#061426'
  on-background: '#d6e3fe'
  surface-variant: '#28354a'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies an advanced aquatic telemetry console engineered for mission-critical environmental monitoring, life support systems, and client portal supervision. It blends technical precision with deep-sea optics, delivering an experience that feels both hyper-reliable and futuristic.

The aesthetic fuses deep abyssal backdrops with sharp-bordered glass containment surfaces, hyper-vivid bioluminescent telemetry accents, and crisp monospaced-adjacent data displays. Visual density prioritizes high signal-to-noise ratio, presenting chemical metrics, water displacement, salinity, and filtration vitals with absolute clarity. Interfaces must project supreme operational competence, avoiding casual or playful tropes in favor of professional marine instrumentation.

## Colors

The palette establishes an abyssal chromatic hierarchy where deep ocean tones act as non-distracting containers and electric cyans highlight critical data and active states.

- **Primary (`#00D2D3`):** Electric oceanic cyan used for active telemetry, primary callouts, vital state highlights, and real-time sensor pings.
- **Secondary (`#1E3E62`):** Abyssal slate-blue serving as interactive container fills, structural dividing bands, and secondary actions.
- **Tertiary (`#38BDF8`):** Atmospheric luminous blue for analytical charts, secondary metrics, informational tags, and subtle glow gradients.
- **Neutral (`#0B192C`):** Sub-surface midnight canvas base providing infinite contrast against neon status indicators.
- **Functional Semantics:**
  - Optimal / Clean Vitals: Fresh aquatic green (`#10B981`)
  - Warning / Fluctuation: Bioluminescent amber (`#F59E0B`)
  - Critical / Failure: High-frequency coral red (`#F43F5E`)
  - Secondary Slate Neutral: Calibrated low-saturation gray (`#94A3B8`)

## Typography

Typography is calibrated to function as an instrumentation readout. Headings rendered in Space Grotesk deliver crisp, engineered authority with idiosyncratic geometric curves, establishing telemetry sections and metric titles with punchy rhythm.

Body copy, tabular data, and operational labels leverage Geist for ultra-clean rendering, high legibility under dense visual data configurations, and neutral functional mechanics. Numerical readouts, chemical notations, and dynamic sensor logs should enforce tabular figures (`font-variant-numeric: tabular-nums`) to prevent jittering during active stream polling.

## Layout & Spacing

The layout is built upon an 8pt modular grid with dense, structured grouping to reflect physical instrumentation dashboards. Vertical space is economical to prevent redundant scrolling during critical incident observation.

- **Mobile Viewports (<640px):** Single-column dashboard stack relying on `margin-mobile` (16px) canvas padding and `gutter-mobile` (12px) horizontal card splits. Metric gauges cluster into paired horizontal pods.
- **Tablet / Expanded Viewports (>=640px):** Multi-column telemetry grid featuring flexible split consoles (60/40 visual telemetry to parameter logs) with full 24px exterior margin margins.
- **Rhythm Rules:** Inter-element spacing inside telemetry cards follows strict steps: `space-xs` (4px) for micro badge margins, `space-sm` (8px) for label-to-value pairings, and `space-md` (12px) between distinct sensor nodes.

## Elevation & Depth

Depth is defined through layered translucent glass surfaces and fine razor-edge illuminated borders, simulating technical instrumentation glass submerged in low-light environments.

- **Level 0 (Canvas Base):** Solid deep-abyss background (`#0B192C`).
- **Level 1 (Sensor Containment Panels):** Semitransparent fill (`#1E3E62` at 25% opacity) coupled with `backdrop-filter: blur(16px)` and a crisp 1px hairline perimeter border (`rgba(0, 210, 211, 0.15)`).
- **Level 2 (Interactive Modules & Flyouts):** Frosted paneling (`#1E3E62` at 50% opacity) bounded by a 1px border (`rgba(0, 210, 211, 0.3)`), casting a faint localized cyan diffusion glow (`0 8px 32px rgba(0, 210, 211, 0.08)`).
- **Level 3 (Alert Modals & Overlays):** Deep slate containment with edge illumination (`1px solid #00D2D3`) and high-spread dark occlusion shadows (`0 20px 48px rgba(0, 0, 0, 0.6)`).

## Shapes

The design system adopts a calibrated "Soft" shape philosophy (`roundedness: 1`). Elements favor technical structure over bubbly curves, maintaining a sharp, tactical profile reminiscent of waterproof field monitors.

- **Base Radius (0.25rem / 4px):** Standard controls, micro badges, input fields, checkboxes, and inline status indicator pings.
- **Large Radius (0.5rem / 8px):** Primary telemetry cards, parameter containment pods, visual glass panels, and modal containers.
- **Extra-Large Radius (0.75rem / 12px):** Top-level navigation docks, floating action toolbars, and global viewport overlays.

## Components

### Buttons & Interactive Triggers
- **Primary:** Background in electric cyan (`#00D2D3`) with deep midnight text (`#0B192C`), semi-bold Geist typography, 4px corner radius, and subtle glow on active touch.
- **Secondary:** Transparent fill with a 1px structural border (`rgba(0, 210, 211, 0.4)`), text in `#00D2D3`, shifting to `rgba(0, 210, 211, 0.1)` on hover/press.
- **Destructive/Emergency:** Outlined in `#F43F5E` with muted red tint fills for life-support purge or override commands.

### Telemetry Badges & Chips
- Compact pill-like badges (4px radius) utilizing tabular uppercase Geist (`label-sm`).
- Consists of a 6px pulsing circular status dot alongside vital readouts (e.g., `pH 7.4`, `ORP 380mV`, `TEMP 24.2°C`).
- Backing is semi-translucent (`rgba(0, 210, 211, 0.1)`) bounded by a subtle border matching the semantic status tone.

### Telemetry Cards & Containment Panels
- Frosted glass appearance with 8px corner radii, 1px border (`rgba(56, 189, 248, 0.2)`), and internal 16px padding.
- Metric values use Space Grotesk prominently, accompanied by mini sparklines or arc gauges rendered in tertiary `#38BDF8`.

### Input Fields & Controls
- Low-profile inset containers (`rgba(11, 25, 44, 0.6)`) with 1px border (`rgba(148, 163, 184, 0.2)`).
- On focus: Border illuminates to `#00D2D3` with an inner 1px glow line.
- Text rendered in crisp Geist white (`#F8FAFC`) with `#64748B` placeholder cues.

### Lists & Telemetry Logs
- Flush-edge, alternating subtly with hairline dividers (`rgba(255, 255, 255, 0.05)`).
- Left-aligned timestamp in Geist body-sm muted slate, followed by event severity tag and contextual metric reading.

### Checkboxes & Segmented Controls
- Checkboxes: 16x16px boxes with 4px border radius. In checked state, filled with `#00D2D3` showing an abyssal dark tick.
- Segmented Console Selectors: Contained within a `#0B192C` track; active item slides with a `#1E3E62` glass pane bordered by hairline cyan.