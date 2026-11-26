import { useEffect, useRef, useState } from 'react';
import { Lock, MousePointerClick } from 'lucide-react';

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;

/**
 * Lazy-mounted, viewport-scaled iframe preview for standalone campaign apps.
 * Defers fetching until near the viewport and locks pointer-events by default
 * so page scrolling is never trapped inside embedded previews.
 */
export function CampaignPreviewFrame({ title, url, fitMode = 'desktop' }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / DESKTOP_WIDTH);
      }
    };

    updateScale();

    if (!('ResizeObserver' in window)) {
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="campaign-preview-box">
      <div className="campaign-preview-bar">
        <span className="campaign-preview-status">
          <span
            className={`preview-dot${isLoaded ? ' ready' : ''}`}
            aria-hidden="true"
          />
          {!shouldLoad
            ? 'QUEUED'
            : !isLoaded
              ? 'LOADING APP...'
              : isInteractive
                ? 'INTERACTIVE'
                : 'LIVE PREVIEW'}
        </span>

        <button
          type="button"
          className="preview-toggle-btn"
          aria-pressed={isInteractive}
          onClick={() => setIsInteractive((prev) => !prev)}
        >
          {isInteractive ? (
            <>
              <Lock size={11} aria-hidden="true" />
              Lock Scroll
            </>
          ) : (
            <>
              <MousePointerClick size={11} aria-hidden="true" />
              Interact
            </>
          )}
        </button>
      </div>

      <div ref={containerRef} className="campaign-preview-viewport">
        {!isLoaded && (
          <div className="campaign-preview-placeholder" aria-hidden="true">
            <span>{title}</span>
            <small>Loading interactive sandbox…</small>
          </div>
        )}

        {shouldLoad && (
          <iframe
            title={`Live preview of ${title}`}
            src={url}
            width={fitMode === 'desktop' ? DESKTOP_WIDTH : undefined}
            height={fitMode === 'desktop' ? DESKTOP_HEIGHT : undefined}
            loading="lazy"
            allow="fullscreen"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
            style={
              fitMode === 'desktop'
                ? {
                    width: `${DESKTOP_WIDTH}px`,
                    height: `${DESKTOP_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    pointerEvents: isInteractive ? 'auto' : 'none',
                  }
                : {
                    width: '100%',
                    height: '100%',
                    pointerEvents: isInteractive ? 'auto' : 'none',
                  }
            }
          />
        )}

        {!isInteractive && isLoaded && (
          <button
            type="button"
            className="campaign-preview-shield"
            aria-label={`Enable interaction inside ${title} preview`}
            onClick={() => setIsInteractive(true)}
          >
            <span className="shield-pill">
              <MousePointerClick size={12} aria-hidden="true" />
              Click to interact
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
