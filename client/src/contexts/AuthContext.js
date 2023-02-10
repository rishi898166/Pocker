import React, { useContext, useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "../firebase";

const AuthContext = React.createContext();
const db = getFirestore();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  async function isUsernameValid(username) {
    console.log(username);
    const docRef = doc(db, "users", username);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return false;
    } else {
      return true;
    }
  }

  async function signup(email, password, username, phone) {
    try {
      const data = await createUserWithEmailAndPassword(auth, email, password);
      login(email, password);
      const update = await updateProfile(auth.currentUser, {
        displayName: username,
      });
      return await setDoc(doc(db, "users", username), {
        id: data.user.uid,
        email: data.user.email,
        createdAt: new Date().toISOString(),
        phone: phone,
        fund: 0,
        club: null,
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/multiplayer-poker.appspot.com/o/no-img.jpg?alt=media",
      });
    } catch (e) {
      return alert(e);
    }
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  const value = { currentUser, signup, login, logout, isUsernameValid };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
