const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// السماح فقط للمواقع المعتمدة
const allowedOrigins = [
  'https://riico.space',
  'https://riiXoos.github.io',
  null // في بعض الأحيان origin بيكون null من GitHub Pages
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Access Denied'));
    }
  }
}));

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
    res.json({ secrets: result }); // لازم تكون بنفس الشكل في main.js
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('حدث خطأ أثناء قراءة البيانات');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
