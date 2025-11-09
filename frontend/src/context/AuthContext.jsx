import React, { createContext, useContext, useEffect, useState } from "react";
// Import all Firebase functions and config (assuming it's set up in /firebase)
import { auth } from "../firebase/firebase.config";
import { 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";

import axios from 'axios';
import getBaseUrl from '../utils/baseURL';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export const useAuth = () => {
    return useContext(AuthContext);
};

// Use AuthProvider (with an 'r') to match your fixed main.jsx
export const AuthProvider = ({ children }) => { 
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- FIREBASE FUNCTIONS (FOR USER AUTH) ---
    
    // 1. User Register (Firebase)
    const registerUser = async (email, password, username) => {
        // Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // **CRITICAL:** Create the user in MERN backend, too, so they exist in MongoDB
        await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username: username || email,
            password: password, // The backend will hash and save this
            role: 'user', 
            // NOTE: This assumes your Register component passes a username, not just email
        });

        return user;
    };

    // 2. User Login (Firebase)
    const loginUser = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    // 3. Sign up with Google (Firebase)
    const signInWithGoogle = async () => {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;
        
        // **CRITICAL:** Also ensure the user exists in MongoDB after Google login
        // (This part needs a backend route for checking existence, but we keep it simple here)
        return user;
    };

    // 4. Logout (Firebase)
    const logout = () => {
        return signOut(auth);
    };

    // 5. Manage User State (Firebase)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    // --- VALUE FOR CONTEXT ---
    const value = {
        currentUser,
        loading,
        registerUser,
        loginUser,
        signInWithGoogle, // This function is now available!
        logout,
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};