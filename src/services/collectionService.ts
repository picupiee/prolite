import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Collection, FieldDefinition } from '../types/dataCollection';

export const collectionService = {
    // Create a new collection with field definitions
    create: async (
        projectId: string,
        name: string,
        description: string,
        fields: Omit<FieldDefinition, 'id' | 'collectionId'>[]
    ): Promise<string> => {
        // Create collection
        const collectionRef = await addDoc(collection(db, 'collections'), {
            projectId,
            name,
            description,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Create field definitions
        for (const field of fields) {
            await addDoc(collection(db, 'fieldDefinitions'), {
                collectionId: collectionRef.id,
                name: field.name,
                type: field.type,
                config: field.config,
                order: field.order,
                required: field.required,
            });
        }

        return collectionRef.id;
    },

    // Get all collections for a project
    getByProject: async (projectId: string): Promise<Collection[]> => {
        const q = query(
            collection(db, 'collections'),
            where('projectId', '==', projectId)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Collection[];
    },

    // Get a single collection
    getById: async (collectionId: string): Promise<Collection | null> => {
        const collectionDoc = await getDoc(doc(db, 'collections', collectionId));

        if (!collectionDoc.exists()) {
            return null;
        }

        return {
            id: collectionDoc.id,
            ...collectionDoc.data(),
            createdAt: collectionDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: collectionDoc.data().updatedAt?.toDate() || new Date(),
        } as Collection;
    },

    // Get field definitions for a collection
    getFields: async (collectionId: string): Promise<FieldDefinition[]> => {
        const q = query(
            collection(db, 'fieldDefinitions'),
            where('collectionId', '==', collectionId)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }) as FieldDefinition)
            .sort((a, b) => a.order - b.order);
    },

    // Update collection
    update: async (collectionId: string, updates: Partial<Pick<Collection, 'name' | 'description'>>): Promise<void> => {
        await updateDoc(doc(db, 'collections', collectionId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    },

    // Add a field to collection
    addField: async (field: Omit<FieldDefinition, 'id'>): Promise<string> => {
        const fieldRef = await addDoc(collection(db, 'fieldDefinitions'), field);
        return fieldRef.id;
    },

    // Update a field
    updateField: async (fieldId: string, updates: Partial<FieldDefinition>): Promise<void> => {
        await updateDoc(doc(db, 'fieldDefinitions', fieldId), updates);
    },

    // Delete a field
    deleteField: async (fieldId: string): Promise<void> => {
        await deleteDoc(doc(db, 'fieldDefinitions', fieldId));
    },

    // Delete collection and all related data
    delete: async (collectionId: string): Promise<void> => {
        // Delete field definitions
        const fieldsQuery = query(
            collection(db, 'fieldDefinitions'),
            where('collectionId', '==', collectionId)
        );
        const fieldsSnapshot = await getDocs(fieldsQuery);
        await Promise.all(fieldsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

        // Delete records
        const recordsQuery = query(
            collection(db, 'records'),
            where('collectionId', '==', collectionId)
        );
        const recordsSnapshot = await getDocs(recordsQuery);
        await Promise.all(recordsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

        // Delete collection
        await deleteDoc(doc(db, 'collections', collectionId));
    },
};
