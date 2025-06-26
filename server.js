const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const PORT = 3000;

// السماح فقط لهذه الدومينات
const allowedOrigins = [
  'https://riico.space',
  'https://www.riico.space',
  'https://riixoos.github.io',
  'https://riixoos.github.io/ricoapp90'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Access Denied'));
    }
  }
}));

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ricowa-63945-default-rtdb.firebaseio.com"
});

const db = admin.database();

app.get('/get/config', async (req, res) => {
  try {
    const ref = db.ref("config/secrets");
    ref.once("value", snapshot => {
      const data = snapshot.val();
      res.json({ secrets: data });
    }, error => {
      console.error("❌ Database error:", error);
      res.status(500).send("Database read error");
    });
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).send('Internal server error');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Secure server is running on http://localhost:${PORT}`);
});
