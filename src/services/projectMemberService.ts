import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ProjectMember, UserRole } from '../types/dataCollection';

export const projectMemberService = {
    // Add a member to a project
    addMember: async (
        projectId: string,
        userId: string,
        userName: string,
        userEmail: string,
        role: UserRole
    ): Promise<string> => {
        const memberRef = await addDoc(collection(db, 'projectMembers'), {
            projectId,
            userId,
            userName,
            userEmail,
            role,
            addedAt: serverTimestamp(),
        });

        return memberRef.id;
    },

    // Get all members of a project
    getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
        const q = query(
            collection(db, 'projectMembers'),
            where('projectId', '==', projectId)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            addedAt: doc.data().addedAt?.toDate() || new Date(),
        })) as ProjectMember[];
    },

    // Get user's role in a project
    getUserRole: async (projectId: string, userId: string): Promise<UserRole | null> => {
        const q = query(
            collection(db, 'projectMembers'),
            where('projectId', '==', projectId),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data().role as UserRole;
    },

    // Check if user has access to project
    hasAccess: async (projectId: string, userId: string): Promise<boolean> => {
        const role = await projectMemberService.getUserRole(projectId, userId);
        return role !== null;
    },

    // Check if user has specific role or higher
    hasRole: async (projectId: string, userId: string, requiredRole: UserRole): Promise<boolean> => {
        const userRole = await projectMemberService.getUserRole(projectId, userId);

        if (!userRole) return false;

        const roleHierarchy: Record<UserRole, number> = {
            viewer: 1,
            editor: 2,
            owner: 3,
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    },

    // Update member role
    updateRole: async (memberId: string, role: UserRole): Promise<void> => {
        await updateDoc(doc(db, 'projectMembers', memberId), { role });
    },

    // Remove member from project
    removeMember: async (memberId: string): Promise<void> => {
        await deleteDoc(doc(db, 'projectMembers', memberId));
    },

    // Get member by project and user
    getMember: async (projectId: string, userId: string): Promise<ProjectMember | null> => {
        const q = query(
            collection(db, 'projectMembers'),
            where('projectId', '==', projectId),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const docSnap = snapshot.docs[0];
        return {
            id: docSnap.id,
            ...docSnap.data(),
            addedAt: docSnap.data().addedAt?.toDate() || new Date(),
        } as ProjectMember;
    },
};
