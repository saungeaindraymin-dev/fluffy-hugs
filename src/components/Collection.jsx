import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/collection.scss";
import { LOGO_IMG } from "../assets.js";
import { SCRUB } from "./Hero.jsx";
import FloatingHuman from "./FloatingHuman.jsx";

gsap.registerPlugin(ScrollTrigger);
const BLOBS = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"];
const SPEED = [110, 150, 125, 90, 138, 102, 160, 118];

const BLOB_OPACITY = 1;
const PHASE = [0, 0.42, 0.68, 0.2, 0.85, 0.55, 0.12, 0.73];

export default function Collection() {
  const rootRef = useRef(null);
  const wordmarkRef = useRef(null);
  const blobsRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const blobEls = blobsRef.current.querySelectorAll(".blob");
    const driftEls = blobsRef.current.children;

    gsap.set(wordmarkRef.current, { xPercent: -50, yPercent: -50 });

    if (prefersReduced) {
      gsap.set(wordmarkRef.current, { opacity: 1, y: 0 });
      gsap.set(blobEls, { opacity: BLOB_OPACITY, scale: 1 });
      return;
    }

    const heroEl = document.querySelector(".hero");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          end: "bottom top",
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        blobEls,
        { opacity: 0, scale: 0.85, y: 40 },
        {
          opacity: BLOB_OPACITY,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: "none",
        },
        0.45,
      );

      tl.fromTo(
        wordmarkRef.current,
        { opacity: 0, scale: 1.12 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "none" },
        0.55,
      );

      let rises = [];

      const buildRise = () => {
        rises.forEach((t) => t.kill());
        const H = rootRef.current.offsetHeight;

        rises = Array.from(driftEls, (carrier, i) => {
          const sprite = carrier.firstElementChild;
          const o = sprite.offsetTop;
          const h = sprite.offsetHeight;
          const travel = H + h;

          return gsap
            .fromTo(
              carrier,
              { y: H - o },
              {
                y: -h - o,
                duration: travel / SPEED[i],
                ease: "none",
                repeat: -1,
              },
            )
            .progress(PHASE[i]); 
        });
      };

      buildRise();

      ScrollTrigger.addEventListener("refresh", buildRise);
      
      return () => ScrollTrigger.removeEventListener("refresh", buildRise);
    }, rootRef);

    return () => ctx.revert();
  }, []);
  

  return (
    <section className="collection" ref={rootRef}>
      <div className="collection-blobs" ref={blobsRef}>
        {BLOBS.map((b) => (
          <span className="blob-drift" key={b}>
            <span className={`blob blob-${b}`} />
          </span>
        ))}
      </div>

      <img
        className="collection-wordmark"
        ref={wordmarkRef}
        src={LOGO_IMG}
        alt="Fluffy HUGS"
      />

      <FloatingHuman />
    </section>
  );
}
