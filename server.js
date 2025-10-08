const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { simulateSensorData } = require("./tc-backend/tc-backend/sim");

const app = express();
app.use(cors());
app.use(express.json());

let users = [];

app.post("/api/register", (req, res) => {
  const user = req.body;
  users.push(user);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(user));
    }
  });
  res.status(201).json({ ok: true });
});

app.get("/api/messages", (req, res) => {
  res.json(users);
});

app.post('/api/command', express.json(), (req, res) => {
  const command = req.body.command;
  console.log('Received command:', command);
  res.json({ status: 'Command received', command });
});

const server = app.listen(3000, () => {
  console.log("API listening on http://localhost:3000");
});

const wss = new WebSocketServer({ server, path: "/api/stream" });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(users));
  console.log("Client connected via WebSocket");

  setInterval(() => {
    const data = simulateSensorData();
    ws.send(JSON.stringify(data));
  }, 2000);
});

wss.on("close", () => {
  console.log("WebSocket connection closed");
});