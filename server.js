const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_TOKEN = process.env.ACCESS_TOKEN || 'super_secret_123';

// ✅ CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://riicco.space'); // ✅ اسم الدومين المسموح له
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token'); // ✅ لازم تضيف الهيدر هنا
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // ✅ السماح لـ preflight
  }
  next();
});

// ✅ Auth Middleware
app.use((req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token !== AUTH_TOKEN) {
    console.log("❌ Access Denied: Token mismatch");
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
});

// ✅ Firebase
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

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
    console.error('🔥 Firebase Error:', error);
    res.status(500).send('حدث خطأ أثناء قراءة البيانات');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
