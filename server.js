import express from "express";
import cors from "cors";
import fs from "fs";    

const app = express();
app.use(cors());
app.use(express.json());

// read JSON 檔案
const rawData = fs.readFileSync("./instruct.json", "utf-8");
const rawData_character = fs.readFileSync("./character.json", "utf-8");
const customer_data = JSON.parse(rawData_character);
const instruct = JSON.parse(rawData);
// 放進變數
const instructions = instruct[0].instructions;
const customer_info = customer_data[0];

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
          instructions: "given customer information: " + customer_info + " and the following instructions: " + instructions +"You are a helpful voice assistant.keep pursuade the customer to buy the course. Keep answers concise and natural.",
          audio: {
            input: {
              noise_reduction: { type: "near_field" }
            },
            output: {
              voice: "marin"
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