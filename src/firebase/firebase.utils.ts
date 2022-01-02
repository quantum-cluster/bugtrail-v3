import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

const config = {
  apiKey: "AIzaSyBcSu1C4Qdud_a52NOWikVSOj0njkwODpc",
  authDomain: "bugtrail-v2.firebaseapp.com",
  databaseURL: "https://bugtrail-v2.firebaseio.com",
  projectId: "bugtrail-v2",
  storageBucket: "bugtrail-v2.appspot.com",
  messagingSenderId: "723885045033",
  appId: "1:723885045033:web:4eeef384d51bf7c025b338",
  measurementId: "G-VH49TBGZ9N",
};

firebase.initializeApp(config);

export const createUserProfileDocument = async (
  userAuth: firebase.User | null,
  additionalData: any
) => {
  if (!userAuth) return;

  const userRef = firestore.doc(`users/${userAuth.uid}`);

  const snapShot = await userRef.get();

  if (!snapShot.exists) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();
    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        myTickets: [""],
        ...additionalData,
      });
    } catch (error: any) {
      console.log("error creating user", error);
    }
  }

  return userRef;
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      unsubscribe();
      resolve(userAuth);
    }, reject);
  });
};

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export const signInWithGoogle = () => auth.signInWithPopup(googleProvider);

export default firebase;
