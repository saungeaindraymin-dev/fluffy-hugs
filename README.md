# Fluffy HUGS — Rezerv Assessment (Part 1)

> Recreated three animation-heavy screens from **[nft.fluffyhugs.io](https://nft.fluffyhugs.io)** using Vite, React, GSAP, and SCSS. The project includes an asset-gated loading screen, a full-screen character mosaic, and a collection screen with a floating character and animated bubbles. All three screens are connected through one smooth, scroll-driven transition.

- **Repository:** https://github.com/saungeaindraymin-dev/fluffy-hugs.git
- **Live demo:** [fluffy-hugs-five.vercel.app](https://fluffy-hugs-five.vercel.app)

## Core Features

- **Built from scratch:** I kept the project lightweight and only used GSAP for the animations. There’s no Lottie runtime, scroll library, or UI framework. The original site uses Lottie JSON files for the two character animations, so I recreated those animations using regular DOM elements and GSAP.

- **Asset-gated loading screen:** Instead of showing the loading screen for a fixed amount of time, it waits until the main artwork is actually ready. Each image needs to finish loading and decoding before the reveal, which helps avoid the small stutter that can happen when the browser is still processing an image. Image decoding is limited to 2 seconds per asset, with a 12-second limit for the whole batch. If an asset fails to load, the process still continues so the user can never get stuck on the loading screen.

- **Interlocking mosaic hero:** The hero is made up of overlapping character tiles that create a continuous wall without visible gaps or grid lines. The tiles overlap by around 45% horizontally and 68% vertically, with alternating rows slightly offset. The number of rows and columns is calculated based on the viewport size, allowing the mosaic to properly fill different screen sizes instead of relying on a fixed grid.

- **Scroll hand-off:** The second screen doesn't have its own separate scroll animation. The transition is tied directly to the hero's scroll range, so everything feels like one continuous movement. As the crowd moves toward the camera and fades out, the main character gradually settles into her final pose. The crowd is mostly gone by around 60% of the transition, while the camera movement continues, making the change between the two scenes feel smooth instead of having both scenes fully visible at the same time.

- **Rigged character:** I recreated the character animation by mapping each Lottie layer to a DOM element. The positioning, rotation, scaling, and transform origins are handled with CSS transforms to match the original Lottie animation as closely as possible. I also used nested DOM elements to reproduce the parenting structure from After Effects, with the layer order reversed to match how the original animation is structured.

For the legs, I used an SVG polyline and animate the knee and ankle positions directly. The idle animation runs as a single 2-second GSAP timeline instead of having a separate tween for each body part. This is important because the original keyframes aren't perfectly symmetrical, so using individual looping animations would slowly make the limbs fall out of sync and change the pose over time.

- **Continuous bubble field:** The bubbles run independently from the scroll animation. Eight bubbles continuously move from the bottom of the screen to the top, with different speeds and starting positions so they don't bunch together. Each bubble travels far enough to completely leave the section before restarting, which keeps the loop seamless without any visible jump.
I also separated each bubble into its own image and cropped it to the actual artwork bounds. The original sprite sheets had some sizing issues, where one shape was clipped and parts of neighboring shapes showed through. Using individual assets fixed those problems and gave each bubble cleaner positioning.

- **Responsive:** I tested the layout across three breakpoints — mobile, tablet, and desktop — using 390×844, 820×1180, and 1440×900 viewports. The mosaic tile size is calculated based on the viewport width so it scales properly across different screen sizes. In an earlier version, I used a 64vh value as part of the calculation, which became 455px on a phone and made a single row stretch to more than 2,000px wide. Removing that and basing the tile size on the viewport width fixed the issue.

- **Performance and motion preferences:** The animations mainly use transform and opacity, which helps avoid unnecessary layout recalculations and repaints. I also capped the number of animated tiles at 44, regardless of how many tiles are needed to fill the screen. For example, a phone might need 91 tiles to cover the viewport, but it won't create hundreds of separate animations for them.

I also added support for prefers-reduced-motion. When a user has reduced motion enabled, the idle animations and bubble movement aren't created, and elements that would normally animate into position are placed directly in their final state.

## Tech Stack

- **Framework:** Vite 5 / React 18 — the role targets React. There's no routing, data layer, or SEO requirement on a single page, so Next.js would only have added build weight.
- **Language:** JavaScript (JSX) — no shared type surface worth protecting here; the work being assessed is motion, not type modelling.
- **Styling:** SCSS — chosen over a utility framework because the layout problems are bespoke (a gapless interlocking mosaic, a rigged character built from absolutely-positioned layers) and would have fought utility classes. SCSS earns its place through `_tokens.scss`, which holds the two breakpoints as variables plus `tablet` / `mobile` / `reduced-motion` mixins; those numbers were previously repeated across four stylesheets.
- **Animation:** GSAP 3.12 + ScrollTrigger — needed independent easing per property inside a single timeline, `scrub` bound to scroll position, and rAF-batched pointer tracking (`quickTo`). CSS animations alone cannot express the scroll hand-off, where several properties run on different curves over different slices of the same range.
- **Smooth scroll:** none — native scrolling, deliberately. See [Assumptions](#assumptions).
- **State:** Plain React (`useState` / `useRef`) — no Redux/Zustand. There is no shared or persisted state; the only React state is which screen has been revealed and the mosaic's grid size.
- **Character rigs:** Ported from the site's Lottie JSON to DOM + CSS transforms — no `lottie-web`. Avoids ~250KB of runtime and keeps the character on the same GSAP timeline as everything else, so the scroll hand-off can drive it directly.
- **Assets:** Local WebP/PNG, preloaded and decoded before the reveal.

## Folder Structure

```
src/
├── App.jsx                             # Screen order + the post-load ScrollTrigger.refresh
├── main.jsx                            # React entry
├── assets.js
├── components/
│   ├── Loader.jsx                      # Loading screen, gates the reveal on load + decode
│   ├── Hero.jsx                        # Mosaic wall, runtime grid sizing, scroll dolly
│   ├── Collection.jsx                  # Second screen; wordmark + the rising bubble field
│   ├── FloatingHuman.jsx               # Lottie-ported character
│   └── Chrome.jsx                      # Fixed logo, socials, CTA — persist across both screens
└── styles/                             # One stylesheet per component
    ├── _tokens.scss                     # Breakpoint variables + tablet/mobile/reduced-motion mixins
    ├── global.scss                      # Design tokens + reset
    ├── loader.scss
    ├── hero.scss                        # tile, the overlap maths, responsive tiers
    ├── collection.scss                  # Bubble columns + sizes
    ├── floating-human.scss              # human-scale tiers, rig layer boxes, leg stroke
    └── chrome.scss

public/
└── images/                             # Avatars, character parts, per-bubble artwork
```

## Setup

```bash
npm install
npm run dev
npm run build
```

| Screen         | What it shows                                                                             |
| -------------- | ----------------------------------------------------------------------------------------- |
| Loading screen | Real preload gating — holds until every hero asset has loaded and decoded, then fades out |
| Hero           | Gapless interlocking mosaic, runtime-sized grid, pointer parallax, scroll-driven dolly    |
| Collection     | Scroll hand-off from the hero, DOM-rigged floating character, continuous rising bubbles   |

## Assumptions

The brief asks for reasonable assumptions to be documented where requirements are open.

- **No smooth-scroll library.** Lenis / Locomotive were suggested but optional, and both replace native scrolling with a rAF-interpolated transform — which adds input latency, breaks native anchor and keyboard scrolling, and is a real accessibility cost on a two-screen page. The smoothness that actually matters here is the transition between screens, and that comes from ScrollTrigger's `scrub`, which eases the animation's catch-up to the scroll position rather than the scrolling itself. Every tween that scrubs on the hero's range shares one `SCRUB` constant so the parts of a single move stay in step.
- **Kept the reference's artwork.** The brief allows swapping in your own assets; using the original made animation fidelity checkable against the live site frame by frame, which was the point of the exercise.
- **Implemented the recommended three sections** — loading screen, hero, and one collection section — since that set exercises load, scroll, hover, and idle motion.
- **CTAs and social buttons don't navigate.** They have hover states as required, but no destinations, per the "no working CTAs" scope note.
- **The loading screen gates on real asset readiness**, not a fixed timer, to satisfy the "slow asset loading should be covered by the loading state" edge case. It waits for load *and* decode, with a 2s per-image decode cap and a 12s batch cap so a stalled asset can never trap the visitor.
- **Only three of the reference's ~7 sections exist.** Roadmap, FAQ, and team are out of scope.

### Verification notes

Responsive behaviour was confirmed by measuring layout geometry at 390×844, 820×1180, and 1440×900 — tile size, grid dimensions, and full viewport coverage at each. The deployed build was checked for asset integrity (0 broken images of 40). Animation timing was verified by scrubbing the GSAP timelines and reading back computed transforms rather than by eye.

Together the three screens cover the full brief: a genuine loading gate, a scroll-scrubbed transition between sections, and continuous idle motion that keeps running once the visitor stops scrolling.
# fluffy-hugs
