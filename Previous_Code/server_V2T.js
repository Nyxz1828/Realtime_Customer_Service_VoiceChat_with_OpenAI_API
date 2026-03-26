import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";



const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

// create ephemeral realtime session
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

          // We only want text-side behavior if any response is created.
          // For pure STT, we won't call response.create at all.
          output_modalities: ["text"],

          audio: {
            input: {
              noise_reduction: { type: "near_field" },

              // Automatic turn detection
              turn_detection: {
                type: "server_vad"
              },

              // Speech-to-text model for user audio
              transcription: {
                model: "gpt-4o-transcribe",
                //Optional but helps latency/accuracy if known:
                language: "zh",
                prompt: "This is a Taiwanese Mandarin customer service conversation. please reply in chinese."
              }
            }
          }
        }
      }),
    });

    const text = await response.text();

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
    return res.status(500).json({
      error: "Failed to create realtime session",
      details: err.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});