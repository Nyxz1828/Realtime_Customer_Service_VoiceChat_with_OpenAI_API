# Voice Chat API OPENAI Base

This project is a browser-based voice chat prototype built on the OpenAI Realtime API using WebRTC.  
It captures microphone audio from the browser, sends the SDP offer to the backend, and connects to OpenAI for real-time speech-to-speech interaction.

According to OpenAI’s current documentation, WebRTC is the recommended approach for browser-based realtime voice applications, and once the local audio track is attached, users can start speaking directly. :contentReference[oaicite:0]{index=0}

---

## Features

- Browser microphone input
- WebRTC-based realtime connection
- Backend session creation
- AI voice response playback
- Simple frontend test UI
- Node.js backend with Express

---

## Project Structure

```bash
.
├── server.js
├── index.html
├── package.json
└── README.md