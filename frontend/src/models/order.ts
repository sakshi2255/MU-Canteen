export type OrderStatus =
  | 'awaiting_acceptance'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'rejected'
  | 'cancellation_requested'
  | 'cancelled'
  | 'uncollected'
  | 'expired';

export type PaymentStatus =
  | 'not_required'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refund_pending'
  | 'refunded';

export type OrderType = 'instant' | 'preorder';

export type PaymentMethod = 'razorpay' | 'simulated_upi' | 'simulated_card' | 'cash_at_counter';

export interface OrderItemSnapshot {
  itemId: string;
  name: string;
  price: number; // in INR
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  orderNumber: string; // User-facing order code (e.g., #MU-1042)
  userId: string;
  userDisplayName: string;
  userRole: string;
  canteenId: string;
  canteenName: string;
  buildingName: string;
  floor: number;
  orderType: OrderType;
  itemsSnapshot: OrderItemSnapshot[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupTime?: string; // Scheduled pickup slot string (e.g. "1:15 PM - 1:30 PM")
  pickupToken: string; // Secure pickup verification token (e.g. "MU-7842")
  isTokenVerified: boolean;
  readyAt?: string; // Timestamp when food was marked ready (starts 12-min window)
  paymentTransactionId?: string; // Razorpay payment ID (e.g. "pay_mu_928192")
  policyVersion?: string;
  policyAcceptedAt?: string;
  cancellationRequestedAt?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  eventId: string;
  orderId: string;
  actorId: string;
  actorRole: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  timestamp: string;
  note?: string;
}
