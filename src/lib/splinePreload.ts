/**
 * Shared preload cache for the Spline runtime + hero scene.
 *
 * The loading screen kicks this off the instant it mounts, so the ~heavy
 * @splinetool/react-spline chunk and the remote .splinecode scene download
 * in the background while the boot animation plays. Hero later calls the
 * same functions and gets the already-in-flight (or resolved) promise
 * instead of starting a second fetch.
 */

const HERO_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

let modulePromise: Promise<typeof import("@splinetool/react-spline")> | null = null;
let scenePromise: Promise<void> | null = null;

/** Starts (or reuses) the dynamic import of the Spline runtime bundle. */
export function preloadSplineModule() {
  if (!modulePromise) {
    modulePromise = import("@splinetool/react-spline");
  }
  return modulePromise;
}

/** Starts (or reuses) a raw fetch of the .splinecode scene so it's warm in the HTTP cache. */
export function preloadSplineScene(url: string = HERO_SCENE_URL) {
  if (!scenePromise) {
    scenePromise = fetch(url, { mode: "cors", credentials: "omit" })
      .then(() => undefined)
      .catch(() => undefined); // best-effort; Spline's own loader will retry if this fails
  }
  return scenePromise;
}

/** Kicks off both preloads together. Safe to call multiple times. */
export function preloadHeroSpline() {
  return Promise.all([preloadSplineModule(), preloadSplineScene()]);
}

let robotLoaded = false;
const listeners = new Set<() => void>();

export function markSplineLoaded() {
  if (!robotLoaded) {
    robotLoaded = true;
    listeners.forEach((fn) => fn());
    listeners.clear();
  }
}

export function isSplineLoaded() {
  return robotLoaded;
}

export function onSplineLoaded(callback: () => void) {
  if (robotLoaded) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export { HERO_SCENE_URL };

