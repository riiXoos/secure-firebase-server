const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());

const serviceAccount = require('./service-account-key.json');

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
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('حدث خطأ أثناء قراءة البيانات');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
