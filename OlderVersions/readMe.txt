replace the index and server for a simple prototype for easy use


Set UP
npm init -y
npm install express cors

Executing Method
# macOS / Linux
exportOPENAI_API_KEY="your_key_here"

# Windows PowerShell
$env:OPENAI_API_KEY="your_key_here"

and give package.json
{
  "name": "automated_customer_service",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2"
  }
}