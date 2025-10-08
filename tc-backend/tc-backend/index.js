import { simulateSensorData } from './sim.js';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const port = 3000;

let messages = [];

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Messages logs the latest messages received
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// Command sending endpoint
app.post('/api/command', express.json(), (req, res) => {
    const command = req.body.command;
    console.log('Received command:', command);

    res.json({ status: 'Command received', command });
});

// Websocket with dummy info
wss.on('connection', (ws, req) => {
    console.log('Client connected');

    const interval = setInterval(() => {
        const data = simulateSensorData();
        messages.push(data);
        if (messages.length > 100) {
            messages.shift();
        }
        
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(data));
            console.log('Sent data:', data);
        }
    }, 5000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clearInterval(interval);
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`WebSocket available at ws://localhost:${port}`);
});