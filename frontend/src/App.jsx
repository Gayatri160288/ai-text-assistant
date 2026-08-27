import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateResponse = async () => {
    if (!prompt.trim()) {
      alert("Please enter a customer issue");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setResult(data.response);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate AI response");
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
