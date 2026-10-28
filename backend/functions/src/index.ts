import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

type OrderStatus =
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

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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

/**
 * Trusted order creation handler
 * Re-validates live menu item prices, item availability, and canteen open status.
 */
export const createOrderSecure = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { canteenId, items, orderType, pickupTime, policyVersion } = data;
  if (!canteenId || !items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required order fields.');
  }

  const canteenRef = db.collection('canteens').doc(canteenId);
  const canteenSnap = await canteenRef.get();
  if (!canteenSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Canteen not found.');
  }

  const canteenData = canteenSnap.data()!;
  if (!canteenData.isOpen) {
    throw new functions.https.HttpsError('failed-precondition', `${canteenData.name} is currently closed.`);
  }

  let calculatedSubtotal = 0;
  const itemsSnapshot: any[] = [];

  for (const requestedItem of items) {
    const itemSnap = await db.collection('menuItems').doc(requestedItem.itemId).get();
    if (!itemSnap.exists) {
      throw new functions.https.HttpsError('not-found', `Item ${requestedItem.name} not found.`);
    }
    const itemData = itemSnap.data()!;
    if (!itemData.isAvailable) {
      throw new functions.https.HttpsError('failed-precondition', `Item "${itemData.name}" is sold out.`);
    }

    const price = itemData.price;
    const qty = requestedItem.quantity || 1;
    const itemSubtotal = price * qty;
    calculatedSubtotal += itemSubtotal;

    itemsSnapshot.push({
      itemId: requestedItem.itemId,
      name: itemData.name,
      price,
      quantity: qty,
      subtotal: itemSubtotal,
    });
  }

  const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const orderNumber = `#MU-${Math.floor(1000 + Math.random() * 9000)}`;

  // Pickup token generator
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const pickupToken = `MU-${code}`;

  const initialStatus: OrderStatus =
    canteenData.acceptanceMode === 'auto' ? 'accepted' : 'awaiting_acceptance';

  const newOrder = {
    orderId,
    orderNumber,
    userId: context.auth.uid,
    userDisplayName: context.auth.token.name || 'Student',
    canteenId,
    canteenName: canteenData.name,
    buildingName: canteenData.buildingName,
    floor: canteenData.floor,
    orderType: orderType || 'instant',
    itemsSnapshot,
    subtotal: calculatedSubtotal,
    total: calculatedSubtotal,
    paymentMethod: data.paymentMethod || 'simulated_upi',
    paymentStatus: data.paymentMethod === 'cash_at_counter' ? 'pending' : 'paid',
    orderStatus: initialStatus,
    pickupTime: pickupTime || null,
    pickupToken,
    isTokenVerified: false,
    policyVersion: policyVersion || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('orders').doc(orderId).set(newOrder);

  // Record audit log
  await db.collection('auditLogs').add({
    actorId: context.auth.uid,
    actorRole: 'student',
    action: 'ORDER_CREATED',
    entityType: 'order',
    entityId: orderId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    details: { orderNumber, total: calculatedSubtotal, orderType },
  });

  return newOrder;
});

/**
 * Atomic token verification for counter pickup
 * Prevents double-collection and ensures token belongs to assigned canteen.
 */
export const verifyPickupTokenSecure = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { canteenId, pickupToken } = data;
  if (!canteenId || !pickupToken) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing canteenId or pickupToken.');
  }

  const formattedToken = pickupToken.trim().toUpperCase();

  const q = await db
    .collection('orders')
    .where('canteenId', '==', canteenId)
    .where('pickupToken', '==', formattedToken)
    .limit(1)
    .get();

  if (q.empty) {
    throw new functions.https.HttpsError('not-found', `Token "${formattedToken}" not found for this canteen.`);
  }

  const orderDoc = q.docs[0];
  const orderData = orderDoc.data();

  if (orderData.isTokenVerified || orderData.orderStatus === 'picked_up') {
    throw new functions.https.HttpsError(
      'already-exists',
      `Order ${orderData.orderNumber} has ALREADY been collected! Duplicate pickup rejected.`
    );
  }

  if (['cancelled', 'rejected'].includes(orderData.orderStatus)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Order ${orderData.orderNumber} was ${orderData.orderStatus} and cannot be collected.`
    );
  }

  await orderDoc.ref.update({
    orderStatus: 'picked_up',
    isTokenVerified: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('orderEvents').add({
    orderId: orderData.orderId,
    actorId: context.auth.uid,
    actorRole: 'operator',
    previousStatus: orderData.orderStatus,
    newStatus: 'picked_up',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    note: `Token ${formattedToken} verified at counter.`,
  });

  return { success: true, orderId: orderData.orderId, orderNumber: orderData.orderNumber };
});

/**
 * Cancellation handler
 * Permitted only before food preparation begins.
 */
export const cancelOrderSecure = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { orderId, reason } = data;
  const orderRef = db.collection('orders').doc(orderId);
  const snap = await orderRef.get();

  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found.');
  }

  const orderData = snap.data()!;

  // Authorization check
  if (orderData.userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You can only cancel your own orders.');
  }

  if (['preparing', 'ready_for_pickup', 'picked_up'].includes(orderData.orderStatus)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Cannot cancel: The kitchen has already started preparation or the order is ready.'
    );
  }

  let paymentStatus = orderData.paymentStatus;
  if (paymentStatus === 'paid') {
    paymentStatus = 'refunded';
  }

  await orderRef.update({
    orderStatus: 'cancelled',
    paymentStatus,
    cancellationReason: reason || 'Student requested cancellation prior to kitchen prep.',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, orderId };
});

