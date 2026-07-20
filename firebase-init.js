// firebase-init.js
// Proje Fikri Bulucu için ortak Firebase Authentication + Firestore kurulumu.
// hem index.html hem de login.html bu dosyayı <script type="module" src="firebase-init.js"></script>
// ile yükler, böylece firebaseConfig'i sadece BURADA bir kez doldurman yeterli olur.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ============================================================================
// ⚠️ BURAYI DOLDUR: Kendi Firebase projenin ayarlarını buraya yapıştır.
// Nasıl alınır: console.firebase.google.com → Projeni oluştur →
// Project settings (dişli ikon) → General → "Your apps" → Web (</>) simgesi →
// Uygulamayı kaydet → sana gösterilen firebaseConfig nesnesini buraya kopyala.
// Ayrıca Authentication → Sign-in method → Google sağlayıcısını etkinleştirmen,
// Firestore Database oluşturman ve Authentication → Settings → Authorized
// domains kısmına sitenin adresini (örn. ardasoftwarestudio.github.io) eklemen gerekir.
//
// NOT: Bu ayarlar artık index.html / login.html içinde değil, sadece bu dosyada.
// Böylece bu dosyayı bir kez doldurup kaydettikten sonra, index.html üzerinde
// yapılacak başka güncellemeler bu ayarları ETKİLEMEZ / SIFIRLAMAZ.
// ============================================================================
const firebaseConfig = {
  apiKey: "BURAYA_KENDI_API_KEYINI_YAPISTIR",
  authDomain: "BURAYA_KENDI_AUTH_DOMAININI_YAPISTIR",
  projectId: "BURAYA_KENDI_PROJECT_IDNI_YAPISTIR",
  storageBucket: "BURAYA_KENDI_STORAGE_BUCKETINI_YAPISTIR",
  messagingSenderId: "BURAYA_KENDI_SENDER_IDNI_YAPISTIR",
  appId: "BURAYA_KENDI_APP_IDNI_YAPISTIR"
};

const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("BURAYA_");

let app = null, auth = null, db = null, googleProvider = null;

if(isConfigured){
  try{
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  }catch(e){
    console.warn('Firebase başlatılamadı:', e);
  }
}else{
  console.warn('Firebase yapılandırılmamış: firebase-init.js içindeki firebaseConfig alanını doldurman gerekiyor.');
}

window.__signInWithGoogle = async function(){
  if(!auth) throw new Error('Firebase yapılandırılmamış. firebase-init.js içindeki firebaseConfig alanını doldur.');
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

window.__signOutFirebase = async function(){
  if(!auth) return;
  await signOut(auth);
};

window.__onAuthChange = function(callback){
  if(!auth){
    callback(null);
    return;
  }
  onAuthStateChanged(auth, callback);
};

window.__loadCloudData = async function(uid){
  if(!db) return null;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

window.__saveCloudData = async function(uid, data){
  if(!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
};

window.__firebaseConfigured = isConfigured;
