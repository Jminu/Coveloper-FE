// Import the Firebase modules
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyCATTTZUNc-xnt25EcOet7ZLwO1ACyMwoo",
  authDomain: "coveloper-file-share.firebaseapp.com",
  projectId: "coveloper-file-share",
  storageBucket: "coveloper-file-share.appspot.com",
  messagingSenderId: "7603196645",
  appId: "1:7603196645:web:9027a9d96df05c36c73a0c",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Storage 초기화
export const storage = getStorage(app);
