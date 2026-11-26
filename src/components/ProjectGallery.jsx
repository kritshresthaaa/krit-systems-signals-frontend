import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import { CampaignPreviewFrame } from './CampaignPreviewFrame';

const TABS = [
  { kind: 'marketing', label: 'Interactive Campaigns (4)' },
  { kind: 'design', label: 'Design, UI/UX & Posters (9)' },
];

export function ProjectGallery({
  data,
  activeTab,
  onTabChange,
  onOpenFullscreen,
}) {
  const figmaPrototypes = data.posters.filter(
    (p) => p.series === 'figma-prototype'
  );
  const carouselPosters = data.posters.filter(
    (p) => p.series === 'campus-it-carousel'
  );
  const standalonePosters = data.posters.filter(
    (p) => p.series === 'standalone'
  );

  const [carouselIdx, setCarouselIdx] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (activeTab !== 'design') return undefined;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        setCarouselIdx((prev) => (prev + 1) % carouselPosters.length);
      } else if (e.key === 'ArrowLeft') {
        setCarouselIdx(
          (prev) => (prev - 1 + carouselPosters.length) % carouselPosters.length
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, carouselPosters.length]);

  const activePoster = carouselPosters[carouselIdx];

  const handlePrevPoster = () => {
    setCarouselIdx(
      (prev) => (prev - 1 + carouselPosters.length) % carouselPosters.length
    );
  };

  const handleNextPoster = () => {
    setCarouselIdx((prev) => (prev + 1) % carouselPosters.length);
  };

  return (
    <section id="work">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              creative technology / campaigns &amp; visual systems
            </div>
            <h2>Interactive campaigns &amp; campus design.</h2>
          </div>
          <p className="note">
            Interact with the campaign apps right inside their cards, or expand
            any piece into Desktop, Tablet, or Mobile view.
          </p>
        </div>

        <div className="tabs" role="tablist" aria-label="Creative work category">
          {TABS.map((tab) => (
            <button
              key={tab.kind}
              className="tab"
              role="tab"
              type="button"
              aria-selected={activeTab === tab.kind}
              onClick={() => onTabChange(tab.kind)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div id="work-content" aria-live="polite">
          {activeTab === 'design' ? (
            <>
              {figmaPrototypes.map((item) => (
                <article
                  key={item.slug}
                  className={`project ${item.color} figma-featured project-deferred`}
                >
                  <span className="orb" />
                  <div>
                    <span className="label">{item.label}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <CampaignPreviewFrame
                      title={item.title}
                      url={item.embedUrl}
                      fitMode="responsive"
                    />
                    <div className="chips">
                      {item.stack.map((tech) => (
                        <span key={tech} className="chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn lime sm"
                      type="button"
                      onClick={() => onOpenFullscreen(item, item.embedUrl)}
                    >
                      <Maximize2 size={13} aria-hidden="true" />
                      Fullscreen &amp; Viewports
                    </button>
                    <a
                      className="btn light sm"
                      href={item.figmaUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Figma
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}

              <div
                className="carousel-shell"
                id="poster-carousel"
                onTouchStart={(e) => {
                  touchStartX.current = e.changedTouches[0].screenX;
                }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].screenX - touchStartX.current;
                  if (Math.abs(dx) > 45) {
                    if (dx < 0) handleNextPoster();
                    else handlePrevPoster();
                  }
                }}
              >
                <div className="carousel-bar">
                  <div className="carousel-meta">
                    <span className="carousel-kicker">
                      CAMPUS IT SERIES · 0{carouselIdx + 1} / 0
                      {carouselPosters.length}
                    </span>
                    <span className="carousel-sub">Posters 001–004</span>
                  </div>
                  <div className="carousel-pills">
                    {carouselPosters.map((item, idx) => (
                      <button
                        key={item.slug}
                        className="c-pill"
                        type="button"
                        aria-current={idx === carouselIdx}
                        onClick={() => setCarouselIdx(idx)}
                      >
                        {item.shortTitle}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="carousel-body">
                  <div className="carousel-media">
                    <div className="canva-frame-box">
                      <iframe
                        loading="lazy"
                        src={activePoster.embedUrl}
                        title={activePoster.title}
                        allow="fullscreen"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  <div className="carousel-info">
                    <div>
                      <div className="eyebrow">
                        <span className="dot" />
                        {activePoster.label}
                      </div>
                      <h3>{activePoster.title}</h3>
                      <p className="carousel-detail">{activePoster.detail}</p>
                      <div className="chips">
                        {activePoster.stack.map((tech) => (
                          <span key={tech} className="chip">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn lime sm"
                          type="button"
                          onClick={() =>
                            onOpenFullscreen(activePoster, activePoster.embedUrl)
                          }
                        >
                          <Maximize2 size={13} aria-hidden="true" />
                          Fullscreen &amp; Viewports
                        </button>
                        <a
                          className="btn light sm"
                          href={activePoster.canvaUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Canva
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      </div>
                    </div>

                    <div className="carousel-controls">
                      <button
                        className="btn light sm"
                        type="button"
                        onClick={handlePrevPoster}
                      >
                        <ArrowLeft size={13} aria-hidden="true" />
                        Prev
                      </button>
                      <div className="dots">
                        {carouselPosters.map((item, idx) => (
                          <button
                            key={item.slug}
                            className="c-dot"
                            type="button"
                            aria-current={idx === carouselIdx}
                            aria-label={`Slide ${idx + 1}`}
                            onClick={() => setCarouselIdx(idx)}
                          />
                        ))}
                      </div>
                      <button
                        className="btn sm"
                        type="button"
                        onClick={handleNextPoster}
                      >
                        Next
                        <ArrowRight size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="projects two-col">
                {standalonePosters.map((item) => (
                  <article key={item.slug} className={`project ${item.color}`}>
                    <span className="orb" />
                    <div>
                      <span className="label">{item.label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <div className="canva-frame-box standalone-frame">
                        <iframe
                          loading="lazy"
                          src={item.embedUrl}
                          title={item.title}
                          allow="fullscreen"
                          allowFullScreen
                        />
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn lime sm"
                        type="button"
                        onClick={() => onOpenFullscreen(item, item.embedUrl)}
                      >
                        <Maximize2 size={13} aria-hidden="true" />
                        Fullscreen &amp; Viewports
                      </button>
                      <a
                        className="btn light sm"
                        href={item.canvaUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Canva
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="projects two-col">
              {data.campaigns.map((project) => (
                <article
                  key={project.slug}
                  className={`project ${project.color} project-deferred`}
                >
                  <span className="orb" />
                  <div>
                    <span className="label">{project.label}</span>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    {project.type === 'app' && project.url && (
                      <CampaignPreviewFrame
                        title={project.title}
                        url={project.url}
                      />
                    )}
                    <div className="chips">
                      {project.stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn lime sm"
                      type="button"
                      onClick={() => onOpenFullscreen(project, project.url)}
                    >
                      <Maximize2 size={13} aria-hidden="true" />
                      Fullscreen &amp; Viewports
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
