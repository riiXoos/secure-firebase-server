const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_TOKEN = process.env.ACCESS_TOKEN;

// ✅ السماح فقط لـ riico.space
const ALLOWED_ORIGIN = "https://riico.space";

app.use((req, res, next) => {
  const token = req.headers['x-access-token'];

  // رفض بدون التوكين الصحيح
  if (token !== AUTH_TOKEN) {
    console.log("❌ Access Denied: Token mismatch");
    return res.status(403).json({ error: "Access Denied" });
  }

  // ✅ لو التوكين صحيح، أضف هيدر CORS يدويًا
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");

  // ✅ التعامل مع طلب OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ===== Firebase Setup =====
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ===== Endpoint =====
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
    console.error('❌ Firebase Error:', error);
    res.status(500).send('حدث خطأ أثناء قراءة البيانات');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
