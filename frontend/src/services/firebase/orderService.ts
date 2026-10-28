import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order, OrderStatus, PaymentStatus } from '../../models/order';
import { generateOrderNumber, generatePickupToken, normalizeToken } from '../../utils/tokenGenerator';
import { demoStorage } from '../demo/demoStorage';

export const liveOrderService = {
  async getOrders(canteenId?: string, userId?: string): Promise<Order[]> {
    if (!db) {
      return demoStorage.getOrders(canteenId, userId);
    }
    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      if (canteenId) {
        q = query(collection(db, 'orders'), where('canteenId', '==', canteenId), orderBy('createdAt', 'desc'));
      } else if (userId) {
        q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(q);
      if (snap.empty) {
        return demoStorage.getOrders(canteenId, userId);
      }
      return snap.docs.map((d) => d.data() as Order);
    } catch {
      // Graceful fallback to demo storage on Firestore permission / network error
      return demoStorage.getOrders(canteenId, userId);
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (!db) {
      return demoStorage.getOrderById(orderId) || null;
    }
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        return snap.data() as Order;
      }
      return demoStorage.getOrderById(orderId) || null;
    } catch {
      return demoStorage.getOrderById(orderId) || null;
    }
  },

  async createOrder(orderInput: Partial<Order>): Promise<Order> {
    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderNumber = generateOrderNumber();
    const pickupToken = generatePickupToken();
    const now = new Date().toISOString();

    const isCash = orderInput.paymentMethod === 'cash_at_counter';
    const newOrder: Order = {
      orderId,
      orderNumber,
      userId: orderInput.userId || 'guest-student',
      userDisplayName: orderInput.userDisplayName || 'Student',
      userRole: orderInput.userRole || 'student',
      canteenId: orderInput.canteenId!,
      canteenName: orderInput.canteenName!,
      buildingName: orderInput.buildingName || 'Main Academic Building',
      floor: orderInput.floor || 1,
      orderType: orderInput.orderType || 'instant',
      itemsSnapshot: orderInput.itemsSnapshot || [],
      subtotal: orderInput.subtotal || 0,
      total: orderInput.total || 0,
      paymentMethod: orderInput.paymentMethod || 'razorpay',
      paymentStatus: isCash ? 'pending' : 'paid',
      orderStatus: 'awaiting_acceptance',
      pickupTime: orderInput.pickupTime,
      pickupToken,
      isTokenVerified: false,
      readyAt: undefined,
      paymentTransactionId: orderInput.paymentTransactionId,
      policyVersion: orderInput.policyVersion,
      policyAcceptedAt: orderInput.policyAcceptedAt,
      idempotencyKey: orderInput.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
      } catch {
        // Fallback to local
      }
    }

    // Always mirror to demo storage so local listeners and state updates fire
    try {
      await demoStorage.createOrder(newOrder);
    } catch {
      // Local created
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<void> {
    const patch: Partial<Order> = {
      orderStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'ready_for_pickup') {
      patch.readyAt = new Date().toISOString();
    }

    if (db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), patch);
      } catch {
        // Firestore rules error fallback
      }
    }

    try {
      await demoStorage.updateOrderStatus(orderId, newStatus, note);
    } catch {
      // Local updated
    }
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void> {
    if (db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          paymentStatus,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // Firestore fallback
      }
    }

    try {
      await demoStorage.updatePaymentStatus(orderId, paymentStatus);
    } catch {
      // Local updated
    }
  },

  async verifyPickupToken(canteenId: string, inputToken: string): Promise<Order> {
    const formatted = normalizeToken(inputToken);

    if (db) {
      try {
        const q = query(
          collection(db, 'orders'),
          where('canteenId', '==', canteenId),
          where('pickupToken', '==', formatted)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const orderDoc = snap.docs[0];
          const order = orderDoc.data() as Order;
          if (order.isTokenVerified || order.orderStatus === 'picked_up') {
            throw new Error(`Order ${order.orderNumber} already collected! Duplicate pickup rejected.`);
          }
          await updateDoc(doc(db, 'orders', order.orderId), {
            orderStatus: 'picked_up',
            isTokenVerified: true,
            updatedAt: new Date().toISOString(),
          });
          demoStorage.verifyPickupToken(canteenId, inputToken).catch(() => {});
          return { ...order, orderStatus: 'picked_up', isTokenVerified: true };
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already collected')) throw err;
      }
    }

    return demoStorage.verifyPickupToken(canteenId, inputToken);
  },
};
