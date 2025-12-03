import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project } from '../types/dataCollection';

export const projectService = {
    // Create a new project
    create: async (name: string, description: string, ownerId: string): Promise<string> => {
        const projectRef = await addDoc(collection(db, 'projects'), {
            name,
            description,
            ownerId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Add owner as project member with composite ID
        const memberId = `${projectRef.id}_${ownerId}`;
        await setDoc(doc(db, 'projectMembers', memberId), {
            projectId: projectRef.id,
            userId: ownerId,
            role: 'owner',
            addedAt: serverTimestamp(),
        });

        return projectRef.id;
    },

    // Get all projects where user is a member
    getUserProjects: async (userId: string): Promise<Project[]> => {
        // First, get all project memberships for the user
        const membersQuery = query(
            collection(db, 'projectMembers'),
            where('userId', '==', userId)
        );
        const membersSnapshot = await getDocs(membersQuery);

        const projectIds = membersSnapshot.docs.map(doc => doc.data().projectId);

        if (projectIds.length === 0) {
            return [];
        }

        // Get all projects
        const projects: Project[] = [];
        for (const projectId of projectIds) {
            const projectDoc = await getDoc(doc(db, 'projects', projectId));
            if (projectDoc.exists()) {
                projects.push({
                    id: projectDoc.id,
                    ...projectDoc.data(),
                    createdAt: projectDoc.data().createdAt?.toDate() || new Date(),
                    updatedAt: projectDoc.data().updatedAt?.toDate() || new Date(),
                } as Project);
            }
        }

        return projects;
    },

    // Get a single project
    getById: async (projectId: string): Promise<Project | null> => {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));

        if (!projectDoc.exists()) {
            return null;
        }

        return {
            id: projectDoc.id,
            ...projectDoc.data(),
            createdAt: projectDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: projectDoc.data().updatedAt?.toDate() || new Date(),
        } as Project;
    },

    // Update project
    update: async (projectId: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<void> => {
        await updateDoc(doc(db, 'projects', projectId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    },

    // Delete project (and all related data)
    delete: async (projectId: string): Promise<void> => {
        // Delete project members
        const membersQuery = query(
            collection(db, 'projectMembers'),
            where('projectId', '==', projectId)
        );
        const membersSnapshot = await getDocs(membersQuery);
        await Promise.all(membersSnapshot.docs.map(doc => deleteDoc(doc.ref)));

        // Delete collections and their data
        const collectionsQuery = query(
            collection(db, 'collections'),
            where('projectId', '==', projectId)
        );
        const collectionsSnapshot = await getDocs(collectionsQuery);

        for (const collectionDoc of collectionsSnapshot.docs) {
            // Delete field definitions
            const fieldsQuery = query(
                collection(db, 'fieldDefinitions'),
                where('collectionId', '==', collectionDoc.id)
            );
            const fieldsSnapshot = await getDocs(fieldsQuery);
            await Promise.all(fieldsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

            // Delete records
            const recordsQuery = query(
                collection(db, 'records'),
                where('collectionId', '==', collectionDoc.id)
            );
            const recordsSnapshot = await getDocs(recordsQuery);
            await Promise.all(recordsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

            // Delete collection
            await deleteDoc(collectionDoc.ref);
        }

        // Delete project
        await deleteDoc(doc(db, 'projects', projectId));
    },
};
