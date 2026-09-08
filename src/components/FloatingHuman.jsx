import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/floating-human.scss";
import { HUMAN_PARTS } from "../assets.js";
import { SCRUB } from "./Hero.jsx";

gsap.registerPlugin(ScrollTrigger);

const layer = (px, py, ax, ay, r = 0, s = 1) => ({
  transformOrigin: `${ax}px ${ay}px`,
  transform: `translate(${px - ax}px, ${py - ay}px) rotate(${r}deg) scale(${s})`,
});

const F = (f) => f / 30;
const LOOP = 60;

const LEG_FAR = {
  base: { x1: 448, y1: 978, x2: 660, y2: 1326, x3: 572, y3: 1738 },
  bent: { x2: 532, y2: 1310, x3: 444, y3: 1722 },
};
const LEG_NEAR = {
  base: { x1: 404, y1: 1014, x2: 616, y2: 1362, x3: 528, y3: 1774 },
  bent: { x2: 488, y2: 1346, x3: 400, y3: 1758 },
};

function morphLeg(tl, el, { base, bent }, outF) {
  const p = { ...base };
  const draw = () =>
    el.setAttribute("d", `M${p.x1} ${p.y1}L${p.x2} ${p.y2}L${p.x3} ${p.y3}`);
  draw();
  tl.to(p, { ...bent, duration: F(outF), onUpdate: draw }, 0).to(
    p,
    { ...base, duration: F(LOOP - outF), onUpdate: draw },
    F(outF),
  );
}

export default function FloatingHuman() {
  const rootRef = useRef(null);
  const faceRef = useRef(null);
  const armLRef = useRef(null);
  const armRRef = useRef(null);
  const legFarRef = useRef(null);
  const pathFarRef = useRef(null);
  const pathNearRef = useRef(null);
  const sockFarRef = useRef(null);
  const sockNearRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const heroEl = document.querySelector(".hero");

    const ctx = gsap.context(() => {
      gsap.set(rootRef.current, { scale: 2.4, rotation: 36, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          end: "bottom top",
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      });

      tl.to(rootRef.current, { opacity: 1, duration: 0.3, ease: "none" }, 0);
      tl.to(
        rootRef.current,
        { scale: 1, rotation: 0, duration: 1, ease: "power1.out" },
        0,
      );
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(sockNearRef.current, {
        x: 144,
        y: 172,
        rotation: 13,
        transformOrigin: "412px 1618px",
      });
      gsap.set(sockFarRef.current, {
        x: 188,
        y: 136,
        rotation: 13,
        transformOrigin: "412px 1618px",
      });

      const tl = gsap.timeline({
        repeat: -1,
        defaults: { ease: "sine.inOut" },
      });

      const swing = (el, vars, mid, out) => {
        tl.to(el, { ...vars, duration: F(out) }, 0).to(
          el,
          { ...mid, duration: F(LOOP - out) },
          F(out),
        );
      };

      swing(armLRef.current, { rotation: -5.242 }, { rotation: 6.758 }, 22);
      swing(armRRef.current, { rotation: -1 }, { rotation: -14 }, 35);
      swing(faceRef.current, { rotation: 0 }, { rotation: -3 }, 30);

      morphLeg(tl, pathNearRef.current, LEG_NEAR, 21);
      swing(sockNearRef.current, { x: 0, y: 148 }, { x: 144, y: 172 }, 21);

      morphLeg(tl, pathFarRef.current, LEG_FAR, 23);
      swing(sockFarRef.current, { x: 44, y: 112 }, { x: 188, y: 136 }, 23);
      swing(legFarRef.current, { rotation: -21 }, { rotation: 0 }, 23);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="human" ref={rootRef}>
      <div className="human-stage">
        <div
          className="part"
          ref={armRRef}
          style={layer(582.049, 519.395, 642, 518, -14, 1.1)}
        >
          <img src={HUMAN_PARTS.armFar} alt="" loading="lazy" />
          <div className="part" style={layer(752, 950, 752, 950)}>
            <img src={HUMAN_PARTS.handFar} alt="" loading="lazy" />
          </div>
        </div>

        <div
          className="part"
          ref={legFarRef}
          style={{ transformOrigin: "616px 898px" }}
        >
          <div className="part" ref={sockFarRef}>
            <img src={HUMAN_PARTS.foot} alt="" loading="lazy" />
          </div>
          <svg
            className="human-legs"
            viewBox="0 0 1200 1900"
            aria-hidden="true"
          >
            <path ref={pathFarRef} d="M448 978L660 1326L572 1738" />
          </svg>
        </div>

        <div className="part" ref={sockNearRef}>
          <img src={HUMAN_PARTS.foot} alt="" loading="lazy" />
        </div>
        <svg className="human-legs" viewBox="0 0 1200 1900" aria-hidden="true">
          <path ref={pathNearRef} d="M404 1014L616 1362L528 1774" />
        </svg>

        <div className="part" style={layer(520, 1090, 520, 982, 4)}>
          <div className="part" style={layer(524, 468, 524, 448)}>
            <div
              className="part"
              ref={faceRef}
              style={layer(526, 362, 526, 362, -3)}
            >
              <img className="z0" src={HUMAN_PARTS.hair} alt="" />
              <img className="z1" src={HUMAN_PARTS.head} alt="" />
              <img className="z2" src={HUMAN_PARTS.cat} alt="" />
              <img className="z3" src={HUMAN_PARTS.headphone} alt="" />
            </div>
            <img className="z0" src={HUMAN_PARTS.neck} alt="" />
          </div>
          <img className="z4" src={HUMAN_PARTS.body} alt="" />
        </div>

        <div
          className="part"
          ref={armLRef}
          style={layer(436, 594, 390.909, 526.364, 6.758, 1.1)}
        >
          <img src={HUMAN_PARTS.armNear} alt="" loading="lazy" />
          <div className="part" style={layer(496, 844, 500, 850)}>
            <img src={HUMAN_PARTS.handNear} alt="" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}
