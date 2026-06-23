import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyC3BkJKDJVkFotrSTv4gfRVsev6y1Y8QY4",
  authDomain: "forsales-a78c0.firebaseapp.com",
  projectId: "forsales-a78c0",
  storageBucket: "forsales-a78c0.firebasestorage.app",
  messagingSenderId: "66125422863",
  appId: "1:66125422863:web:73a3328dc9daa0122ade7a",
  measurementId: "G-X60N4DQNRX"
}


const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
