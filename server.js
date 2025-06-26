const express = require('express');
const admin = require('firebase-admin');
const app = express();

const PORT = process.env.PORT || 3000;
const AUTH_TOKEN = process.env.ACCESS_TOKEN || 'RICCOTOPSECRETKEY';

const allowedOrigins = [
  "https://riico.space",
  "https://www.riico.space",
  "https://riixoos.github.io",
  "https://riixoos.github.io/ricoapp90"
];

// CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Auth Middleware
app.use((req, res, next) => {
  const token = req.headers["x-access-token"];
  if (token !== AUTH_TOKEN) {
    console.log("❌ Access Denied: Token mismatch");
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
});

// Firebase Setup
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Endpoint to get secrets from collection
app.get("/get/config", async (req, res) => {
  try {
    const snapshot = await db.collection("config").doc("secrets").get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ secrets: snapshot.data() });
  } catch (error) {
    console.error("❌ Firebase Error:", error);
    res.status(500).send("حدث خطأ أثناء قراءة البيانات.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
