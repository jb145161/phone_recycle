import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cookieParser from "cookie-parser";
import * as admin from "firebase-admin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Initialize Firebase Admin
  // If FIREBASE_SERVICE_ACCOUNT is provided, use it.
  // Otherwise, try to initialize with project ID (may fail for custom tokens if no key)
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp({
        projectId: "gen-lang-client-0546732228",
      });
    }
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // WeChat Auth URL
  app.get("/api/auth/wechat/url", (req, res) => {
    const appId = process.env.WECHAT_APP_ID;
    const redirectUri = encodeURIComponent(`${process.env.APP_URL || 'http://localhost:3000'}/api/auth/wechat/callback`);
    const state = Math.random().toString(36).substring(7);
    
    // For PC login (QR Code)
    const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    
    res.json({ url });
  });

  // WeChat Auth Callback
  app.get("/api/auth/wechat/callback", async (req, res) => {
    const { code } = req.query;
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!code) {
      return res.status(400).send("Code is missing");
    }

    try {
      // 1. Exchange code for access_token and openid
      const tokenRes = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`);
      const { access_token, openid, unionid } = tokenRes.data;

      if (!openid) {
        throw new Error("Failed to get openid from WeChat");
      }

      // 2. Fetch user info (optional)
      const userRes = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`);
      const userInfo = userRes.data;

      // 3. Create/Get Firebase User and Generate Custom Token
      const uid = unionid || openid; // UnionID is preferred if available
      
      try {
        await admin.auth().updateUser(uid, {
          displayName: userInfo.nickname,
          photoURL: userInfo.headimgurl,
        });
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          await admin.auth().createUser({
            uid: uid,
            displayName: userInfo.nickname,
            photoURL: userInfo.headimgurl,
          });
        } else {
          throw e;
        }
      }

      const customToken = await admin.auth().createCustomToken(uid);

      // 4. Send success message back to opener
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'WECHAT_AUTH_SUCCESS', token: '${customToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>微信登录成功，正在跳转...</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("WeChat Auth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
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
