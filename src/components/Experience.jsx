const EXPERIENCES = [
  {
    period: 'SEP 2025 — PRESENT',
    role: 'Graduate Assistant',
    org: 'Texas Tech University',
    location: 'Lubbock, Texas',
    accent: 'mint',
    highlights: [
      'Support undergraduate Python analytics and data-mining courses through labs, debugging, project guidance, and technical instruction.',
      'Guide students in Python programming, data analysis, machine learning concepts, and practical analytics workflows.',
      'Collaborate with faculty on grading, course operations, instructional materials, and technical troubleshooting.',
    ],
    tags: ['Python', 'Data Mining', 'Machine Learning', 'Analytics'],
  },
  {
    period: 'FEB 2024 — JAN 2025',
    role: 'Associate Backend Developer',
    org: 'Innovate Tech Nepal',
    location: 'Kathmandu, Nepal',
    accent: 'coral',
    highlights: [
      'Developed microservice-oriented REST APIs for MySecondTeacher, an EdTech SaaS platform, using ASP.NET Core, Clean Architecture, and Repository Pattern.',
      'Designed versioned API contracts and Swagger specifications in collaboration with frontend and product teams.',
      'Implemented JWT authentication and role-based access control (RBAC) using ASP.NET Identity across protected workflows.',
      'Integrated AWS S3 and SES for document storage and automated notifications, reducing manual operational work by 40%.',
      'Led backend trainee group with code reviews and technical guidance, increasing team delivery speed by 25%.',
    ],
    tags: [
      'ASP.NET Core',
      'C#',
      'Clean Architecture',
      'REST APIs',
      'JWT / RBAC',
      'AWS S3 & SES',
      'Swagger',
    ],
  },
  {
    period: '2022 — 2023',
    role: 'Business Department Officer Intern',
    org: 'Herald College Kathmandu',
    location: 'Kathmandu, Nepal',
    accent: 'sun',
    highlights: [
      'Counseled prospective students on degree pathways at Herald College Kathmandu and its academic partner, University of Wolverhampton.',
    ],
    tags: ['Student Counseling', 'Academic Advising', 'Communications'],
  },
];

const EDUCATION = [
  {
    period: 'AUG 2025 — AUG 2027',
    degree: 'Master of Science in Information Systems',
    school: 'Texas Tech University, Rawls College of Business',
    location: 'Lubbock, Texas',
  },
  {
    period: 'MAY 2024',
    degree: 'Bachelor of Science (Hons) in Computer Science',
    school: 'University of Wolverhampton',
    location: 'Wolverhampton, United Kingdom · First-Class Honors (GPA: 3.87)',
  },
];

const SKILL_GROUPS = [
  {
    label: 'Languages & Data',
    items: ['Python', 'C#', 'SQL', 'JavaScript', 'PostgreSQL', 'pgvector', 'Redis', 'SQL Server', 'Pandas'],
  },
  {
    label: 'AI / LLM Systems',
    items: ['LLMs', 'LangGraph', 'RAG', 'Embeddings', 'Tool Calling', 'AI Agents', 'Agent Evaluation', 'Human-in-the-Loop'],
  },
  {
    label: 'Backend, Cloud & BI',
    items: ['FastAPI', 'ASP.NET Core', 'REST APIs', 'JWT / RBAC', 'React.js', 'AWS', 'Docker', 'OpenTelemetry', 'Power BI'],
  },
];

const HONORS = [
  'TTU ISQS Departmental Scholarships (ISQS & N. Shaw Graduate Business)',
  'Best IT Final Year Project — 2024',
  'AAA Merit Scholarships — Academic excellence & performance',
  'Fully Funded UK Fellowship Exchange — Leadership & academic achievement',
];

export function Experience() {
  return (
    <section id="experience">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              experience, education &amp; technical stack
            </div>
            <h2>Production backend work, applied AI, and technical mentorship.</h2>
          </div>
          <p className="note">
            Real roles across EdTech SaaS engineering, graduate instruction, and
            student advising.
          </p>
        </div>

        <div className="exp-grid">
          <div className="exp-column">
            <h3 className="exp-subhead">Work Experience</h3>
            <div className="exp-list">
              {EXPERIENCES.map((item) => (
                <article key={`${item.role}-${item.org}`} className={`exp-card ${item.accent}`}>
                  <div className="exp-card-top">
                    <span className="exp-period">{item.period}</span>
                    <span className="exp-location">{item.location}</span>
                  </div>
                  <h4>{item.role}</h4>
                  <p className="exp-org">{item.org}</p>
                  <ul className="exp-bullets">
                    {item.highlights.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="chips">
                    {item.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="exp-column exp-side">
            <div className="exp-panel">
              <h3 className="exp-subhead">Education</h3>
              <ul className="timeline">
                {EDUCATION.map((edu) => (
                  <li key={edu.degree}>
                    <b>{edu.period}</b>
                    <div>
                      <strong>{edu.degree}</strong>
                      <span>{edu.school}</span>
                      <small className="exp-edu-meta">{edu.location}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="exp-panel">
              <h3 className="exp-subhead">Technical Skills</h3>
              <div className="skill-groups">
                {SKILL_GROUPS.map((group) => (
                  <div key={group.label} className="skill-group">
                    <span className="skill-label">{group.label}</span>
                    <div className="chips">
                      {group.items.map((skill) => (
                        <span key={skill} className="chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="exp-panel exp-honors">
              <h3 className="exp-subhead">Honors &amp; Awards</h3>
              <ul className="honors-list">
                {HONORS.map((honor) => (
                  <li key={honor}>{honor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
