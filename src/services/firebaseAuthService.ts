import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserRole } from '../store/useAuthStore';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export const firebaseAuthService = {
    // Sign in with email and password
    login: async (email: string, password: string): Promise<UserProfile> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        return {
            id: user.uid,
            name: userData.name || 'User',
            email: user.email || '',
            role: userData.role || 'user',
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name || 'User'}`,
        };
    },

    // Sign up with email and password
    signup: async (email: string, password: string, name: string, role: UserRole = 'user'): Promise<UserProfile> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        const userProfile: UserProfile = {
            id: user.uid,
            name,
            email: user.email || '',
            role,
            avatar: `https://ui-avatars.com/api/?name=${name}`,
        };

        await setDoc(doc(db, 'users', user.uid), {
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            avatar: userProfile.avatar,
            createdAt: new Date().toISOString(),
        });

        return userProfile;
    },

    // Sign out
    logout: async (): Promise<void> => {
        await signOut(auth);
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
        return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        callback({
                            id: firebaseUser.uid,
                            name: userData.name || 'User',
                            email: firebaseUser.email || '',
                            role: userData.role || 'user',
                            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name || 'User'}`,
                        });
                    } else {
                        callback(null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    },
};
