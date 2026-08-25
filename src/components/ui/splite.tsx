import { Suspense, lazy } from 'react';
import { preloadSplineModule, markSplineLoaded } from '../../lib/splinePreload';

const Spline = lazy(() => preloadSplineModule());

interface SplineSceneProps {
  scene: string;
  className?: string;
  onLoad?: (splineApp: any) => void;
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  const handleLoad = (splineApp: any) => {
    markSplineLoaded();
    onLoad?.(splineApp);
  };

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        </div>
      }
    >
      <Spline scene={scene} className={className} onLoad={handleLoad} />
    </Suspense>
  );
}

