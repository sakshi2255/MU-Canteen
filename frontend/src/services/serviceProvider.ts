import { isFirebaseConfigured } from '../config/firebase';
import { demoStorage } from './demo/demoStorage';
import { liveAuthService } from './firebase/authService';
import { liveCanteenService } from './firebase/canteenService';
import { liveMenuService } from './firebase/menuService';
import { liveOrderService } from './firebase/orderService';
import { UserProfile, UserRole } from '../models/user';
import { Building, Canteen } from '../models/campus';
import { MenuItem } from '../models/menu';
import { Order, OrderEvent, OrderStatus, PaymentStatus } from '../models/order';
import { CampusSettings } from '../models/settings';
import { AuditLog } from '../models/audit';

export const isDemoMode = !isFirebaseConfigured();

export const ServiceProvider = {
  isDemo: isDemoMode,

  auth: {
    async getCurrentUser(): Promise<UserProfile | null> {
      if (isDemoMode) {
        return demoStorage.getCurrentUser();
      }
      return null;
    },

    async login(email: string, pass: string): Promise<UserProfile> {
      if (isDemoMode) {
        return demoStorage.loginDemoUser(email);
      }
      return liveAuthService.login(email, pass);
    },

    async register(email: string, pass: string, name: string, role?: UserRole): Promise<UserProfile> {
      if (isDemoMode) {
        return demoStorage.loginDemoUser(email);
      }
      return liveAuthService.register(email, pass, name, role);
    },

    async logout(): Promise<void> {
      if (isDemoMode) {
        await demoStorage.setCurrentUser(null);
      } else {
        await liveAuthService.logout();
      }
    },

    async switchRole(role: UserRole): Promise<UserProfile> {
      return demoStorage.switchRole(role);
    },

    async getUsers(): Promise<UserProfile[]> {
      return demoStorage.getUsers();
    },

    async updateUserRole(uid: string, newRole: UserRole): Promise<UserProfile> {
      return demoStorage.updateUserRole(uid, newRole);
    },

    async toggleUserStatus(uid: string): Promise<UserProfile> {
      return demoStorage.toggleUserStatus(uid);
    },
  },

  canteens: {
    async getBuildings(): Promise<Building[]> {
      if (isDemoMode) {
        return demoStorage.getBuildings();
      }
      return liveCanteenService.getBuildings();
    },

    async getCanteens(): Promise<Canteen[]> {
      if (isDemoMode) {
        return demoStorage.getCanteens();
      }
      return liveCanteenService.getCanteens();
    },

    async getCanteenById(id: string): Promise<Canteen | null> {
      if (isDemoMode) {
        return demoStorage.getCanteenById(id) || null;
      }
      return liveCanteenService.getCanteenById(id);
    },

    async toggleCanteenOpen(canteenId: string, isOpen: boolean): Promise<void> {
      if (isDemoMode) {
        await demoStorage.toggleCanteenOpen(canteenId, isOpen);
      } else {
        await liveCanteenService.toggleCanteenOpen(canteenId, isOpen);
      }
    },

    async updateCanteen(canteen: Canteen): Promise<Canteen> {
      return demoStorage.updateCanteen(canteen);
    },
  },

  menu: {
    async getMenuItems(canteenId?: string): Promise<MenuItem[]> {
      if (isDemoMode) {
        return demoStorage.getMenuItems(canteenId);
      }
      return liveMenuService.getMenuItems(canteenId);
    },

    async toggleItemAvailability(itemId: string, isAvailable: boolean): Promise<void> {
      if (isDemoMode) {
        await demoStorage.toggleItemAvailability(itemId, isAvailable);
      } else {
        await liveMenuService.toggleItemAvailability(itemId, isAvailable);
      }
    },

    async saveMenuItem(item: MenuItem): Promise<MenuItem> {
      if (isDemoMode) {
        return demoStorage.saveMenuItem(item);
      }
      await liveMenuService.saveMenuItem(item);
      return item;
    },
  },

  orders: {
    async getOrders(canteenId?: string, userId?: string): Promise<Order[]> {
      if (isDemoMode) {
        return demoStorage.getOrders(canteenId, userId);
      }
      return liveOrderService.getOrders(canteenId, userId);
    },

    async getOrderById(orderId: string): Promise<Order | null> {
      if (isDemoMode) {
        return demoStorage.getOrderById(orderId) || null;
      }
      return liveOrderService.getOrderById(orderId);
    },

    async createOrder(orderInput: Partial<Order>): Promise<Order> {
      if (isDemoMode) {
        return demoStorage.createOrder(orderInput);
      }
      return liveOrderService.createOrder(orderInput);
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<void> {
      if (isDemoMode) {
        await demoStorage.updateOrderStatus(orderId, newStatus, note);
      } else {
        await liveOrderService.updateOrderStatus(orderId, newStatus, note);
      }
    },

    async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void> {
      if (isDemoMode) {
        await demoStorage.updatePaymentStatus(orderId, paymentStatus);
      } else {
        await liveOrderService.updatePaymentStatus(orderId, paymentStatus);
      }
    },

    async verifyPickupToken(canteenId: string, token: string): Promise<Order> {
      if (isDemoMode) {
        return demoStorage.verifyPickupToken(canteenId, token);
      }
      return liveOrderService.verifyPickupToken(canteenId, token);
    },

    async cancelOrder(orderId: string, reason?: string): Promise<Order> {
      return demoStorage.cancelOrder(orderId, reason);
    },

    getOrderEvents(orderId: string): OrderEvent[] {
      return demoStorage.getOrderEvents(orderId);
    },
  },

  settings: {
    getSettings(): CampusSettings {
      return demoStorage.getSettings();
    },

    async updateSettings(settings: Partial<CampusSettings>): Promise<CampusSettings> {
      return demoStorage.updateSettings(settings);
    },
  },

  audit: {
    getAuditLogs(): AuditLog[] {
      return demoStorage.getAuditLogs();
    },
  },
};

