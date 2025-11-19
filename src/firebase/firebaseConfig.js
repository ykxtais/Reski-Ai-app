import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwH8NrDsbRZUAEOKlby8-Eixc2gA2k3dU",
  authDomain: "reski-30953.firebaseapp.com",
  projectId: "reski-30953",
  storageBucket: "reski-30953.firebasestorage.app",
  messagingSenderId: "792668938150",
  appId: "1:792668938150:web:4a2f5ead8108f1c3b3f967"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});