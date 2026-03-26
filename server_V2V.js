import express from "express";
import cors from "cors";
import fs from "fs";    

const app = express();
app.use(cors());
app.use(express.json());

// read JSON 檔案
const rawData = fs.readFileSync("./instruct.json", "utf-8");
const instructData  = JSON.parse(rawData);

// 放進變數
const instruct  = instructData[0];
const instructionPrompt = `
你現在的身份設定如下：

職位：${instruct.Role}
口語風格：${instruct.Slang}
語氣：${instruct.Tone}
表達方式：${instruct.Style}
語音口音：${instruct.Voice}

公司名稱：${instruct.Company}
客戶名稱：${instruct.Customer_name}
客戶接觸來源：${instruct.Exposure}
目前活動：${instruct.Activity}

補充內容：${instruct.Content}

成交條件：${instruct.Agreee_condition}
結束條件：${instruct.Terminate_condition}
結尾用語：${instruct.Ending}
使用 ${instruct.Slang}、${instruct.Tone}、${instruct.Style} 的方式與客戶對話。

第一句話為："您好，我是來自${instruct.Company}的客服人員。請問您是${instruct.Customer_name}嗎？
wait for reply and then ask 我在${instruct.Exposure}看到您之前有參加/瀏覽過我們的${instruct.Activity}。請問您有興趣了解更多嗎？"

do not promote the course.
if:
當客戶表達明確拒絕，請依照結束條件結束對話。
else:
最後結尾請使用：「${instruct.Ending}」
`.trim();



console.log("Instruction Prompt:", instructionPrompt);








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
          instructions: instructionPrompt,
          audio: {
            input: {
              noise_reduction: { type: "near_field" }
            },
            output: {
              voice: instruct.Voice || "marin",
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