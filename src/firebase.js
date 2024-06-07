import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0jty8XmShgzF6Qk25IxElhN2LbskImZw",
  authDomain: "allkits-1d4ad.firebaseapp.com",
  projectId: "allkits-1d4ad",
  storageBucket: "allkits-1d4ad.appspot.com",
  messagingSenderId: "440628248415",
  appId: "1:440628248415:web:688e5fbcba4da3971ac0ea",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { db, storage };
