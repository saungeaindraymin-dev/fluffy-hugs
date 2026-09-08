import { useEffect, useRef } from "react";
import gsap from "gsap";
import "../styles/loader.scss";
import { HERO_ASSETS, LOADING_IMG, preloadImages } from "../assets.js";

const MIN_VISIBLE_MS = 2000;

export default function Loader({ onExitStart, onComplete }) {
  const rootRef = useRef(null);
  const figureRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const startedAt = performance.now();
    let killed = false;
    let bob;

    if (prefersReduced) {
      gsap.set(figureRef.current, { opacity: 1, y: 0, scale: 1 });
    } else {
      gsap.to(figureRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
      });
      bob = gsap.to(figureRef.current, {
        y: -14,
        duration: 0.9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.7,
      });
    }

    function exit() {
      if (killed) return;
      bob?.kill();
      onExitStart?.();

      if (prefersReduced) {
        onComplete?.();
        return;
      }

      rootRef.current.style.pointerEvents = "none";
      gsap
        .timeline({ onComplete: () => onComplete?.() })
        .to(figureRef.current, { opacity: 0, y: -18, duration: 0.35, ease: "power2.in" })
        .to(rootRef.current, { opacity: 0, duration: 0.9, ease: "power1.inOut" }, 0.2);
    }


    preloadImages(HERO_ASSETS).then(() => {
      if (killed) return;
      const held = performance.now() - startedAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - held);

      setTimeout(() => {
        if (killed) return;
        let fired = false;
        const go = () => {
          if (fired) return;
          fired = true;
          exit();
        };
        requestAnimationFrame(() => requestAnimationFrame(go));
        setTimeout(go, 400);
      }, wait);
    });

    return () => {
      killed = true;
      bob?.kill();
      gsap.killTweensOf([figureRef.current, rootRef.current]);
    };
  }, [onExitStart, onComplete]);

  return (
    <div className="loader" ref={rootRef} aria-hidden="true">
      <img
        ref={figureRef}
        src={LOADING_IMG}
        alt="Loading"
        width="200"
        height="200"
      />
    </div>
  );
}
