const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_TOKEN = "super_secret_123";

// سماح كامل (هنفلتر بنفسنا)
app.use(cors());

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.get('/get/:collection', async (req, res) => {
  const clientKey = req.headers['x-client-key'];

  if (clientKey !== AUTH_TOKEN) {
    console.error("🚫 Access Denied: Invalid client key");
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
