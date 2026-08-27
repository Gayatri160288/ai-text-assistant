const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Text Assistant Backend is running",
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        message: "Prompt is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
Return your response as valid JSON.

The JSON must contain:
- category
- priority
- issue
- response

User request:
${prompt}
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({
      success: true,
      response: JSON.parse(response.text),
    });
  } catch (error) {
    console.error("AI API Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
