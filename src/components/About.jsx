export function About() {
  return (
    <section id="about">
      <div className="wrap about">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            the person behind the systems
          </div>
          <h2>A builder who makes the messy middle legible.</h2>
        </div>

        <div className="about-copy">
          <p>
            From Kathmandu to Lubbock, I’ve learned that the useful work sits
            between structured engineering, curious investigation, and clear
            communication.
          </p>
          <ul className="timeline">
            <li>
              <b>FOCUS</b>
              <div>
                <strong>AI / Applied AI &amp; Backend Engineering</strong>
                Agentic workflows, LLM evaluation, REST APIs, and cloud
                automation across Python, FastAPI, ASP.NET Core, and AWS.
              </div>
            </li>
            <li>
              <b>SYSTEMS</b>
              <div>
                <strong>Business Analysis &amp; Data Quality</strong>
                Requirements traceability, SQL validation, Power BI reporting,
                and operations exception intelligence.
              </div>
            </li>
            <li>
              <b>CREATIVE</b>
              <div>
                <strong>
                  Product Launch, Paid Social &amp; Campus IT Design
                </strong>
                Interactive web experiences, anti-advertising campaigns, and
                high-visibility poster systems.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
