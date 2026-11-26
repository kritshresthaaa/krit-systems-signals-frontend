import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';

const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', Icon: Monitor },
  { id: 'tablet', label: 'Tablet', Icon: Tablet },
  { id: 'mobile', label: 'Mobile', Icon: Smartphone },
];

export function FullscreenModal({
  preview,
  carouselPosters = [],
  onSelectPreview,
  onClose,
}) {
  const dialogRef = useRef(null);
  const [viewport, setViewport] = useState('desktop');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (preview) {
      setViewport('desktop');
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (!preview && dialog.open) {
      dialog.close();
    }
  }, [preview]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return undefined;

    const isOutside = (e) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const carouselIdx = preview?.project
    ? carouselPosters.findIndex((p) => p.slug === preview.project.slug)
    : -1;
  const isCarousel = carouselIdx >= 0;

  const stepCarousel = (dir) => {
    if (!isCarousel || !onSelectPreview) return;
    const next =
      carouselPosters[
        (carouselIdx + dir + carouselPosters.length) % carouselPosters.length
      ];
    onSelectPreview(next, next.embedUrl);
  };

  const externalUrl = preview?.project
    ? preview.project.type === 'canva'
      ? preview.project.canvaUrl
      : preview.project.type === 'figma'
        ? preview.project.figmaUrl
        : preview.project.url
    : preview?.src;

  return (
    <dialog
      ref={dialogRef}
      className="fullscreen-dialog"
      closedby="any"
      aria-labelledby="modal-stage-title"
      onClose={() => {
        if (dialogRef.current) {
          dialogRef.current.returnValue = '';
        }
        onClose();
      }}
    >
      <div className="modal-head">
        <div className="modal-title-group">
          <h1 id="modal-stage-title" className="modal-title">
            {preview ? preview.title : 'Fullscreen Preview'}
          </h1>
          {isCarousel && (
            <span className="stage-sub">
              SLIDE 0{carouselIdx + 1} / 0{carouselPosters.length}
            </span>
          )}
        </div>

        <div className="modal-actions">
          {isCarousel && (
            <>
              <button
                className="c-pill"
                type="button"
                onClick={() => stepCarousel(-1)}
              >
                <ArrowLeft size={12} aria-hidden="true" />
                Prev
              </button>
              <button
                className="c-pill"
                type="button"
                onClick={() => stepCarousel(1)}
              >
                Next
                <ArrowRight size={12} aria-hidden="true" />
              </button>
            </>
          )}

          {VIEWPORTS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className="c-pill"
              type="button"
              aria-current={viewport === id}
              onClick={() => setViewport(id)}
            >
              <Icon size={12} aria-hidden="true" />
              {label}
            </button>
          ))}

          {externalUrl && (
            <a
              className="c-pill"
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Tab
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}

          <button
            className="c-pill"
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
          >
            <X size={13} aria-hidden="true" />
            Close [Esc]
          </button>
        </div>
      </div>

      <div className="modal-body modal-viewport-wrap">
        {preview && (
          <div
            className={`modal-frame${viewport === 'desktop' ? '' : ` ${viewport}`}`}
          >
            <iframe
              title={`Fullscreen Preview: ${preview.title}`}
              src={preview.src}
              allow="fullscreen"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </dialog>
  );
}
