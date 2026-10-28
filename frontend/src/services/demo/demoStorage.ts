import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEMO_BUILDINGS,
  DEMO_CANTEENS,
  DEMO_MENU_ITEMS,
  DEMO_USERS,
  INITIAL_ORDERS,
  DEMO_CAMPUS_SETTINGS,
} from './demoData';
import { UserProfile, UserRole } from '../../models/user';
import { Building, Canteen } from '../../models/campus';
import { MenuItem } from '../../models/menu';
import { Order, OrderEvent, OrderStatus, PaymentStatus } from '../../models/order';
import { CampusSettings } from '../../models/settings';
import { AuditLog } from '../../models/audit';
import { generateOrderNumber, generatePickupToken, normalizeToken } from '../../utils/tokenGenerator';

const STORAGE_KEYS = {
  USERS: '@mu_demo_users',
  CANTEENS: '@mu_demo_canteens',
  BUILDINGS: '@mu_demo_buildings',
  MENU_ITEMS: '@mu_demo_menu_items',
  ORDERS: '@mu_demo_orders',
  ORDER_EVENTS: '@mu_demo_order_events',
  SETTINGS: '@mu_demo_settings',
  AUDIT_LOGS: '@mu_demo_audit_logs',
  CURRENT_USER: '@mu_demo_current_user',
};

class DemoStorageEngine {
  private users: UserProfile[] = [...DEMO_USERS];
  private buildings: Building[] = [...DEMO_BUILDINGS];
  private canteens: Canteen[] = [...DEMO_CANTEENS];
  private menuItems: MenuItem[] = [...DEMO_MENU_ITEMS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private orderEvents: OrderEvent[] = [];
  private settings: CampusSettings = { ...DEMO_CAMPUS_SETTINGS };
  private auditLogs: AuditLog[] = [];
  private currentUser: UserProfile | null = DEMO_USERS[0]; // Default Sakshi Patel (Student)
  private initialized = false;

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const [u, b, c, m, o, s, cur] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.BUILDINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CANTEENS),
        AsyncStorage.getItem(STORAGE_KEYS.MENU_ITEMS),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      ]);

      if (u) this.users = JSON.parse(u);
      if (b) this.buildings = JSON.parse(b);
      if (c) this.canteens = JSON.parse(c);
      if (m) this.menuItems = JSON.parse(m);
      if (o) this.orders = JSON.parse(o);
      if (s) this.settings = JSON.parse(s);
      if (cur) this.currentUser = JSON.parse(cur);
    } catch {
      // Fallback to memory defaults
    }
    this.initialized = true;
    this.notify();
  }

  private async persist(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users)),
        AsyncStorage.setItem(STORAGE_KEYS.CANTEENS, JSON.stringify(this.canteens)),
        AsyncStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(this.menuItems)),
        AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders)),
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser)),
      ]);
    } catch {
      // Memory persistence retained
    }
    this.notify();
  }

  // --- Auth & Users ---
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async setCurrentUser(user: UserProfile | null): Promise<void> {
    this.currentUser = user;
    await this.persist();
  }

  async loginDemoUser(email: string): Promise<UserProfile> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error(`Demo account with email ${email} not found.`);
    }
    if (user.accountStatus === 'suspended') {
      throw new Error('This account has been disabled by the campus administrator.');
    }
    this.currentUser = user;
    await this.persist();
    return user;
  }

  async switchRole(role: UserRole): Promise<UserProfile> {
    const target = this.users.find((u) => u.role === role);
    if (!target) throw new Error(`No demo account found for role ${role}`);
    this.currentUser = target;
    await this.persist();
    return target;
  }

  getUsers(): UserProfile[] {
    return [...this.users];
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<UserProfile> {
    const idx = this.users.findIndex((u) => u.uid === uid);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = {
      ...this.users[idx],
      role: newRole,
      updatedAt: new Date().toISOString(),
    };
    if (this.currentUser?.uid === uid) {
      this.currentUser = this.users[idx];
    }
    this.logAudit('user', uid, 'ROLE_UPDATED', { newRole });
    await this.persist();
    return this.users[idx];
  }

  async toggleUserStatus(uid: string): Promise<UserProfile> {
    const idx = this.users.findIndex((u) => u.uid === uid);
    if (idx === -1) throw new Error('User not found');
    const newStatus = this.users[idx].accountStatus === 'active' ? 'suspended' : 'active';
    this.users[idx] = {
      ...this.users[idx],
      accountStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('user', uid, 'STATUS_TOGGLED', { newStatus });
    await this.persist();
    return this.users[idx];
  }

  // --- Campus & Canteens ---
  getBuildings(): Building[] {
    return [...this.buildings];
  }

  getCanteens(): Canteen[] {
    return [...this.canteens];
  }

  getCanteenById(id: string): Canteen | undefined {
    return this.canteens.find((c) => c.canteenId === id);
  }

  async toggleCanteenOpen(canteenId: string, isOpen: boolean): Promise<Canteen> {
    const idx = this.canteens.findIndex((c) => c.canteenId === canteenId);
    if (idx === -1) throw new Error('Canteen not found');
    this.canteens[idx] = {
      ...this.canteens[idx],
      isOpen,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('canteen', canteenId, isOpen ? 'CANTEEN_OPENED' : 'CANTEEN_CLOSED', { isOpen });
    await this.persist();
    return this.canteens[idx];
  }

  async updateCanteen(canteen: Canteen): Promise<Canteen> {
    const idx = this.canteens.findIndex((c) => c.canteenId === canteen.canteenId);
    if (idx === -1) {
      this.canteens.push(canteen);
    } else {
      this.canteens[idx] = canteen;
    }
    this.logAudit('canteen', canteen.canteenId, 'CANTEEN_CONFIG_UPDATED', { canteen });
    await this.persist();
    return canteen;
  }

  // --- Menu Management ---
  getMenuItems(canteenId?: string): MenuItem[] {
    if (canteenId) {
      return this.menuItems.filter((m) => m.canteenId === canteenId && m.isActive);
    }
    return this.menuItems.filter((m) => m.isActive);
  }

  async toggleItemAvailability(itemId: string, isAvailable: boolean): Promise<MenuItem> {
    const idx = this.menuItems.findIndex((m) => m.itemId === itemId);
    if (idx === -1) throw new Error('Menu item not found');
    this.menuItems[idx] = {
      ...this.menuItems[idx],
      isAvailable,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('menu_item', itemId, 'AVAILABILITY_TOGGLED', {
      name: this.menuItems[idx].name,
      isAvailable,
    });
    await this.persist();
    return this.menuItems[idx];
  }

  async saveMenuItem(item: MenuItem): Promise<MenuItem> {
    const idx = this.menuItems.findIndex((m) => m.itemId === item.itemId);
    if (idx === -1) {
      this.menuItems.push(item);
      this.logAudit('menu_item', item.itemId, 'ITEM_CREATED', { item });
    } else {
      this.menuItems[idx] = item;
      this.logAudit('menu_item', item.itemId, 'ITEM_UPDATED', { item });
    }
    await this.persist();
    return item;
  }

  // --- Orders & State Machine ---
  getOrders(canteenId?: string, userId?: string): Order[] {
    let result = [...this.orders];
    if (canteenId) {
      result = result.filter((o) => o.canteenId === canteenId);
    }
    if (userId) {
      result = result.filter((o) => o.userId === userId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.orderId === orderId);
  }

  async createOrder(orderInput: Partial<Order>): Promise<Order> {
    const canteen = this.getCanteenById(orderInput.canteenId!);
    if (!canteen) throw new Error('Canteen does not exist');
    if (!canteen.isOpen) throw new Error(`${canteen.name} is currently closed for orders.`);

    // Recheck item availability
    for (const item of orderInput.itemsSnapshot || []) {
      const liveItem = this.menuItems.find((m) => m.itemId === item.itemId);
      if (!liveItem || !liveItem.isAvailable) {
        throw new Error(`Item "${item.name}" has sold out since you opened the menu.`);
      }
    }

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderNumber = generateOrderNumber();
    const pickupToken = generatePickupToken();
    const now = new Date().toISOString();

    // Auto-acceptance rule check
    const initialStatus: OrderStatus =
      canteen.acceptanceMode === 'auto' ? 'accepted' : 'awaiting_acceptance';

    const newOrder: Order = {
      orderId,
      orderNumber,
      userId: this.currentUser?.uid || 'guest',
      userDisplayName: this.currentUser?.displayName || 'Student',
      userRole: this.currentUser?.role || 'student',
      canteenId: canteen.canteenId,
      canteenName: canteen.name,
      buildingName: canteen.buildingName,
      floor: canteen.floor,
      orderType: orderInput.orderType || 'instant',
      itemsSnapshot: orderInput.itemsSnapshot || [],
      subtotal: orderInput.subtotal || 0,
      total: orderInput.total || 0,
      paymentMethod: orderInput.paymentMethod || 'simulated_upi',
      paymentStatus: orderInput.paymentMethod === 'cash_at_counter' ? 'pending' : 'paid',
      orderStatus: initialStatus,
      pickupTime: orderInput.pickupTime,
      pickupToken,
      isTokenVerified: false,
      policyVersion: orderInput.policyVersion,
      policyAcceptedAt: orderInput.policyAcceptedAt,
      idempotencyKey: orderInput.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(newOrder);

    this.addOrderEvent(
      orderId,
      null,
      initialStatus,
      canteen.acceptanceMode === 'auto'
        ? 'Order placed and automatically accepted.'
        : 'Order placed, awaiting canteen operator acceptance.'
    );

    this.logAudit('order', orderId, 'ORDER_CREATED', {
      orderNumber,
      total: newOrder.total,
      type: newOrder.orderType,
    });

    await this.persist();
    return newOrder;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    actorId?: string,
    actorRole?: string
  ): Promise<Order> {
    const idx = this.orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error('Order not found');
    const prevOrder = this.orders[idx];
    const prevStatus = prevOrder.orderStatus;

    // Validate state machine transitions
    this.validateTransition(prevStatus, newStatus);

    let paymentStatus = prevOrder.paymentStatus;
    if (newStatus === 'rejected' || newStatus === 'cancelled') {
      if (paymentStatus === 'paid') {
        paymentStatus = 'refunded';
      }
    }

    const patch: Partial<Order> = {
      orderStatus: newStatus,
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'ready_for_pickup' && !prevOrder.readyAt) {
      patch.readyAt = new Date().toISOString();
    }

    this.orders[idx] = {
      ...prevOrder,
      ...patch,
    };

    this.addOrderEvent(
      orderId,
      prevStatus,
      newStatus,
      note || `Status changed from ${prevStatus} to ${newStatus}`,
      actorId,
      actorRole
    );

    this.logAudit('order', orderId, 'ORDER_STATUS_CHANGED', {
      orderNumber: prevOrder.orderNumber,
      previousStatus: prevStatus,
      newStatus,
    });

    await this.persist();
    return this.orders[idx];
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const idx = this.orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error('Order not found');
    this.orders[idx] = {
      ...this.orders[idx],
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    this.logAudit('order', orderId, 'PAYMENT_STATUS_UPDATED', {
      orderNumber: this.orders[idx].orderNumber,
      paymentStatus,
    });

    await this.persist();
    return this.orders[idx];
  }

  async verifyPickupToken(canteenId: string, inputToken: string): Promise<Order> {
    const formatted = normalizeToken(inputToken);
    const order = this.orders.find(
      (o) => o.canteenId === canteenId && o.pickupToken.toUpperCase() === formatted.toUpperCase()
    );

    if (!order) {
      throw new Error(`Token "${formatted}" not found for this canteen. Please check the code.`);
    }

    if (order.isTokenVerified || order.orderStatus === 'picked_up') {
      throw new Error(`Order ${order.orderNumber} has ALREADY been collected! Duplicate pickup rejected.`);
    }

    if (order.orderStatus === 'cancelled' || order.orderStatus === 'rejected') {
      throw new Error(`Order ${order.orderNumber} was ${order.orderStatus} and cannot be collected.`);
    }

    const idx = this.orders.findIndex((o) => o.orderId === order.orderId);
    this.orders[idx] = {
      ...order,
      orderStatus: 'picked_up',
      isTokenVerified: true,
      updatedAt: new Date().toISOString(),
    };

    this.addOrderEvent(
      order.orderId,
      order.orderStatus,
      'picked_up',
      `Order collected at counter. Token ${formatted} verified successfully.`
    );

    this.logAudit('order', order.orderId, 'PICKUP_VERIFIED', {
      token: formatted,
      orderNumber: order.orderNumber,
    });

    await this.persist();
    return this.orders[idx];
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const idx = this.orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error('Order not found');
    const order = this.orders[idx];

    // Cancellation is permitted ONLY before preparation starts
    if (order.orderStatus === 'preparing' || order.orderStatus === 'ready_for_pickup') {
      throw new Error('Cannot cancel: The canteen kitchen is already preparing or has finished your order.');
    }
    if (order.orderStatus === 'picked_up') {
      throw new Error('Order has already been collected.');
    }
    if (order.orderStatus === 'cancelled') {
      throw new Error('Order is already cancelled.');
    }

    return this.updateOrderStatus(
      orderId,
      'cancelled',
      reason || 'Student requested cancellation prior to kitchen preparation.'
    );
  }

  private validateTransition(from: OrderStatus, to: OrderStatus): void {
    if (from === to) return;
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      awaiting_acceptance: ['accepted', 'rejected', 'cancelled', 'expired'],
      accepted: ['preparing', 'cancelled', 'rejected'],
      preparing: ['ready_for_pickup'],
      ready_for_pickup: ['picked_up', 'uncollected'],
      picked_up: [],
      rejected: [],
      cancellation_requested: ['cancelled', 'accepted', 'rejected'],
      cancelled: [],
      uncollected: [],
      expired: [],
    };

    const allowed = allowedTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid status transition from "${from}" to "${to}".`);
    }
  }

  private addOrderEvent(
    orderId: string,
    previousStatus: OrderStatus | null,
    newStatus: OrderStatus,
    note?: string,
    actorId?: string,
    actorRole?: string
  ): void {
    const event: OrderEvent = {
      eventId: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId,
      actorId: actorId || this.currentUser?.uid || 'system',
      actorRole: actorRole || this.currentUser?.role || 'system',
      previousStatus,
      newStatus,
      timestamp: new Date().toISOString(),
      note,
    };
    this.orderEvents.unshift(event);
  }

  getOrderEvents(orderId: string): OrderEvent[] {
    return this.orderEvents.filter((e) => e.orderId === orderId);
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private logAudit(
    entityType: AuditLog['entityType'],
    entityId: string,
    action: string,
    details: Record<string, any>
  ): void {
    const log: AuditLog = {
      logId: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      actorId: this.currentUser?.uid || 'system',
      actorEmail: this.currentUser?.email || 'system@marwadiuniversity.ac.in',
      actorRole: this.currentUser?.role || 'system',
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      details,
    };
    this.auditLogs.unshift(log);
  }

  // --- Settings ---
  getSettings(): CampusSettings {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<CampusSettings>): Promise<CampusSettings> {
    this.settings = {
      ...this.settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('settings', 'campus_settings', 'SETTINGS_UPDATED', { newSettings });
    await this.persist();
    return this.settings;
  }
}

export const demoStorage = new DemoStorageEngine();

