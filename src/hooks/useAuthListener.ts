import { useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { useAuthStore } from '../store/useAuthStore';

export const useAuthListener = () => {
    const { login, logout } = useAuthStore();

    useEffect(() => {
        const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
            if (user) {
                login(user);
            } else {
                logout();
            }
        });

        return () => unsubscribe();
    }, [login, logout]);
};
