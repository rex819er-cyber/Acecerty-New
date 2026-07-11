You are an elite, world-class UI/UX Designer, Design Systems Engineer, and Interaction Architect. Your task is to generate a comprehensive, high-fidelity visual design blueprint for a premium, multi-page educational platform called "Acecerty". The platform balances bleeding-edge interface design with strict utility and conversions. 

Construct all outputs using strict Auto Layout principles, nested layout constraints, explicitly tokenized layout grids, and grouped component sets with variants engineered to translate directly into production-ready React / Next.js code using a clean absolute layering hierarchy.

---

### 1. UNIVERSAL DESIGN TOKENS & SYSTEM VARIABLES
Every component, section, layout frame, and interactive primitive must strictly adhere to the following dual-theme paradigm to facilitate flawless theme transformations:

- **Typography System:**
  - Primary Display: Sans-Serif tracking-tight variable font family (e.g., Plus Jakarta Sans, Inter, or SF Pro Display).
  - Tracking Rules: Display weights must utilize `tracking-[-0.04em]` to `tracking-[-0.08em]` for high-impact headlines.
- **Color Token Architecture (Dual-Theme Engine Mapping):**
  - **Dark Mode Configuration (Default Initial State):**
    - `bg-canvas`: Deep, pure black `#000000` or slate-tinted black `#050505`.
    - `text-primary`: Pure, crisp white `#FFFFFF`.
    - `text-secondary`: High-legibility off-white or translucent silver `#F5F5F7` / `rgba(255,255,255,0.7)`.
    - `border-structural`: Low-contrast charcoal dark line `#1A1A1A`.
  - **Light Mode Configuration (Dynamic Inverted State):**
    - `bg-canvas`: Brilliant neutral white `#FFFFFF` or stark ivory `#FAF9F6`.
    - `text-primary`: Rich charcoal/pure black `#111111` or `#000000`.
    - `text-secondary`: Mid-tone ash gray `#555555` or `rgba(0,0,0,0.6)`.
    - `border-structural`: Light gray separation line `#E5E5E5`.
  - **Signature Brand Accent Token (Global Constant):**
    - `brand-accent`: Vibrant, high-saturation electronic teal/cyan color (HEX: `#00A2B6`). Applied universally across both theme states for critical visual anchors, text carets, focus strokes, hover borders, active indicator paths, and high-priority primary CTA components.

---

### 2. CORE VIEWPORT PAGES & LAYOUT GRID SCHEMES
Establish explicit layout frameworks for structural components using strict resolution responsive grids:
- **Desktop Layout Grid Framework:** Canvas viewport fixed to `1440px` width. Use a 12-column grid layout system, `col-width: 80px`, `gutter: 24px`, with left/right side margins locked at `96px`.
- **Mobile Layout Grid Framework:** Canvas viewport fixed to `390px` width. Use a 4-column fluid layout grid system, `gutter: 16px`, with left/right side safety margins locked at `24px`.

---

### 3. LANDING PAGE STRUCTURAL SECTIONS & BREAKPOINT OPTIMIZATION

#### Section 1: Persistent Top Navigation Bar
- **Architecture:** Full-bleed fixed/sticky layout frame (`h-20` on desktop, `h-16` on mobile) layered with backdrop-blur utilities. Holds structural vector logo marks, an inline link row, and a theme switcher anchor. 
- **Inversion mapping:** Logo path fills and link typography weights must execute reciprocal value flips (`#FFFFFF` $\leftrightarrow$ `#111111`) across theme configurations to maintain absolute visibility.

#### Section 2: Hero Section (The Interactive 3D Spline & Constellation Stack)
Build a multi-layered viewport layout block utilizing strict layered layout nesting and explicit interactive pointer constraints to safely run concurrent HTML5 Canvas engines:
- **Layer 1: Ambient Background Plane (Z-Index: 0):** An absolute-positioned canvas frame executing an automated, math-driven constellation node network engine. This layout container is configured with a strict `pointer-events: none` property to prevent background canvas interactions from hijacking user input.
- **Layer 2: Core Interactive Asset Plane (Z-Index: 10):** A dedicated bounding frame map representing a React lazy-loaded, code-split `'use client'` interactive 3D container running the `<SplineScene />` component. 
  - *Suspense Fallback Subframe:* Inside this layer, model a layout subframe representing an active `Suspense` fallback wrapper. It must contain a centered container displaying a custom geometric CSS micro-loader element (`<span className="loader"></span>`).
  - *WebGL Canvas Properties:* The rendering target must utilize 100% alpha-channel transparency parameters to display the ambient background particles underneath perfectly. The parent wrapper frame uses `pointer-events: none` to map space transparently, while the direct 3D component layout box enforces `pointer-events: auto` to allow direct interactive model tracking and coordinate manipulation.
- **Layer 3: Foreground Content Overlays (Z-Index: 20):** High-impact structural content frames housing display typography headers, metadata badge arrays, and action CTA button groups. This layout frame has `pointer-events: none` at its root level, while individual elements (like buttons and search fields) enforce `pointer-events: auto` to guarantee zero layout dead-zones over the 3D model canvas.
- **Desktop Optimization ($\ge 1024$px Breakdown):**
  - Layout Format: Horizontal 2-column flex row layout filling exactly `100vh` viewport height.
  - Left Frame Structure (`w-1/2` alignment): Holds high-contrast cinematic typography strings scaled from `text-5xl` up to `text-8xl`. Primary CTAs are comfortably spaced using an Auto Layout vertical stack with a `24px` spacing gap.
  - Right Frame Structure (`w-1/2` alignment): Hosts the 3D Spline Scene container as a dominant, high-resolution focal asset. Desktop mouse pointer coordinate maps pass structural transforms smoothly through to the WebGL rendering thread to drive real-time cursor tracking, element rotations, and interactive lighting changes within a 200px attraction window.
- **Mobile Optimization ($\le 768$px Breakdown):**
  - Layout Format: Auto Layout stacked vertical flex column layout to favor thumb-driven single-handed ergonomics.
  - Content Flow: Visual text elements compress down scale fluidly (`text-4xl` to `text-5xl`) and stack directly over or under the active 3D asset frame.
  - Performance Adjustments: The Spline frame dynamically scales down complex rendering profiles or alters its camera matrix to prevent visual clipping. Interactive mouse-tracking parameters switch seamlessly to touch-impact vector fields or automated ambient looping states to maintain absolute mobile stability.

#### Section 3: Course Library & Dynamic Showcase Area
- **Architecture:** Grid framework showcasing multi-disciplinary path tiles. Houses structural typography headers and tags tracking localized course criteria, price markers, and dynamic metadata layouts.

#### Section 4: Scroll-Driven Pinned Card Showcase
- **Architecture:** Positioned below the main course layout. A fixed viewport sequence frame where cards vertically stack, slide over, lock, and transition systematically past one another to illustrate modular features.

#### Section 5: Integration & Partner Ribbon
- **Architecture:** A horizontal infinity layout strip or container layout showcasing technology badges, tracking paths, and integration blocks utilizing scroll-driven orchestration.

---

### 4. MICRO-INTERACTIVE COMPONENT VARIANT SPECIFICATIONS (THE 11 INTERACTIVE SYSTEMS)
You must explicitly design detailed Component Sets for the interface containing distinct variant states for each of these eleven specialized interactive animation systems:

#### System A: Theme Toggle Switcher & View Transition Engine
Create a standalone "Theme Toggle Trigger" component pairing micro-vector morphing assets with structural layout animations.
- **Variant 1 (Dark Mode Active State):** Displays an absolute-positioned crescent moon vector layout or a custom vector path drawing. Background elements match dark-theme tokens.
- **Variant 2 (Light Mode Active State):** The component morphs using fluid clipPath and rotation properties to reveal an absolute-positioned sun vector icon or lightbulb design. Typography and border tokens switch instantly to light-theme states.
- **Layout Transition Protocol:** Interface actions call a circular masking viewport transition layer that smoothly expands across the page canvas. Structural headers, menus, and text rows maintain position while executing a synchronized alpha-opacity cross-fade over a 300ms window to eliminate page flashes or visual jumps.

#### System B: Conditional Modifier Mouse Spotlight Follower
A specialized cursor-tracking spotlight component layer whose presence is strictly bounded by hardware input conditions.
- **Architecture:** An independent floating overlay frame housing a soft, diffused radial gradient layer utilizing the brand accent cyan (`#00A2B6`) fading cleanly to an alpha-transparent outer perimeter.
- **Variant 1 (Modifier Key Idle):** Default state. Element properties forced to Opacity: 0% and Scale: 0. The cursor follower remains completely asleep.
- **Variant 2 (Modifier Key Active - Ctrl Hold):** Triggered exclusively when the keyboard 'Ctrl' modifier key is pressed and held down. The spotlight element transforms instantly to Opacity: 100% and Scale: 1. It tracks the cursor coordinates using tight, low-inertia spring physics (Mass: 0.1, Damping: 10, Stiffness: 131), and disappears instantly back to Variant 1 upon key release.

#### System C: Accordion-Style Course Showcase Carousel
A variable-width horizontal layout container that distributes course media components inside a unified flex row.
- **Variant 1 (Collapsed Card):** A compressed vertical layout frame restricted to a fixed width of `80px` (`5rem`) and a height of `384px` (`24rem`). Features a fully rounded `24px` corner radius. Contains only a minimalist, vertically rotated course text identifier or abstract colored path block.
- **Variant 2 (Expanded Card - Active Focus):** Upon hover or click interaction, the layout container smoothly expands to a wide focal footprint of `384px` (`24rem`) width while maintaining its `384px` height and `24px` radius. It reveals a rich background course thumbnail, an absolute-positioned dark gradient overlay mask, high-contrast metadata rows, explicit pricing indicators, and an interactive primary CTA badge. All neighboring card elements respond to the layout shift fluidly.

#### System D: Micro-Interactive Vector Action Icons
Custom-engineered UI vector primitives designed to provide instant tactile micro-feedback.
- **Component 1: Arrow Link Trigger:**
  - *Variant 1 (Idle State):* Features a single ChevronRight vector icon layer next to a text label. An internal horizontal vector arrow line is nested inside the frame but set to `Scale-X: 0%` (hidden).
  - *Variant 2 (Hover State):* The ChevronRight icon moves horizontally by a minor spacing offset while the hidden vector line layer expands fluidly to `Scale-X: 100%`, assembling a dynamic, self-drawing arrow asset.
- **Component 2: Morphing Hamburger Navigation Menu Icon:**
  - *Variant 1 (Default State):* Three absolute-positioned horizontal vector lines stacked symmetrically with uniform geometric spacing gaps.
  - *Variant 2 (Active/Toggled State):* The center line layer collapses down to 0% opacity. Simultaneously, the top and bottom path layers translate precisely to the central layout coordinates and cross-rotate at exactly 45-degree and -45-degree angles, forming a crisp geometric close 'X' icon.
- **Component 3: Reactive Audio/Video Monitor Toggle:**
  - *Variant 1 (Audio Unmuted):* Vector speaker base icon displayed alongside multiple concentric structural stroke arcs representing live audio waves.
  - *Variant 2 (Audio Muted):* An absolute-positioned, diagonal vector strike-through layer scales from 0 to 1 across the icon face while the entire icon executes a subtle rotational tilt.

#### System E: Smooth Caret Custom Text Input Fields
A search and login portal text-input component designed to override native browser text indicators with fluid custom physics.
- **Architecture:** Base input wrapper containers feature a comfortable `16px` padding layout (`p-4`), a `16px` border-radius layout (`rounded-2xl`), and internal parameters that force standard browser text carets to be completely transparent (`caret-transparent`).
- **Variant 1 (Unfocused Input State):** Showcases a low-visibility structural outline border and subtle placeholder typography set to a translucent 40% opacity layer. The custom interactive caret is completely hidden.
- **Variant 2 (Focused / Typing Input State):** Activated upon interface selection. The wrapper frame gains a crisp, high-contrast `2px` focus border utilizing the signature brand accent cyan color (`#00A2B6`). An absolute-positioned, vertical vector bar element representing the custom caret layer appears in matching electronic teal (`#00A2B6`). The custom caret bar layer is built to smoothly track character layout widths via responsive spring behaviors (Stiffness: 500, Damping: 30, Mass: 0.5) as text input progresses.

#### System F: Scroll-Driven Cinematic Convergence Blocks
A layout methodology that breaks static typography assets and icon sets down into isolated nodes that self-assemble based on scrolling coordinates.
- **Component Set 1: Character Split Header Component (`CharacterV1`):** Large display text strings are programmatically split into independent inline-block text layer components.
  - *Variant 1 (Scroll Phase 0.0 - Section Entry):* Characters explode outward away from the center text layout axis along the X-axis, combined with a sharp 3D perspective orientation distortion (`rotateX` driven by index offsets).
  - *Variant 2 (Scroll Phase 0.5 - Section Centered):* As the layout section centers in the viewport, the individual character components converge symmetrically back to their unified, tight display layout tracking baselines, flattening all 3D rotation angles back to 0 degrees.
- **Component Set 2: Icon Matrix Dispersal Component (`CharacterV2`/`CharacterV3`):** Separates a row of technology and integration logos into independent structural floating nodes.
  - *Variant 1 (Scattered Field State):* Integration icon thumbnails are widely displaced away from their grid positions along random X, Y, and Z spatial trajectories using layout distance multipliers, scaled down to 75%, and skewed.
  - *Variant 2 (Unified Grid State):* As scrolling progresses toward its target, all scattered icon frames converge inward, resetting their scale vectors to 100%, and flattening their spatial rotation planes to lock perfectly into a highly organized grid or ribbon layout track.

#### System G: Scroll-Driven Vector Path Trajectory
A continuous visual element running across multiple layout folds to guide the user's attention down the page.
- **Architecture:** A massive, winding, organic background SVG path layer set to absolute positioning (`absolute z-0`). The line winds behind primary display typography blocks, content columns, and grid boundaries across a prolonged page fold (`350vh`).
- **Variant 1 (Scroll Origin State):** The vector stroke is hidden or empty (`pathLength: 0` or maximum stroke offset), masking its route completely from view.
- **Variant 2 (Scroll Target State):** As viewport scrolling increases, the custom vector stroke fills its paths dynamically using the signature brand accent teal color (`#00A2B6`), tracing alongside section blocks that gracefully shift contrast modes as the element passes them.

#### System H: Immersive Clip-Path Media Player Pop-Over
A layout modal wrapper applied across educational video reels and inline preview thumbnails to create an immersive theater transition.
- **Component Set 1: Inline Preview Thumbnail:**
  - *Architecture:* An aspect-ratio layout block showcasing looping background media assets.
  - *Interactive Layer:** Hovering over the element reveals an absolute-positioned floating badge reading "Play" alongside a micro play triangle vector icon. This floating badge trails cursor locations using a low-inertia tracking frame and applies a `mix-blend-exclusion` rendering filter to remain perfectly legible against shifting background pixels.
- **Component Set 2: Cinematic Theater Overlay Modal:**
  - *Variant 1 (Closed Matrix Frame):* The video player node is hidden, heavily masked down to a compressed center geometry block using a specific clipping mask constraint (`clipPath: "inset(43.5% 43.5% 33.5% 43.5%)"`) at 0% initial visibility.
  - *Variant 2 (Expanded Theater State):* Upon clicking an inline preview component, an absolute fullscreen background mask (`100vw` / `100vh`) carrying a heavy `backdrop-blur-lg` filter layout appears. The masked video layer spring-unfolds fluidly (Stiffness: 100, Damping: 20) until it matches an un-clipped widescreen 16:9 container (`clipPath: "inset(0% 0% 0% 0%)"`) at 100% active opacity. Features a borderless minimal control track asset fixed to the bottom axis utilizing a custom media chrome panel.

#### System I: HTML5 Canvas Ambient Sprite Crowd Engine
An automated background crowd simulation system designed to run under lower layout blocks to create high-end ambient energy.
- **Architecture:** An absolute-positioned layout block housing a high-performance `<canvas>` element occupying a specified background section (`90vh`).
- **Layout Simulation Rules:** The underlying script parses a complex composite asset image matrix containing diverse character sprite cuts (arranged in a 15-row by 7-column spreadsheet map). Sliced character modules ("Peeps") translate horizontally completely across the section background container along random paths, layered with a secondary vertical walking bob physics animation (moving up and down by `10px`).
- **Depth Map Priority Sorting:** The loop continuously recalculates rendering layer orders against localized vertical position anchors. Elements with lower vertical positioning automatically drop behind foreground structures to maintain a detailed landscape matrix. All assets support alpha background transparency to safely invert contrast parameters when changing core layout themes.

#### System J: Scroll-Driven Pinned Card Stack Showcase
A layered scrolling feature module that pins content to the screen to display feature deep-dives or educational milestones.
- **Architecture:** A dedicated full-page section frame that catches and locks the viewport entirely to the screen top (`pin: true`) via layout scroll scrub triggers over an elongated layout track.
- **Layout Array Structure:** A grouped vertical collection of visual feature cards designed with comfortable, soft border-radius properties (`rounded-4xl`) positioned absolutely directly over one another (`absolute h-full w-full object-cover`).
- **Sequential Card Layer Transitions:**
  - *Initial Setup Position:* The base card layer (Index 0) is displayed flat at full scale (`y: "0%", scale: 1, rotation: 0`). All subsequent cards are hidden beneath the lower layout boundary frame (`y: "100%", scale: 1, rotation: 0`).
  - *Active-to-Exit Transition:* As scrolling steps forward, the top card transforms smoothly, scaling down to `scale: 0.7` and shifting to an organic spatial layout angle offset of `rotation: 5`.
  - *Oncoming Entrance Transition:* Synchronized exactly with the previous card's exit animation, the next card in the array slides vertically upward from its `y: "100%"` position directly into the focused `y: "0%"` slot, locking seamlessly over the scaled-down card. This sequence repeats across all cards in the stack. All overlay text layers maintain AA contrast against shifting cards.

#### System K: Hero Background Interactive Particle Constellation Canvas Engine
The base background layout framework for the primary landing fold.
- **Architecture:** An absolute-positioned, full-bleed background canvas engine (`absolute top-0 left-0 w-full h-full z-0`) running high-density particle math equations based on active viewport scale factors.
- **Geometric Mesh Linkages:** Floating vector dot nodes bounce within the absolute layout boundaries. When individual particle coordinates fall below a proximity threshold, the engine draws clean network connecting paths to assemble a live mathematical constellation mesh.
- **Pointer Repulsion Mechanics:** Moving a cursor across the desktop hero section creates an absolute repulsion field with a `200px` radius constraint. Particles moving near the cursor path compute normalized force parameters and execute an inverse-distance deflection to smoothly glide away from the pointer's path. For touch-active mobile frames, the field dynamically scales down its detection radius and switches to automated touch displacement tracking.
- **Dual-Theme Render Loop Color Inversion mapping:**
  - *Dark Theme Map:* The background is cleared to pure black (`'black'`). Interconnected mesh paths render as deep glowing amethyst lines (`rgba(200, 150, 255, opacity)`), standard node dots display as bright purples (`rgba(191, 128, 255, 0.8)`), and particle links moving within the active mouse pointer tracking field illuminate to pure white (`rgba(255, 255, 255, opacity)`).
  - *Light Theme Map:* The background is cleared to bright neutral white (`'#FFFFFF'`). Invert network line connections to clean, translucent slate gray tracks (`rgba(100, 110, 125, opacity)`), map standard particle nodes to rich brand cyan accents (`rgba(0, 162, 182, 0.8)`), and force local mouse-hover lines to lock into high-visibility dark charcoal cords (`rgba(17, 17, 17, opacity)`), keeping the entire system crisp and legible on both toggle states.