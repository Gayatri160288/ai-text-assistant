const express = require("express");
const cors = require("cors");
require("dotenv").config();

const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json());

const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Maximum 5 requests per minute
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

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validation
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

    // Send request to n8n
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
      }),
    });

    const data = await n8nResponse.json();

    if (!n8nResponse.ok) {
      return res.status(n8nResponse.status).json({
        success: false,
        message: data.message || "n8n workflow failed.",
      });
    }

    // Return n8n response to React
    res.json(data);
  } catch (error) {
    console.error("n8n Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process customer issue.",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
