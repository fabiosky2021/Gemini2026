import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { URLSearchParams } from "url";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/facebook/auth-url", (req, res) => {
    const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/auth/facebook/callback`;
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || "",
      redirect_uri: redirectUri,
      scope: "ads_read,ads_management",
      response_type: "code",
    });
    res.json({ url: `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}` });
  });

  app.get("/auth/facebook/callback", async (req, res) => {
    const { code } = req.query;
    // Aqui você trocaria o código por um token de acesso real
    // const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${...}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`);
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticação do Facebook bem-sucedida. Esta janela será fechada.</p>
        </body>
      </html>
    `);
  });

  app.post("/api/openrouter-image", async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/generation", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "AdStudio Pro",
        },
        body: JSON.stringify({
          model: "openai/dall-e-3", // Ou outro modelo de imagem suportado
          prompt: prompt,
        }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("OpenRouter image error:", error);
      res.status(500).json({ error: "Failed to call OpenRouter" });
    }
  });

  app.post("/api/openrouter", async (req, res) => {
    const { messages, model } = req.body;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "AdStudio Pro",
        },
        body: JSON.stringify({
          model: model || "openai/gpt-4o",
          messages,
        }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("OpenRouter error:", error);
      res.status(500).json({ error: "Failed to call OpenRouter" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
