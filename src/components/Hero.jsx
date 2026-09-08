import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import "../styles/hero.scss";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AVATARS, CENTER_IMG } from "../assets.js";

gsap.registerPlugin(ScrollTrigger);

const CENTER_Z = 5;
const H_PITCH = 0.55;
const V_PITCH = 0.32;

function measureGrid() {

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


const rnd = (min, max, seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return min + (x - Math.floor(x)) * (max - min);
};

function tileMotion(r, c) {
  const s = r * 31 + c * 17;
  const swayDeg = rnd(4.5, 10, s + 3);
  return {

    "--float-k": rnd(-0.12, -0.055, s).toFixed(4),
    "--float-dur": `${rnd(1.0, 1.9, s + 1).toFixed(2)}s`,
    "--float-delay": `${rnd(-1.9, 0, s + 2).toFixed(2)}s`,
    "--sway-deg": `${(rnd(0, 1, s + 6) > 0.5 ? swayDeg : -swayDeg).toFixed(2)}deg`,
    "--sway-dur": `${rnd(1.5, 2.7, s + 4).toFixed(2)}s`,
    "--sway-delay": `${rnd(-2.7, 0, s + 5).toFixed(2)}s`,
  };
}

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
          motion: tileMotion(r, c),
        })),
      ),
    [rows, cols],
  );

  useEffect(() => {
    if (!start) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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
      gsap.killTweensOf(centerImgRef.current);
    };
  }, [start, rows, cols]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(wallRef.current, { scale: 1.05 });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
                style={{
                  marginTop: `calc(var(--tile) * ${cell.drop})`,
                  ...cell.motion,
                }}
              >
                <span className="tile-inner">
                  <img src={cell.src} alt="" decoding="async" />
                </span>
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
