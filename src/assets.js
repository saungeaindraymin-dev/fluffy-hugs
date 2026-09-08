export const AVATARS = Array.from(
  { length: 16 },
  (_, i) => `/images/img${i + 1}.webp`,
);

export const CENTER_IMG = "/images/center-human.webp";
export const LOGO_IMG = "/images/logo.webp";
export const LOADING_IMG = "/images/loading.webp";

export const HUMAN_PARTS = {
  body: "/images/hoodies-body.png",
  neck: "/images/neck.png",
  head: "/images/head.png",
  hair: "/images/hair.png",
  cat: "/images/orange-cat.png",
  headphone: "/images/red-headphone.png",
  armFar: "/images/hoodies-left-hand.png",
  handFar: "/images/left-hand.png",
  armNear: "/images/hoodies-hand.png",
  handNear: "/images/hand-and-phone.png",
  foot: "/images/foot.png",
};

export const HERO_ASSETS = [...AVATARS, CENTER_IMG, LOGO_IMG];

export function preloadImages(
  sources,
  { onProgress, timeoutMs = 12000, decodeTimeoutMs = 2000 } = {},
) {
  let done = 0;
  const tick = () => onProgress?.(++done / sources.length);
  const cap = (promise, ms) =>
    Promise.race([promise, new Promise((r) => setTimeout(r, ms))]);

  const all = Promise.all(
    sources.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          const finish = () => {
            tick();
            resolve();
          };
          img.onload = () => {
            if (img.decode) {
              cap(
                img.decode().catch(() => {}),
                decodeTimeoutMs,
              ).then(finish);
            } else {
              finish();
            }
          };
          img.onerror = finish;
          img.src = src;
        }),
    ),
  );

  return Promise.race([all, new Promise((r) => setTimeout(r, timeoutMs))]);
}
