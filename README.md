# Fluffy HUGS — Rezerv Assessment (Part 1)

> Recreated three animation-heavy screens from **[nft.fluffyhugs.io](https://nft.fluffyhugs.io)** using Vite, React, GSAP, and SCSS. The project includes an asset-gated loading screen, a full-screen character mosaic, and a collection screen with a floating character and animated bubbles. All three screens are connected through one smooth, scroll-driven transition.

- **Repository:** https://github.com/saungeaindraymin-dev/fluffy-hugs.git
- **Live demo:** [fluffy-hugs-five.vercel.app](https://fluffy-hugs-five.vercel.app)

## Core Features

- **Built from scratch:** I kept the project lightweight and only used GSAP for the animations. There’s no Lottie runtime, scroll library, or UI framework. The original site uses Lottie JSON files for the two character animations, so I recreated those animations using regular DOM elements and GSAP.

- **Asset-gated loading screen:** Instead of showing the loading screen for a fixed amount of time, it waits until the main artwork is actually ready. Each image needs to finish loading and decoding before the reveal, which helps avoid the small stutter that can happen when the browser is still processing an image. Image decoding is limited to 2 seconds per asset, with a 12-second limit for the whole batch. If an asset fails to load, the process still continues so the user can never get stuck on the loading screen.

- **Interlocking mosaic hero:** The hero is made up of overlapping character tiles that create a continuous wall without visible gaps or grid lines. The tiles overlap by around 45% horizontally and 68% vertically, with alternating rows slightly offset. The number of rows and columns is calculated based on the viewport size, allowing the mosaic to properly fill different screen sizes instead of relying on a fixed grid.

- **Scroll hand-off:** The second screen doesn't have its own separate scroll animation. The transition is tied directly to the hero's scroll range, so everything feels like one continuous movement. As the crowd moves toward the camera and fades out, the main character gradually settles into her final pose. The crowd is mostly gone by around 60% of the transition, while the camera movement continues, making the change between the two scenes feel smooth instead of having both scenes fully visible at the same time.

- **Rigged character:** I recreated the character animation by mapping each Lottie layer to a DOM element. The positioning, rotation, scaling, and transform origins are handled with CSS transforms, and I used nested DOM elements to reproduce the parenting structure from After Effects, with the layer order reversed to match how the original animation is structured. The legs are a stroked SVG polyline whose knee and ankle points are tweened as numbers and written back into the path.


- **Continuous bubble field:** The bubbles run independently from the scroll animation. Eight bubbles continuously move from the bottom of the screen to the top, with different speeds and starting positions so they don't bunch together. Each bubble travels far enough to completely leave the section before restarting, which keeps the loop seamless without any visible jump.
I also separated each bubble into its own image and cropped it to the actual artwork bounds. The original sprite sheets had some sizing issues, where one shape was clipped and parts of neighboring shapes showed through. Using individual assets fixed those problems and gave each bubble cleaner positioning.

- **Responsive:** I tested the layout across three breakpoints — mobile, tablet, and desktop — using 390×844, 820×1180, and 1440×900 viewports. The mosaic tile size is calculated based on the viewport width so it scales properly across different screen sizes. In an earlier version, I used a 64vh value as part of the calculation, which became 455px on a phone and made a single row stretch to more than 2,000px wide. Removing that and basing the tile size on the viewport width fixed the issue.

- **Every character animates:** All the tiles in the mosaic float and sway, not just a subset. Each one gets its own duration, delay, drift distance, and rotation, seeded from its grid position so the rhythm stays stable across re-renders and resizes instead of reshuffling. The float sits on the tile and the sway on an inner wrapper, because a single element can't animate `transform` twice, and giving them separate periods is what stops the whole wall breathing in unison.

- **Performance and motion preferences:** The animations only use transform and opacity, so nothing triggers layout or repaint. The tile idle motion runs as CSS keyframes rather than GSAP tweens: a tall phone needs around 91 tiles, and two GSAP tweens each would be 182 tweens the main thread recalculates and writes every frame, whereas CSS animations are handed to the compositor once and cost no per-frame JavaScript. That's what makes animating all of them affordable. I deliberately left `will-change` off the tiles too, since pinning a compositor layer per tile would cost more than it saves.



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

### Verification notes

Responsive behaviour was confirmed by measuring layout geometry at 390×844, 820×1180, and 1440×900 — tile size, grid dimensions, and full viewport coverage at each. The deployed build was checked for asset integrity (0 broken images of 40). Animation timing was verified by scrubbing the GSAP timelines and reading back computed transforms rather than by eye.

Together the three screens cover the full brief: a genuine loading gate, a scroll-scrubbed transition between sections, and continuous idle motion that keeps running once the visitor stops scrolling.

