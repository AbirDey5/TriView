import React, { useState } from "react";

const DEFAULT_DRAFT = `
Machine learning has become very popular, but many introductions either go
too deep into math or stay too high-level. In this blog post I want to give a
gentle, intuitive introduction to gradient descent using a simple example.
`.trim();

function FeedbackBlock({ title, feedback }) {
  if (!feedback) return null;

  return (
    <div className="card">
      <h3>{title}</h3>
      <section>
        <h4>Strengths</h4>
        <pre>{feedback.strengths}</pre>
      </section>
      <section>
        <h4>Issues</h4>
        <pre>{feedback.issues}</pre>
      </section>
      <section>
        <h4>Suggestions</h4>
        <pre>{feedback.suggestions}</pre>
      </section>
      <section>
        <h4>Severity</h4>
        <pre>{feedback.severity}</pre>
      </section>
    </div>
  );
}

export default function App() {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [domain, setDomain] = useState("Data Science Blog Post");
  const [tone, setTone] = useState("friendly and clear");
  const [length, setLength] = useState("short blog post");
  const [notes, setNotes] = useState("Assume the reader knows basic algebra.");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          domain,
          preferences: {
            tone,
            length,
            extra_notes: notes,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Backend error: " + res.status);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>TriView – Multi-Perspective Feedback Coach</h1>
        <p>Get feedback from three perspectives: Supportive Peer, Critical Editor, and Domain Expert.</p>
      </header>

      <main className="app-main">
        <form className="input-panel" onSubmit={handleSubmit}>
          <label className="field">
            <span>Domain</span>
            <select value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option>Data Science Blog Post</option>
              <option>Business Email</option>
              <option>Technical Report</option>
              <option>General Writing</option>
            </select>
          </label>

          <label className="field">
            <span>Draft text</span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={12}
            />
          </label>

          <div className="field-group">
            <label className="field">
              <span>Tone</span>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="friendly and clear"
              />
            </label>
            <label className="field">
              <span>Length</span>
              <input
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="short blog post"
              />
            </label>
          </div>

          <label className="field">
            <span>Extra notes for the agents</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything special they should know..."
            />
          </label>

          <button className="primary-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Getting feedback..." : "Get multi-perspective feedback"}
          </button>

          {error && <div className="error">{error}</div>}
        </form>

        <section className="results-panel">
          {!data && !isLoading && (
            <p className="hint">
              Submit your draft to see feedback from each agent, the combined action plan, and a refined draft.
            </p>
          )}

          {data && (
            <>
              <div className="cards-row">
                <FeedbackBlock
                  title="Supportive Peer Agent"
                  feedback={data.peer_feedback}
                />
                <FeedbackBlock
                  title="Critical Editor Agent"
                  feedback={data.editor_feedback}
                />
                <FeedbackBlock
                  title="Domain Expert Agent"
                  feedback={data.expert_feedback}
                />
              </div>

              <div className="card">
                <h3>Combined Action Plan</h3>
                <pre>{data.action_plan}</pre>
              </div>

              <div className="card">
                <h3>Refined Draft</h3>
                <pre>{data.refined_draft}</pre>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>TriView demo • multi-agent feedback for the Kaggle AI Agents capstone</span>
      </footer>
    </div>
  );
}
