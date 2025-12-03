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
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DataRecord } from '../types/dataCollection';

export const recordService = {
    // Create a new record
    create: async (
        collectionId: string,
        projectId: string,
        data: { [fieldId: string]: any },
        userId: string
    ): Promise<string> => {
        const recordRef = await addDoc(collection(db, 'records'), {
            collectionId,
            projectId,
            data,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return recordRef.id;
    },

    // Get all records for a collection
    getByCollection: async (collectionId: string): Promise<DataRecord[]> => {
        const q = query(
            collection(db, 'records'),
            where('collectionId', '==', collectionId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as DataRecord[];
    },

    // Get a single record
    getById: async (recordId: string): Promise<DataRecord | null> => {
        const recordDoc = await getDoc(doc(db, 'records', recordId));

        if (!recordDoc.exists()) {
            return null;
        }

        return {
            id: recordDoc.id,
            ...recordDoc.data(),
            createdAt: recordDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: recordDoc.data().updatedAt?.toDate() || new Date(),
        } as DataRecord;
    },

    // Update a record
    update: async (recordId: string, data: { [fieldId: string]: any }): Promise<void> => {
        await updateDoc(doc(db, 'records', recordId), {
            data,
            updatedAt: serverTimestamp(),
        });
    },

    // Delete a record
    delete: async (recordId: string): Promise<void> => {
        await deleteDoc(doc(db, 'records', recordId));
    },

    // Batch delete records
    deleteMany: async (recordIds: string[]): Promise<void> => {
        await Promise.all(recordIds.map(id => deleteDoc(doc(db, 'records', id))));
    },
};
