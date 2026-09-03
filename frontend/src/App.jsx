import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateResponse = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Please enter a customer issue.");
      setResult(null);
      return;
    }

    if (trimmedPrompt.length < 10) {
      setError("Customer issue must contain at least 10 characters.");
      setResult(null);
      return;
    }

    if (trimmedPrompt.length > 2000) {
      setError("Customer issue is too long. Maximum 2000 characters allowed.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("AI request limit reached. Please try again later.");
        }

        if (response.status === 503) {
          throw new Error(
            "AI service is temporarily unavailable. Please try again.",
          );
        }

        if (response.status === 404) {
          throw new Error("AI model is currently unavailable.");
        }

        throw new Error(data.message || "Something went wrong.");
      }

      setResult(data.response);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to generate AI response.");
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    if (!result?.response) return;

    try {
      await navigator.clipboard.writeText(result.response);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <h2>AI Support</h2>
            <span>Customer Assistant</span>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          AI Online
        </div>
      </header>

      {/* Hero */}
      <main className="main-content">
        <section className="hero">
          <div className="hero-badge">✨ Powered by AI Automation</div>

          <h1>
            Turn customer issues into
            <span> smart responses.</span>
          </h1>

          <p>
            Analyze customer complaints, identify priority, and generate
            professional support responses instantly.
          </p>
        </section>

        {/* Input Card */}
        <section className="input-card">
          <div className="section-heading">
            <div>
              <h2>Customer Issue</h2>
              <p>Describe the customer's problem below.</p>
            </div>

            <span className="ai-badge">AI</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: My laptop order has not arrived after 10 days. Please help me."
            maxLength={2000}
          />

          <div className="input-footer">
            <span>{prompt.length} / 2000 characters</span>

            <button onClick={generateResponse} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>✨ Generate Response</>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span>
              {error}
            </div>
          )}
        </section>

        {/* Result */}
        {result && (
          <section className="results">
            <div className="results-heading">
              <div>
                <span className="small-label">AI OUTPUT</span>
                <h2>Support Analysis</h2>
              </div>

              <span className="success-badge">✓ Generated</span>
            </div>

            <div className="analysis-grid">
              <div className="result-card">
                <span className="card-label">CATEGORY</span>
                <h3>{result.category}</h3>
              </div>

              <div className="result-card priority-card">
                <span className="card-label">PRIORITY</span>
                <h3>{result.priority}</h3>
              </div>
            </div>

            <div className="result-card full-card">
              <span className="card-label">IDENTIFIED ISSUE</span>
              <p>{result.issue}</p>
            </div>

            <div className="response-card">
              <div className="response-header">
                <div>
                  <span className="card-label">SUGGESTED RESPONSE</span>
                  <h3>Customer Support Reply</h3>
                </div>

                <button className="copy-button" onClick={copyResponse}>
                  Copy
                </button>
              </div>

              <p>{result.response}</p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer>
        <span>AI Customer Support Assistant</span>
        <span>React • Node.js • n8n • Gemini • MySQL</span>
      </footer>
    </div>
  );
}

export default App;
