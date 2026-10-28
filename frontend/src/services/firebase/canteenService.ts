import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Building, Canteen } from '../../models/campus';
import { DEMO_BUILDINGS, DEMO_CANTEENS } from '../demo/demoData';

export const liveCanteenService = {
  async getBuildings(): Promise<Building[]> {
    if (!db) return DEMO_BUILDINGS;
    try {
      const snap = await getDocs(collection(db, 'buildings'));
      if (snap.empty) return DEMO_BUILDINGS;
      return snap.docs.map((d) => d.data() as Building);
    } catch {
      return DEMO_BUILDINGS;
    }
  },

  async getCanteens(): Promise<Canteen[]> {
    if (!db) return DEMO_CANTEENS;
    try {
      const snap = await getDocs(collection(db, 'canteens'));
      if (snap.empty) return DEMO_CANTEENS;
      return snap.docs.map((d) => d.data() as Canteen);
    } catch {
      return DEMO_CANTEENS;
    }
  },

  async getCanteenById(canteenId: string): Promise<Canteen | null> {
    if (!db) return DEMO_CANTEENS.find((c) => c.canteenId === canteenId) || null;
    try {
      const snap = await getDoc(doc(db, 'canteens', canteenId));
      if (snap.exists()) return snap.data() as Canteen;
      return DEMO_CANTEENS.find((c) => c.canteenId === canteenId) || null;
    } catch {
      return DEMO_CANTEENS.find((c) => c.canteenId === canteenId) || null;
    }
  },

  async toggleCanteenOpen(canteenId: string, isOpen: boolean): Promise<void> {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'canteens', canteenId), {
        isOpen,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Local fallback
    }
  },
};
