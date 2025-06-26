//
const express = require('express');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ السماح فقط للدومين الخاص والدومين الأصلي لـ GitHub Pages
const allowedOrigins = [
  'https://riico.space',
  'https://www.riico.space',
  'https://riixoos.github.io'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ✅ مصادقة Firebase
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ricowa-63945-default-rtdb.firebaseio.com" // تأكد من عنوان قاعدة البيانات
});

const db = admin.database();

// ✅ قراءة البيانات من Realtime Database تحت المسار /config/secrets
app.get('/get/config', async (req, res) => {
  try {
    const ref = db.ref("config/secrets");
    ref.once("value", snapshot => {
      const data = snapshot.val();
      res.json({ secrets: data });
    }, error => {
      console.error("❌ Firebase Error:", error);
      res.status(500).send("🔥 خطأ في تحميل البيانات");
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).send("🔥 حدث خطأ في السيرفر");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});


// ===== main.js =====

let secretLinks = {};
let isAdminLoggedIn = false;

// ===== Offline Blackout =====
window.addEventListener("offline", () => {
  const blackout = document.createElement("div");
  blackout.style.position = "fixed";
  blackout.style.top = 0;
  blackout.style.left = 0;
  blackout.style.width = "100%";
  blackout.style.height = "100%";
  blackout.style.backgroundColor = "black";
  blackout.style.color = "white";
  blackout.style.fontSize = "24px";
  blackout.style.display = "flex";
  blackout.style.alignItems = "center";
  blackout.style.justifyContent = "center";
  blackout.style.zIndex = 99999;
  blackout.innerText = "⚠️ تم فقد الاتصال بالإنترنت. أعد تحميل الصفحة.";
  document.body.appendChild(blackout);
});

// ===== Load Secrets from Secure Server (Encoded URL) =====
const encodedURL = "aHR0cHM6Ly9zZWN1cmUtZmlyZWJhc2Utc2VydmVyLm9ucmVuZGVyLmNvbS9nZXQvY29uZmln";
const secureURL = atob(encodedURL);

fetch(secureURL)
  .then(res => res.json())
  .then(data => {
    secretLinks = {};
    Object.assign(secretLinks, data.secrets);
    console.log("✅ تم تحميل البيانات من السيرفر:", secretLinks);
    if (typeof initApp === 'function') initApp();
  })
  .catch(error => {
    console.error("❌ خطأ في تحميل البيانات من السيرفر:", error);
  });

function initApp() {
  hideLoading();
  setupUI();
  console.log("✅ التطبيق جاهز");
}

function checkPassword() {
  const input = document.getElementById("passwordInput");
  const code = input.value.trim();
  if (!code || !secretLinks[code]) {
    showError("رمز الدخول غير صالح");
    return;
  }
  const decodedURL = atob(secretLinks[code]);
  showSuccess("تم التحقق! جارٍ التحويل...");
  setTimeout(() => {
    openSecret(decodedURL);
  }, 1500);
}

function openSecret(url) {
  const iframe = document.getElementById("contentFrame");
  const container = document.getElementById("mainContainer");
  iframe.src = url;
  iframe.classList.add("visible");
  container.style.display = "none";
  document.body.classList.add("no-scroll");
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  if (el) {
    el.querySelector(".message-text").innerText = msg;
    el.style.display = "flex";
    setTimeout(() => el.style.display = "none", 4000);
  }
}

function showSuccess(msg) {
  const el = document.getElementById("successMsg");
  if (el) {
    el.querySelector(".message-text").innerText = msg;
    el.style.display = "flex";
    setTimeout(() => el.style.display = "none", 3000);
  }
}

function hideLoading() {
  const screen = document.getElementById("loadingScreen");
  if (screen) {
    screen.style.opacity = "0";
    setTimeout(() => {
      screen.style.display = "none";
    }, 500);
  }
}

function setupUI() {
  const input = document.getElementById("passwordInput");
  if (input) {
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") checkPassword();
    });
  }
}

window.checkPassword = checkPassword;
