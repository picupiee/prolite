import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AnalyticsData {
    id?: string;
    name: string;
    uv: number;
    pv: number;
    amt: number;
    timestamp: Date;
}

export interface Activity {
    id?: string;
    userId: string;
    userName: string;
    action: string;
    description: string;
    timestamp: Date;
}

export const firestoreService = {
    // Analytics operations
    analytics: {
        getAll: async (): Promise<AnalyticsData[]> => {
            const q = query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(7));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            })) as AnalyticsData[];
        },

        add: async (data: Omit<AnalyticsData, 'id'>): Promise<string> => {
            const docRef = await addDoc(collection(db, 'analytics'), {
                ...data,
                timestamp: Timestamp.fromDate(data.timestamp),
            });
            return docRef.id;
        },
    },

    // Activity operations
    activities: {
        getRecent: async (limitCount: number = 10): Promise<Activity[]> => {
            const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            })) as Activity[];
        },

        add: async (activity: Omit<Activity, 'id'>): Promise<string> => {
            const docRef = await addDoc(collection(db, 'activities'), {
                ...activity,
                timestamp: Timestamp.fromDate(activity.timestamp),
            });
            return docRef.id;
        },
    },
};
