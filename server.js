// ===== server.js =====
const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 3000;

// السماح فقط لهذه المواقع بالوصول
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
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  } else {
    res.status(403).json({ error: "Access Denied" });
  }
});

// Firebase Admin Init
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Endpoint to get collection data
app.get('/get/:collection', async (req, res) => {
  const collectionName = req.params.collection;
  try {
    const snapshot = await db.collection(collectionName).get();
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    res.json({ secrets: result });
  } catch (error) {
    console.error("❌ Firebase Error:", error);
    res.status(500).send("حدث خطأ أثناء قراءة البيانات");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
