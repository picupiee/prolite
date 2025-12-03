import type { UserRole } from '../store/useAuthStore';

export const mockAuthService = {
    login: async (email: string): Promise<{ id: string; name: string; role: UserRole; avatar: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let role: UserRole = 'user';
                if (email.includes('admin')) role = 'admin';
                else if (email.includes('manager')) role = 'manager';

                resolve({
                    id: Math.random().toString(36).substr(2, 9),
                    name: 'Demo User',
                    role,
                    avatar: `https://ui-avatars.com/api/?name=Demo+User&background=random`,
                });
            }, 800);
        });
    },
};
