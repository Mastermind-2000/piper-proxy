const express = require("express");
const bodyParser = require("body-parser");
const net = require("net");

const app = express();
const PORT = process.env.PORT || 3000;
const PIPER_HOST = "localhost"; // or change to Render hostname if deployed remotely
const PIPER_PORT = 10200;

app.use(bodyParser.json());

app.post("/speak", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  const socket = net.createConnection({ host: PIPER_HOST, port: PIPER_PORT }, () => {
    const message = Buffer.from(`speak|${text}\n`);
    socket.write(message);
  });

  let audioChunks = [];
  socket.on("data", chunk => audioChunks.push(chunk));

  socket.on("end", () => {
    const audioBuffer = Buffer.concat(audioChunks);
    res.set("Content-Type", "audio/wav");
    res.send(audioBuffer);
  });

  socket.on("error", err => {
    console.error("Piper connection error:", err);
    res.status(500).json({ error: "Failed to connect to Piper" });
  });
});

app.listen(PORT, () => {
  console.log(`Piper Proxy server running on http://localhost:${PORT}`);
});