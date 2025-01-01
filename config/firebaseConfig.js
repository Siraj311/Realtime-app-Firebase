import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBVV1GU10Z0RU_YsfAExaDc3MocpESiMc8",
  authDomain: "esp32-rtdb-90652.firebaseapp.com",
  databaseURL: "https://esp32-rtdb-90652-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp32-rtdb-90652",
  storageBucket: "esp32-rtdb-90652.firebasestorage.app",
  messagingSenderId: "705373677297",
  appId: "1:705373677297:android:18aed2c14dc7cdb1eeab50",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };