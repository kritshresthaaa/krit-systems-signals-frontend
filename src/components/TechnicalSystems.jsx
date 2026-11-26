import { useEffect, useState } from 'react';
import { MODULE_NOTES } from '../data/moduleNotes';

const DEFAULT_CONSOLE_TEXT =
  'Select “Run request” to inspect the JSON schema powering this system.';

export function TechnicalSystems({
  projects,
  activeProject,
  onSelectProject,
}) {
  const [selectedModule, setSelectedModule] = useState(
    activeProject.modules[0]
  );
  const [consoleOutput, setConsoleOutput] = useState(DEFAULT_CONSOLE_TEXT);
  const [catalogSource, setCatalogSource] = useState('local-bundle');

  useEffect(() => {
    setSelectedModule(activeProject.modules[0]);
    setConsoleOutput(DEFAULT_CONSOLE_TEXT);
  }, [activeProject]);

  useEffect(() => {
    let cancelled = false;
    async function checkApi() {
      try {
        const res = await fetch('/api/projects?kind=technical');
        if (res.ok) {
          const json = await res.json();
          if (!cancelled && json.source) {
            setCatalogSource(json.source);
          }
        }
      } catch {
        // Automatic local bundle fallback
      }
    }
    checkApi();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRunRequest = async () => {
    setConsoleOutput('fetching…');
    try {
      const res = await fetch(`/api/projects/${activeProject.slug}`);
      if (res.ok) {
        const json = await res.json();
        setConsoleOutput(JSON.stringify(json, null, 2));
        return;
      }
    } catch {
      // Fall back to bundled project schema
    }
    setConsoleOutput(
      JSON.stringify(
        {
          status: 200,
          source: 'local-bundle',
          project: activeProject,
        },
        null,
        2
      )
    );
  };

  return (
    <section id="systems">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              technical systems / engineering &amp; architecture
            </div>
            <h2>Systems built for reliability, evaluation, and clarity.</h2>
          </div>
          <p className="note">
            Select any system below to inspect its module pipeline, design
            trade-offs, and JSON contract.
          </p>
        </div>

        <div className="api-strip">
          <p>
            <code>GET /api/projects?kind=technical</code>
            <br />
            Backed by a clean JSON schema (<code>data/projects.json</code>)
            ready for Cloudflare Workers, with automatic local fallback.
          </p>
          <span className="status">
            {catalogSource === 'local-bundle' ? 'API ready' : catalogSource} ·{' '}
            {projects.length} technical systems
          </span>
        </div>

        <div className="projects two-col tech-grid">
          {projects.map((project) => {
            const isSelected = project.slug === activeProject.slug;
            return (
              <article
                key={project.slug}
                className={`project ${project.color}${isSelected ? ' is-selected' : ''}`}
              >
                <span className="orb" />
                <div>
                  <span className="label">{project.label}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="chips">
                    {project.stack.map((tech) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className={`btn sm${isSelected ? ' lime' : ''}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectProject(project.slug)}
                  >
                    {isSelected
                      ? 'Active in Architecture Map ↓'
                      : 'Inspect Architecture ↓'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="architecture-inspector"
          aria-live="polite"
          aria-label={`Architecture map for ${activeProject.title}`}
        >
          <div className="inspector-head">
            <div>
              <span className="carousel-kicker">
                ARCHITECTURE MAP · {activeProject.label.toUpperCase()}
              </span>
              <h3>{activeProject.title}</h3>
            </div>
            <div className="inspector-tabs" role="tablist" aria-label="Switch active technical system">
              {projects.map((project) => (
                <button
                  key={project.slug}
                  type="button"
                  role="tab"
                  className="c-pill"
                  aria-selected={project.slug === activeProject.slug}
                  aria-current={project.slug === activeProject.slug}
                  onClick={() => onSelectProject(project.slug)}
                >
                  {project.title}
                </button>
              ))}
            </div>
          </div>

          <div className="workspace">
            <p>{activeProject.detail}</p>

            <div className="pipeline" aria-label="System modules">
              {activeProject.modules.map((mod, idx) => (
                <div key={mod} className="pipeline-node">
                  <button
                    className="module"
                    type="button"
                    aria-pressed={selectedModule === mod}
                    onClick={() => setSelectedModule(mod)}
                  >
                    <span className="module-step">0{idx + 1}</span>
                    {mod}
                  </button>
                  {idx < activeProject.modules.length - 1 && (
                    <span className="pipeline-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="module-note">
              {MODULE_NOTES[selectedModule] || 'System module active.'}
            </div>

            <div className="api-console">
              <div className="console-head">
                <span>
                  LIVE API INSPECTOR ·{' '}
                  <span>{`GET /api/projects/${activeProject.slug}`}</span>
                </span>
                <button type="button" onClick={handleRunRequest}>
                  Run request
                </button>
              </div>
              <pre className="console-body">{consoleOutput}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
