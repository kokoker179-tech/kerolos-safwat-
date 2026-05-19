import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;

setLogLevel('silent');

function init() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
}

export function getDb() {
  init();
  if (!dbInstance) {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return dbInstance;
}

export function getAuthService() {
  init();
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}
