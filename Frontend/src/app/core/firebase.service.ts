import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { Auth,
         User,
         getAuth,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         signOut,
         onAuthStateChanged,
         validatePassword } from "firebase/auth";
import { Firestore, getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../environments/environment"; 

@Injectable({
  providedIn: 'root',
})

export class FirebaseService {
  auth: Auth;
  db: Firestore;
  user: User | null = null;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.initAuthStateListener();
  }

  private initAuthStateListener() {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
    });
  }

  async createUser(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(this.db, "users", user.uid), {
        email: user.email,
      });
      return user;
    } catch(error) {
        throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      this.user = userCredential.user;
      } catch (error) {
        throw error;
      }
  }

  async logout() {
    try {
      await signOut(this.auth)
      this.user = null;
    } catch (error) {
        throw error;
    }
  }

  // Not used currently
  checkPassword(password: string) {
    validatePassword(this.auth, password)
      .then((status) => {
        console.log(status);
      })
  }
  
}
