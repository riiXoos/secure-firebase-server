const allowedOrigins = [
  'https://riico.space',
  'https://www.riico.space',
  'https://riixoos.github.io',
  'https://riixoos.github.io/ricoapp90'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  } else {
    console.log("⛔ Access Denied from Origin:", origin);
    res.status(403).send('Access Denied');
  }
});

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
