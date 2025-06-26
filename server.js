// ===== Secure Firebase Server =====
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد رمز المصادقة السري
const AUTH_TOKEN = "super_secret_123";

// إعداد CORS — السماح فقط من riico.space
app.use(cors({
  origin: 'https://riico.space'
}));

// إعداد Firebase
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// الحماية + قراءة البيانات
app.get('/get/:collection', async (req, res) => {
  const token = req.headers.authorization;
  if (token !== AUTH_TOKEN) {
    return res.status(403).json({ error: "Access Denied" });
  }

  const collectionName = req.params.collection;
  try {
    const snapshot = await db.collection(collectionName).get();
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    res.json({ secrets: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("حدث خطأ أثناء قراءة البيانات");
  }
});

app.listen(PORT, () => {
  console.log(`✅ السيرفر شغال على http://localhost:${PORT}`);
});
