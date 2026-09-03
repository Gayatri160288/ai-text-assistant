const express = require("express");
const cors = require("cors");
require("dotenv").config();

const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json());

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many AI requests. Please try again after a minute.",
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Text Assistant Backend is running",
  });
});

app.post("/api/generate", generateLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;

    // -------------------------
    // Validation
    // -------------------------

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a customer issue.",
      });
    }

    if (prompt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Customer issue must contain at least 10 characters.",
      });
    }

    if (prompt.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Customer issue is too long. Maximum 2000 characters allowed.",
      });
    }

    // -------------------------
    // Send request to n8n
    // -------------------------

    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
      }),
    });

    // -------------------------
    // Read n8n response safely
    // -------------------------

    const responseText = await n8nResponse.text();

    console.log("n8n Status:", n8nResponse.status);
    console.log("n8n Response:", responseText);

    // Check HTTP status first
    if (!n8nResponse.ok) {
      let errorData = {};

      try {
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.error("n8n returned invalid JSON:", responseText);
      }

      return res.status(n8nResponse.status).json({
        success: false,
        message: errorData.message || "n8n workflow failed.",
      });
    }

    // Check for empty response
    if (!responseText.trim()) {
      return res.status(502).json({
        success: false,
        message: "n8n returned an empty response.",
      });
    }

    // Convert response to JSON
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Invalid JSON received from n8n:");
      console.error(responseText);

      return res.status(502).json({
        success: false,
        message: "n8n returned invalid JSON.",
      });
    }

    // -------------------------
    // Return n8n response
    // -------------------------

    return res.json(data);
  } catch (error) {
    console.error("n8n Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process customer issue.",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
