import { collection, doc, getDocs, updateDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MenuItem } from '../../models/menu';
import { DEMO_MENU_ITEMS } from '../demo/demoData';

export const liveMenuService = {
  async getMenuItems(canteenId?: string): Promise<MenuItem[]> {
    if (!db) {
      return canteenId
        ? DEMO_MENU_ITEMS.filter((m) => m.canteenId === canteenId)
        : DEMO_MENU_ITEMS;
    }
    try {
      let q = query(collection(db, 'menuItems'), where('isActive', '==', true));
      if (canteenId) {
        q = query(collection(db, 'menuItems'), where('canteenId', '==', canteenId), where('isActive', '==', true));
      }
      const snap = await getDocs(q);
      if (snap.empty) {
        return canteenId
          ? DEMO_MENU_ITEMS.filter((m) => m.canteenId === canteenId)
          : DEMO_MENU_ITEMS;
      }
      return snap.docs.map((d) => d.data() as MenuItem);
    } catch {
      return canteenId
        ? DEMO_MENU_ITEMS.filter((m) => m.canteenId === canteenId)
        : DEMO_MENU_ITEMS;
    }
  },

  async toggleItemAvailability(itemId: string, isAvailable: boolean): Promise<void> {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'menuItems', itemId), {
        isAvailable,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Local fallback
    }
  },

  async saveMenuItem(item: MenuItem): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'menuItems', item.itemId), item);
    } catch {
      // Local fallback
    }
  },
};
