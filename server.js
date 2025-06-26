const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = 3000;

// السماح بالطلبات
app.use(cors());

// تصديق Firebase
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// حماية: اسم الدومين المسموح له فقط
const allowedHost = 'riico.space';

// Endpoint آمن
app.get('/get/:collection', async (req, res) => {
  const collectionName = req.params.collection;

  // تحقق من الواجهة اللي جاية منها الصفحة
  const referer = req.get('referer') || '';
  const originAllowed = referer.includes(allowedHost);
  if (!originAllowed) {
    return res.status(403).send('Access Denied');
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
