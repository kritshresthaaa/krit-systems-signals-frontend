import { useState } from 'react';

const SIGNAL_NODES = [
  {
    slug: 'evalforge',
    className: 'node n1',
    lines: ['AI', 'evals'],
  },
  {
    slug: 'incident-twin',
    className: 'node n2',
    lines: ['reliability', 'ops'],
  },
  {
    slug: 'panic-button',
    className: 'node n3',
    lines: ['product', 'launch'],
  },
  {
    slug: 'poster-001-printer',
    className: 'node n4',
    lines: ['campus', 'design'],
  },
];

export function Hero({
  allProjects,
  onFocusArchitecture,
  onFocusCreativeWork,
}) {
  const [boardNote, setBoardNote] = useState(
    'Select a signal to bring its work into focus.'
  );

  const handleNodeClick = (slug) => {
    const project = allProjects.find((item) => item.slug === slug);
    if (!project) return;
    setBoardNote(`${project.title}: ${project.summary}`);
    if (project.kind === 'technical') {
      onFocusArchitecture(project.slug);
    } else {
      onFocusCreativeWork(project.kind);
    }
  };

  return (
    <section className="hero wrap">
      <div className="hero-grid">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            applied AI, backend systems &amp; creative technology
          </div>
          <h1>
            I build <i>useful</i> systems people can understand.
          </h1>
          <p className="lede">
            I’m Krit, a software engineer and graduate assistant working where
            agentic AI, reliable backend services, interactive campaigns, and
            clear visual communication overlap.
          </p>
          <div className="actions">
            <a className="btn" href="#systems">
              Explore technical systems
            </a>
            <a className="btn light" href="#work">
              View campaigns &amp; design
            </a>
          </div>
        </div>

        <div className="signal-board" aria-label="Interactive system signal map">
          <div className="orbit">
            {SIGNAL_NODES.map((node) => (
              <button
                key={node.slug}
                type="button"
                className={node.className}
                onClick={() => handleNodeClick(node.slug)}
              >
                {node.lines[0]}
                <br />
                {node.lines[1]}
              </button>
            ))}
            <div className="core">
              clear
              <br />
              systems
            </div>
          </div>
          <p className="board-note">{boardNote}</p>
        </div>
      </div>
    </section>
  );
}
