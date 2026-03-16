import express from "express";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import dotenv from "dotenv";
import fs from 'fs';
import { TTS_CONFIG } from './src/constants/ttsConfig';

dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), 'backups_💼');

function performBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupPath);

    // Copy src and package.json
    const filesToBackup = ['src', 'package.json', 'server.ts'];
    filesToBackup.forEach(file => {
      const source = path.join(process.cwd(), file);
      const dest = path.join(backupPath, file);
      if (fs.existsSync(source)) {
        if (fs.lstatSync(source).isDirectory()) {
          fs.cpSync(source, dest, { recursive: true });
        } else {
          fs.copyFileSync(source, dest);
        }
      }
    });
    console.log(`Backup realizado com sucesso: ${backupPath}`);
  } catch (error) {
    console.error("Erro ao realizar backup:", error);
  }
}

async function startServer() {
  console.log("Iniciando servidor...");
  // Backup inicial
  performBackup();
  // Backup a cada hora
  setInterval(performBackup, 60 * 60 * 1000);
  const app = express();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);
    socket.on("disconnect", () => console.log("Usuário desconectado:", socket.id));
  });

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/books", (req, res) => {
    res.json([
      { id: '1', title: 'Dominando o React', author: 'Autor A' },
      { id: '2', title: 'IA para Criativos', author: 'Autor B' }
    ]);
  });

  app.get("/api/clients", (req, res) => {
    res.json([
      { id: '1', name: 'Cliente A', email: 'clienteA@example.com' },
      { id: '2', name: 'Cliente B', email: 'clienteB@example.com' }
    ]);
  });

  app.post("/api/openrouter", async (req, res) => {
    try {
      const { messages, model } = req.body;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({ messages, model }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to call OpenRouter" });
    }
  });
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      const voiceId = TTS_CONFIG.elevenlabs_agent_voice.voice.voice_id;
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: TTS_CONFIG.elevenlabs_agent_voice.model_id,
          voice_settings: {
            stability: TTS_CONFIG.elevenlabs_agent_voice.voice_settings.stability,
            similarity_boost: TTS_CONFIG.elevenlabs_agent_voice.voice_settings.similarity_boost,
            style: TTS_CONFIG.elevenlabs_agent_voice.voice_settings.style,
            use_speaker_boost: TTS_CONFIG.elevenlabs_agent_voice.voice_settings.use_speaker_boost,
          },
        }),
      });
      
      if (!response.ok) throw new Error("ElevenLabs API error");
      
      const audioBuffer = await response.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      res.status(500).json({ error: "Failed to call ElevenLabs" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware configurado.");
    } catch (e) {
      console.error("Erro ao configurar Vite middleware:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  console.log("Servidor configurado e ouvindo na porta", PORT);
}

startServer();
