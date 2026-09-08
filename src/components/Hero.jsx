import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import "../styles/hero.scss";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AVATARS, CENTER_IMG } from "../assets.js";

gsap.registerPlugin(ScrollTrigger);

const CENTER_Z = 5;

/* Tiles overlap by 45% horizontally and 68% vertically (see hero.css), so one
   tile only advances the wall by 0.55x across and 0.32x down. A fixed 7x8 grid
   therefore cannot cover every viewport: on a 390x844 phone the tile resolved to
   455px and a row came out 2068px wide, so the screen showed one hugely
   magnified avatar instead of a mosaic. Size the grid from the tile that CSS
   actually resolved, plus a couple of tiles of bleed on each edge. */
const H_PITCH = 0.55;
const V_PITCH = 0.32;

function measureGrid() {
  /* Measure a rendered tile, NOT the custom property: getPropertyValue("--tile")
     hands back the unresolved token ("clamp(190px, 52vw, 280px)"), so parseFloat
     returns NaN and the grid silently falls back to its default. offsetWidth is
     layout, so it is not skewed by the wall's reveal scale. */
  const tileEl = document.querySelector(".tile");
  const tile = tileEl ? tileEl.offsetWidth : 0;
  if (!tile) return { rows: 7, cols: 8 };
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cols = Math.ceil((w + tile * 0.45) / (tile * H_PITCH)) + 2;
  const rows = Math.ceil(Math.max(0, h - tile) / (tile * V_PITCH)) + 3;
  return {
    rows: Math.min(Math.max(rows, 6), 16),
    cols: Math.min(Math.max(cols, 4), 14),
  };
}

/* Every tile carrying two infinite tweens is fine at 56 tiles and not fine at
   140, which is what a tall phone needs. Cap how many actually animate and
   spread the chosen ones evenly, so the wall still reads as alive without the
   tween count tracking the grid size. */
const MAX_ANIMATED = 44;

/* Shared by every tween that scrubs on the hero's range (here, the floating rig
   and the second screen's wordmark/blobs). A slightly lazier catch-up than the
   old 0.6 smooths the whole hand-off; they must match or the parts of one move
   arrive at different times. */
export const SCRUB = 1;

export default function Hero({ start }) {
  const [{ rows, cols }, setGrid] = useState(() => ({ rows: 7, cols: 8 }));
  const wallRef = useRef(null);
  const centerRef = useRef(null);
  const centerImgRef = useRef(null);

  useEffect(() => {
    const apply = () => setGrid((prev) => {
      const next = measureGrid();
      return prev.rows === next.rows && prev.cols === next.cols ? prev : next;
    });
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const grid = useMemo(
    () =>
      Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
          src: AVATARS[(r * 3 + c) % AVATARS.length],
          drop: ((r * 7 + c * 5) % 5) * 0.03,
        })),
      ),
    [rows, cols],
  );

  useEffect(() => {
    if (!start) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tileEls = wallRef.current.querySelectorAll(".tile");

    if (prefersReduced) {
      gsap.set(wallRef.current, { scale: 1 });
      return;
    }

    gsap.to(wallRef.current, {
      scale: 1,
      duration: 1.6,
      ease: "power2.out",
      overwrite: "auto",
    });

    const step = Math.max(1, Math.ceil(tileEls.length / MAX_ANIMATED));
    const animated = Array.from(tileEls).filter((_, i) => i % step === 0);

    animated.forEach((tile) => {
      gsap.to(tile, {
        y: gsap.utils.random(-42, -20),
        duration: gsap.utils.random(0.8, 1.35),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 0.9),
      });
      gsap.to(tile, {
        rotation: gsap.utils.random(-3.5, 3.5),
        duration: gsap.utils.random(1.6, 2.6),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 1.2),
      });
    });

    gsap.to(centerImgRef.current, {
      y: -44,
      duration: 1.05,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 0.4,
    });

    return () => {
      gsap.killTweensOf(wallRef.current);
      gsap.killTweensOf(tileEls);
      gsap.killTweensOf(centerImgRef.current);
    };
  }, [start, rows, cols]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(wallRef.current, { scale: 1.05 });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* One timeline instead of two linear tweens, so the dolly and the fade can
       run on different curves and different windows.

       The crowd now clears by 60% of the range while the zoom keeps going. It
       used to fade linearly across the whole range, which meant that at 30% the
       resting girl was already fully opaque on top of a crowd still at 70% —
       both readings of the character on screen at once. power2.in also gives the
       dolly an accelerating push toward the camera rather than a constant rate. */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });

    tl.to(wallRef.current, { scale: 1.9, ease: "power2.in", duration: 1 }, 0)
      .to(wallRef.current, { opacity: 0, ease: "power1.in", duration: 0.6 }, 0)
      .to(centerRef.current, { scale: 2.6, ease: "power2.in", duration: 1 }, 0)
      .to(centerRef.current, { opacity: 0, ease: "power1.in", duration: 0.6 }, 0);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const wx = gsap.quickTo(wallRef.current, "x", { duration: 0.8, ease: "power3.out" });
    const wy = gsap.quickTo(wallRef.current, "y", { duration: 0.8, ease: "power3.out" });
    const cx = gsap.quickTo(centerRef.current, "x", { duration: 0.7, ease: "power3.out" });
    const cy = gsap.quickTo(centerRef.current, "y", { duration: 0.7, ease: "power3.out" });

    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      wx(nx * -22);
      wy(ny * -22);
      cx(nx * -12);
      cy(ny * -12);
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section className="hero">
      <div className="hero-wall" ref={wallRef}>
        {grid.map((row, r) => (
          <div className="row" key={r} style={{ zIndex: r }}>
            {row.map((cell, c) => (
              <div
                className="tile"
                key={c}
                style={{ marginTop: `calc(var(--tile) * ${cell.drop})` }}
              >
                <img src={cell.src} alt="" decoding="async" />
              </div>
            ))}
          </div>
        ))}

        <div className="hero-center" ref={centerRef} style={{ zIndex: CENTER_Z }}>
          <img ref={centerImgRef} src={CENTER_IMG} alt="" />
        </div>
      </div>

    </section>
  );
}
