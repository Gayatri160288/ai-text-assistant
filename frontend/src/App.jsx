import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateResponse = async () => {
    const trimmedPrompt = prompt.trim();

    // Empty validation
    if (!trimmedPrompt) {
      setError("Please enter a customer issue.");
      setResult(null);
      return;
    }

    // Minimum length validation
    if (trimmedPrompt.length < 10) {
      setError("Customer issue must contain at least 10 characters.");
      setResult(null);
      return;
    }

    // Maximum length validation
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

  return (
    <div className="app">
      <h1>AI Customer Support Assistant</h1>

      <div className="input-section">
        <label>Customer Issue</label>

        <textarea
          placeholder="Enter customer's complaint..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button onClick={generateResponse} disabled={loading}>
          {loading ? "Analyzing..." : "Generate"}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <h2>AI Analysis</h2>

          <div className="result-card">
            <h3>Category</h3>
            <p>{result.category}</p>
          </div>

          <div className="result-card">
            <h3>Priority</h3>
            <p>{result.priority}</p>
          </div>

          <div className="result-card">
            <h3>Issue</h3>
            <p>{result.issue}</p>
          </div>

          <div className="result-card">
            <h3>Suggested Response</h3>
            <p>{result.response}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
