import express from "express";
import cors from "cors";
import expressWs from "express-ws";
import os from "os";

const PORT = 3001;

const app = express();

expressWs(app);

app.use(cors());

const connectedClients = [];

app.ws("/api/pos/:deviceId/purchase", (ws, request) => {
  ws.on("message", (message) => {
    console.log(`Purchase request: ${message}`);
    const data = JSON.parse(message);
    if (!data.amount) return;
    const client = connectedClients.find(
      (client) => client.id === request.params.deviceId
    );
    if (!client) {
      const payload = {
        success: false,
        error:
          "Термінал недоступний. Перевірте підключення терміналу до сервера",
      };
      ws.send(JSON.stringify(payload));
      return;
    }
    client.ws.removeAllListeners("message");
    client.ws.on("message", (message) => ws.send(message));
    client.ws.send(message);
  });
});

app.ws("/api/pos/client", (ws, request) => {
  const searchParams = new URLSearchParams(request._parsedUrl.search);
  const id = searchParams.get("id");
  const deviceName = searchParams.get("deviceName");
  connectedClients.push({ id, deviceName, ws });
  console.log("Client connected", { id, deviceName });

  const removeClient = () => {
    const index = connectedClients.findIndex((client) => client.id === id);
    connectedClients.splice(index, 1);
  };

  ws.on("close", () => {
    console.log("Client disconnected");
    removeClient();
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    removeClient();
  });
});

app.get("/api/devices", async (_request, response) => {
  const payload = connectedClients.map((client) => ({
    id: client.id,
    name: client.deviceName,
  }));
  response.json(payload);
});

app.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  const addressInfo = Object.values(networkInterfaces)
    .flat()
    .find(
      (addressInfo) => addressInfo.family === "IPv4" && !addressInfo.internal
    );
  console.log(`Server listening: ${addressInfo.address}:${PORT}`);
});
