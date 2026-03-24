import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

app.get("/session", async (_req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: "You are a helpful voice assistant. Keep answers concise and natural. And reply in traditional Chinese. ",
          audio: {
            input: {
              noise_reduction: { type: "near_field" }
            },
            output: {
              voice: "alloy"
            }
          }
        }
      }),
    });

    const text = await response.text();
    console.log("OpenAI raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "OpenAI did not return JSON",
        raw: text
      });
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error("Session creation failed:", err);
    return res.status(500).json({ error: "Failed to create realtime session" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});