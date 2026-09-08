import { useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Loader from "./components/Loader.jsx";
import Hero from "./components/Hero.jsx";
import Collection from "./components/Collection.jsx";
import Chrome from "./components/Chrome.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [revealHero, setRevealHero] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  const handleExitStart = useCallback(() => setRevealHero(true), []);
  const handleComplete = useCallback(() => setLoaderGone(true), []);

  useEffect(() => {
    if (!revealHero) return;
    const refresh = () => ScrollTrigger.refresh();
    const id = requestAnimationFrame(() => requestAnimationFrame(refresh));
    window.addEventListener("load", refresh);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("load", refresh);
    };
  }, [revealHero]);

  return (
    <>
      <Hero start={revealHero} />
      <Collection />
      <Chrome start={revealHero} />
      {!loaderGone && (
        <Loader onExitStart={handleExitStart} onComplete={handleComplete} />
      )}
    </>
  );
}
