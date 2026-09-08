import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/chrome.scss";
import { LOGO_IMG } from "../assets.js";

gsap.registerPlugin(ScrollTrigger);

export default function Chrome({ start }) {
  const logoRef = useRef(null);
  const socialsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!start) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const targets = [logoRef.current, ...socialsRef.current.children, ctaRef.current];

    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.5, defaults: { ease: "power3.out" } });
    tl.fromTo(logoRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.7 });
    tl.fromTo(
      [socialsRef.current.children, ctaRef.current],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
      "-=0.45",
    );

    const fade = gsap.to(logoRef.current, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tl.kill();
      fade.scrollTrigger?.kill();
      fade.kill();
    };
  }, [start]);

  return (
    <>
      <img className="chrome-logo" ref={logoRef} src={LOGO_IMG} alt="Fluffy HUGS" />

      <nav className="chrome-socials" ref={socialsRef} aria-label="Social links">
        <a className="social" href="#" aria-label="Discord">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a18.3 18.3 0 0 0-5.5 0L9.5 3A19.7 19.7 0 0 0 4.6 4.4C1.5 9 .7 13.5 1.1 17.9a19.9 19.9 0 0 0 6 3 .1.1 0 0 0 .1 0c.5-.6.9-1.3 1.2-2a.1.1 0 0 0 0-.1 13 13 0 0 1-1.9-.9.1.1 0 0 1 0-.1l.4-.3h.1a14.2 14.2 0 0 0 12 0h.1l.4.3a.1.1 0 0 1 0 .1 12.3 12.3 0 0 1-1.9.9.1.1 0 0 0 0 .1c.3.7.8 1.4 1.2 2a.1.1 0 0 0 .1 0 19.8 19.8 0 0 0 6-3c.5-5.2-.8-9.7-3.5-13.5ZM8 15.3c-1.2 0-2.1-1.1-2.1-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4S9.2 15.3 8 15.3Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Z" />
          </svg>
        </a>
        <a className="social" href="#" aria-label="OpenSea">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24ZM5.9 12.4l.1-.1 2.2-3.5a.1.1 0 0 1 .2 0c.4.8.7 1.9.5 2.6-.1.3-.2.7-.4 1a2 2 0 0 1-.1.2H6a.1.1 0 0 1-.1-.2Zm13 1.6a.2.2 0 0 1-.1.1l-.9.6c-.6.4-.8 1-.8 1a3.7 3.7 0 0 1-3.2 2.3H7.6a3.6 3.6 0 0 1-3.6-3.6v-.1a.1.1 0 0 1 .1-.1h4a.2.2 0 0 1 .2.2c0 .2.1.4.2.5.2.4.6.7 1.1.7h2v-1.6H9.6a.2.2 0 0 1-.1-.3c.5-.6 1.2-1.6 1.6-2.8.4-1.2.2-2.4 0-3.2a4.5 4.5 0 0 0-.6-1.4V6.4c0-.9.7-1.6 1.6-1.6.5 0 .9.2 1.2.5v.1c.6 1 1.9 3.2 2.4 5.1.3 1.2.3 2.2.2 2.9h1.2a.2.2 0 0 1 .2.2v.4Z" />
          </svg>
        </a>
        <a className="social" href="#" aria-label="Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 4.6a9.8 9.8 0 0 1-2.8.8A4.9 4.9 0 0 0 23.3 2.7a9.9 9.9 0 0 1-3.1 1.2 4.9 4.9 0 0 0-8.4 4.5A13.9 13.9 0 0 1 1.6 3.2a4.9 4.9 0 0 0 1.5 6.6A4.9 4.9 0 0 1 .9 9.1v.1a4.9 4.9 0 0 0 3.9 4.8 5 5 0 0 1-2.2.1 4.9 4.9 0 0 0 4.6 3.4A9.9 9.9 0 0 1 0 19.5a13.9 13.9 0 0 0 7.5 2.2c9.1 0 14-7.5 14-14v-.6A9.9 9.9 0 0 0 24 4.6Z" />
          </svg>
        </a>
      </nav>

      <button className="chrome-cta" ref={ctaRef} type="button">
        view collection
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </>
  );
}
