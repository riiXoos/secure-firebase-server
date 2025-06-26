const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = 3000;


const allowedOrigin = 'https://riico.space';

app.use(cors());

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/get/:collection', async (req, res) => {
  const collectionName = req.params.collection;

  
  const origin = req.get('origin') || req.get('referer');
  if (!origin || !origin.startsWith(allowedOrigin)) {
    return res.status(403).send('🚫 Access Denied: Unauthorized origin');
  }

  try {
    const snapshot = await db.collection(collectionName).get();
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('حدث خطأ أثناء قراءة البيانات');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
