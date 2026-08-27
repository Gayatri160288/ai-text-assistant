import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResponse = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    try {
      setLoading(true);
      setResponse("");

      const result = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setResponse(data.response);
    } catch (error) {
      console.error(error);
      setResponse("Failed to generate AI response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI Text Assistant</h1>

      <textarea
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button onClick={generateResponse} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      <div className="response">
        <h2>AI Response</h2>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;
