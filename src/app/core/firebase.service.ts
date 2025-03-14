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
import { Firestore, getFirestore, doc, setDoc, collection, getDocs, getDoc, addDoc, deleteDoc } from "firebase/firestore";
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
    this.user = null;
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.initAuthStateListener();
  }

  private initAuthStateListener() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  async ensureAuthenticated() {
    if (this.user) return this.user;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error('Authentication timed out'));
      }, 10000);
      
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.user = user;
          clearTimeout(timeout);
          unsubscribe();
          resolve(user);
        }
      });
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

  async getTypes() {
    try {
      const analysisTypesCol = collection(this.db, "analysis_type");
      const analysisTypesSnap = await getDocs(analysisTypesCol);
      const analysisTypes = analysisTypesSnap.docs.map((doc) => doc.data());

      const analysisDict = analysisTypes.reduce((acc, doc) => {
        acc[doc["id"]] = doc["name"];
        return acc;
      }, {});

      const dataTypesCol = collection(this.db, "data_type");
      const dataTypesSnap = await getDocs(dataTypesCol);
      const dataTypes = dataTypesSnap.docs.map((doc) => doc.data());

      const dataDict = dataTypes.reduce((acc, doc) => {
        acc[doc["id"]] = doc["name"];
        return acc;
      }, {});

      return { analysisTypes : analysisDict, dataTypes : dataDict };;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private getDevicesCollection() {
    if (this.user) {
      return collection(doc(this.db, "users", this.user?.uid), "devices");
    }
    else {
      return null;
    }
  }

  async getDevices() {
    const devicesCollection = this.getDevicesCollection();
    if (devicesCollection) {
      try {
        const snapshot = await getDocs(devicesCollection);
        const devices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return devices;
      } catch (error) {
        console.log(error);
        return [];
      }
    } else {
      return [];
    }
  }

  async addDevice(device_id: string, analysis_type: string, data_type: string) {
    try {
      const userCollection = collection(this.db, "users");
      const userDoc = doc(userCollection, this.user?.uid);
      const deviceCollection = collection(userDoc, "devices");

      const deviceDoc = doc(deviceCollection, device_id);
      await setDoc(deviceDoc, {analysis_type, data_type});
    } catch(error: any) {
      console.log(error);
    }
  }

  async deleteDevice(id: string) {
    if (this.user) {
      try {
        const deviceDoc = doc(this.db, "users", this.user?.uid, "devices", id);
  
        await deleteDoc(deviceDoc);
      } catch(error: any) {
        console.log(error);
      }
    }
  }
}
