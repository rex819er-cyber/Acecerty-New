You are an elite UI/UX Designer creating a modern, premium, high-converting landing page design for the educational platform "Acecerty". Generate a high-fidelity page layout using strict Auto Layout, clean layer groups, and component sets with explicit variants built for advanced prototyping transitions and Next.js / Framer Motion implementation.

### 1. Brand Visual Token System
Generate a responsive web design layout that utilizes a strict dark and light theme paradigm:
- **Dark Theme (Default State):** Set the canvas base background to deep, pure blacks. All text layers must use high-contrast white/off-white typography.
- **Brand Accent Color:** Reference the color profile from the file "Screenshot 2026-07-01 225015.png" verbatim and apply its exact vibrant teal/cyan color (HEX: `#00A2B6`) to all critical interactive components: CTA buttons, card highlights, text carets, active state borders, and focus rings.
- **Light Theme Variant:** Generate a parallel desktop frame shifting the canvas base to a crisp, light-neutral background with dark accessible typography, while maintaining the brand cyan (`#00A2B6`) as the core accent. All layers must strictly pass WCAG AA contrast visibility standards.
- **Legacy Content Mapping:** Extract and map all existing course metadata, categorized tracks, pricing structures, and layout placeholders from the provided legacy HTML.

### 2. Layout Structure & Page Sections
- **Hero Section:** Build a modern, split-screen layout. On one side, place a dominant, clear value proposition header with secondary description text. On the opposite side, embed an interactive high-fidelity cinematic video preview frame. Place primary and secondary CTA buttons grouped cleanly below the main copy.
- **Header Navigation:** Include a top navigation bar holding structural logo marks, layout links, and a dedicated utility slot housing the custom theme toggle button, input fields, and interactive header menu vectors.
- **Integration & Features Section:** Create a dedicated scroll-container zone below the fold designed to reveal structural course paths and platform integrations utilizing scroll-driven visual choreography.
- **Course Library & Media Center:** Build responsive layout grids showcasing premium educational material with interactive card frames containing embedded dynamic video playback loops.

### 3. Integrated Component Sets & Animation Framework
You must explicitly generate separate Component Sets with distinct design variants to support eight native interactive animation frameworks:

#### System A: Theme Toggle Button & View Transitions (Reference: Skiper4 & skiper26 (1).tsx)
Create a standalone "Theme Switcher Button" Component Set combining full-page View Transitions with high-fidelity button micro-interactions.
- **Button Micro-Animations (Skiper4):** Design the visual toggle button based on the Framer Motion SVG morphing logic found in "Skiper4". Provide distinct variants for the button states (e.g., a sun vector morphing into a crescent moon using animated clipPath and rotate properties, or the path-drawing lightbulb toggle). The button must cleanly switch its background contrast (e.g., white on black, black on white) based on the active state.
- **Page Transition Logic (skiper26):** Clicking this button must trigger the native document.startViewTransition API to execute a fluid, circular masking expansion that morphs the entire page canvas between the Dark and Light theme frames.

#### System B: Spring-Physics Mouse Follower Overlay (Reference: skiper61 (1).tsx)
To account for a highly responsive, low-inertia tracking animation, design a dedicated structural UI layer:
- **Spotlight Glow Frame:** Generate an independent cursor wrapper layer or a localized background layout block containing a soft, diffused radial gradient circle using the brand cyan (`#00A2B6`) fading to transparent. 
- **State Properties:** Label the component states for 'Pointer Idle' (Opacity 0%, Scale 0) and 'Pointer Active' (Opacity 100%, Scale 1) to prepare the layout for snappier, responsive hover states tracking with useSpring hooks (mass of 0.1, damping of 10, and stiffness of 131).

#### System C: Accordion-Style Course Showcase Carousel (Reference: skiper52.tsx)
Instead of a standard flat course grid, arrange the parsed legacy course items in a horizontal flex-row layout container. Create a dedicated Component Set named "Showcase Card" featuring two explicit design states:
- **Variant 1: Collapsed Card:** A narrow vertical frame constrained to a width of '5rem' (80px) and a height of '24rem' (384px) with a fully rounded corner radius of 24px. This card is a minimalist layout displaying only a condensed vertical course tag or border identifier.
- **Variant 2: Expanded Card:** A wide, focal container expanding fluidly to a width of '24rem' (384px) and a height of '24rem' (384px) with a 24px corner radius. It must reveal a rich background course thumbnail image, an absolute-positioned dark gradient overlay mask, a high-contrast course metadata title block, pricing metrics, and an accent CTA badge.

#### System D: Micro-Interactive Vector Icons (Reference: skiper99 (1).tsx)
Build specialized UI component sets for page actions, anchor states, and navigation systems utilizing the interactive vector properties defined in "skiper99 (1).tsx".
- **Arrow/Chevron Link Icon:** Build an interactive arrow component containing two states. State 1 (Idle): A single sharp ChevronRight vector icon with a hidden internal line vector layer set to Scale-X (0%). State 2 (Hover): The ChevronRight shifts horizontally by a minor offset space while the vector line scales up fluidly to Scale-X (100%), creating a dynamic animated arrow link.
- **Morphing Hamburger Menu Icon:** Generate a navigation "Menu Icon" Component Set. State 1 (Default): Three absolute-positioned horizontal vector path lines stacked evenly with 5px geometry gaps. State 2 (Active/Toggled Toggle): The center path layer collapses to 0% opacity while the top and bottom paths translate to the true center point and cross-rotate at 45-degree and -45-degree angles to generate a crisp geometric 'X' close indicator.
- **Reactive Audio Volume Icon:** For inline course video previews, create a multi-state volume speaker vector button. Include structural design states for an active audio state (revealing layered concentric stroke rings) and a muted state (where an absolute-positioned diagonal line strike-through layer scales from 0 to 1 over the icon face alongside a subtle rotation tilt).

#### System E: Smooth Caret Input Fields (Reference: Skiper106 / SmoothInput)
Design an ultra-premium input field component set for the platform's search bars and login portal inputs to replace standard native browser inputs with fluid typing physics.
- **Component Geometry:** Input containers should be styled with a comfortable 16px padding (p-4), a 16px corner radius (rounded-2xl), and an internal grid structure that hides native caret visibility (caret-transparent).
- **Variant 1: Unfocused State:** Displays a faint outline and subtle placeholder text layer set to 40% opacity. The interactive caret is hidden.
- **Variant 2: Focused / Typing State:** Triggered when active. The container gains a 2px high-contrast focus outline using the brand accent color (`#00A2B6`). A dedicated vertical line vector element representing the text caret layer emerges in the signature cyan color block (`#00A2B6`), designed to smoothly track immediately following the character layout spacing.
- **Prototyping Setup:** Ensure the custom caret bar is a separated absolute layer within the internal Auto Layout structure to easily simulate spring animation tracking behaviors (stiffness of 500, damping of 30, and mass of 0.5) during character addition micro-transitions.

#### System F: Scroll-Driven Cinematic Convergence Layers (Reference: skiper31 (1).tsx)
Incorporate a high-impact scroll-driven layout strategy that transforms flat, static typography and logos into interactive components triggered by viewport scroll depths, utilizing smooth scroll tracking mechanics (e.g., Lenis).
- **Character Splitting Framework (CharacterV1):** For large section headers, isolate text strings into distinct, individual letter layers. Define Variant 1 (Scroll Start): Characters are widely exploded outward along the X-axis based on their center index offset, accompanied by an aggressive 3D perspective tilt (rotateX). Define Variant 2 (Scroll Target): The letters fluidly converge inward to form a perfectly balanced, tracking-tight uppercase header block.
- **Tech Stack Grid Convergence (CharacterV2 & CharacterV3):** Structure an integration grid containing platform or software icons. 
  - *State 1 (Exploded Floating State):* Distribute the logo image wrappers loosely across the canvas, displaced dynamically along both X and Y vector axes based on their distance from the geometric layout center. Set initial scale variants down to 75% or introduce varied canvas rotations.
  - *State 2 (Unified Grid State):* As scroll progress trends from 0 to 0.5, the displaced logo vectors converge flawlessly toward the true center point, scaling up to 100% size to settle into an absolute-aligned, harmonious rows-and-columns layout container.

#### System G: Scroll-Driven Vector Path Trajectory (Reference: skiper19.tsx)
Implement a continuous, structural storytelling element across multi-fold layouts using a dynamic scroll-drawn vector system modeled on "skiper19.tsx".
- **Abstract Vector Track Layer:** Generate a large, winding, organic SVG curve vector layer set to absolute positioning (absolute Z-0). This line must track background layouts fluidly, weaving directly behind or around primary typography blocks and grid boundaries.
- **Stroke Progress States:** Establish an explicit layout path blueprint configured for Framer Motion's pathLength properties.
  - *Variant 1 (Scroll Zero):* The vector stroke is invisible or partially drawn (pathLength: 0.5 or strokeDashoffset maxed), hiding its path lines away from view.
  - *Variant 2 (Scroll Final / Complete 1.0):* As the viewport scroll depth increases across a prolonged tracking section (simulated on canvas layers up to 350vh), the path line seamlessly grows, filling its stroke contours dynamically in the brand accent teal color (`#00A2B6`) to pull the visitor's attention down toward landing elements.
- **Content Overlay Blocks:** Position premium text containers over the line track, structuring clean typography frames that alternate backgrounds smoothly between states (e.g., transitioning blocks cleanly into deep dark-theme backgrounds like #1F3A4B or canvas tones).

#### System H: Immersive Clip-Path Video Player Pop-Over (Reference: skiper67.tsx)
Build a modular video player component library dedicated to the Hero Section video reel and inline Course Library cards to create a fluid preview-to-modal workflow using the design systems modeled in "skiper67.tsx".
- **Inline Preview Card Component:** Create a container housing a looping background video file. Set an interactive tracking behavior over this block: when a pointer hovers inside, a localized contextual text node reading "Play" alongside a micro vector play arrow emerges. This floating tag must track mouse coordinate positions using low-inertia springs (mass: 0.1) and utilize an absolute `mix-blend-exclusion` rendering pass to stay legibly inverted against changing background video pixels.
- **Immersive Overlay Container Component Set:** Define a standalone modal interface overlay component that renders over the standard page layouts upon clicking the inline preview.
  - *Variant 1 (Modal Backdrop Grid):* An absolute screen layer spanning full width/height (100vw/100vh) holding a premium `backdrop-blur-lg` layout mask layered on a background opacity block (`bg-background/90`). Includes a discrete close action element in the top right consisting of a vector cross button rotated exactly 45 degrees.
  - *Variant 2 (Cinematic Clip-Path Frame - Opening State):* The video node container begins masked tightly to a compact center geometry using a specific clipping mask constraint (`clipPath: "inset(43.5% 43.5% 33.5% 43.5%)"`) at 0% initial visibility.
  - *Variant 3 (Cinematic Clip-Path Frame - Expanded Target):* The mask spring-unfolds fluidly over a structural timeline (preset to a spring stiffness of 100 and damping of 20) until it matches a widescreen video aspect-ratio layout (`clipPath: "inset(0% 0% 0% 0%)"`) at 100% opacity.
- **Minimalist Audio/Video Control Bar Component:** Attach a premium controls track absolute-positioned to the bottom center axis of the video container. Keep the interface clean and stark using minimalist, borderless control assets mapped directly to custom chrome states: a vector play/pause toggle, an inline flat timeline tracker line (`MediaTimeRange`), and a responsive audio speaker indicator.

Deliver this as a pristine, fully editable Figma layout configuration with highly organized auto-layout groupings, an explicit color system block, and a mapped component architecture ready for code export.