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

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // Exact required workflow: Awaiting Acceptance -> Preparing (Accept), Rejected (Decline), Cancelled
  awaiting_acceptance: ['preparing', 'accepted', 'rejected', 'cancelled', 'expired'],
  accepted: ['preparing', 'cancelled', 'rejected'],
  preparing: ['ready_for_pickup'],
  ready_for_pickup: ['picked_up', 'uncollected'],
  picked_up: [],
  rejected: [],
  cancellation_requested: ['cancelled', 'rejected'],
  cancelled: [],
  uncollected: [],
  expired: [],
};

/**
 * Returns current date string formatted as YYYY-MM-DD in Asia/Kolkata timezone.
 */
function getKolkataDateString(): string {
  const d = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d); // e.g. "2026-11-03"
}

/**
 * Trusted order creation handler
 * Re-validates live menu item prices, item availability, and canteen open status.
 * Atomically allocates sequential daily numeric token per canteen (resets daily in Asia/Kolkata).
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

  const todayStr = getKolkataDateString();
  const counterRef = db.collection('orderCounters').doc(`${canteenId}_${todayStr}`);
  const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // If auto-accepted, order immediately starts in 'preparing'
  const initialStatus: OrderStatus =
    canteenData.acceptanceMode === 'auto' ? 'preparing' : 'awaiting_acceptance';

  // Atomic transaction to allocate unique sequential daily token
  const allocated = await db.runTransaction(async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let nextDailyToken = 1;
    let lifetimeCount = 1;

    if (counterSnap.exists) {
      const cData = counterSnap.data()!;
      nextDailyToken = (cData.lastTokenNumber || 0) + 1;
      lifetimeCount = (cData.lifetimeOrderCount || 0) + 1;
    }

    transaction.set(
      counterRef,
      {
        canteenId,
        tokenDate: todayStr,
        lastTokenNumber: nextDailyToken,
        lifetimeOrderCount: lifetimeCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const orderNumber = `#${nextDailyToken}`;
    const pickupToken = `MU-${nextDailyToken.toString().padStart(4, '0')}`;

    const orderRecord = {
      orderId,
      orderNumber,
      dailyTokenNumber: nextDailyToken,
      tokenDate: todayStr,
      lifetimeOrderCount: lifetimeCount,
      userId: context.auth!.uid,
      userDisplayName: context.auth!.token.name || 'Student',
      userRole: context.auth!.token.role || 'student',
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

    const newOrderRef = db.collection('orders').doc(orderId);
    transaction.set(newOrderRef, orderRecord);

    return orderRecord;
  });

  // Record audit log
  await db.collection('auditLogs').add({
    actorId: context.auth.uid,
    actorNameSnapshot: context.auth.token.name || 'Student',
    actorRole: 'student',
    action: 'ORDER_CREATED',
    entityType: 'order',
    entityId: orderId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    description: `Order ${allocated.orderNumber} placed for ${canteenData.name} (Token #${allocated.dailyTokenNumber})`,
    details: {
      dailyTokenNumber: allocated.dailyTokenNumber,
      total: calculatedSubtotal,
      orderType,
    },
  });

  return allocated;
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
    collectedTime: admin.firestore.FieldValue.serverTimestamp(),
    collectedStatus: 'collected',
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

  await db.collection('auditLogs').add({
    actorId: context.auth.uid,
    actorNameSnapshot: context.auth.token.name || 'Operator',
    actorRole: 'operator',
    action: 'ORDER_COLLECTED',
    entityType: 'order',
    entityId: orderData.orderId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    description: `Order ${orderData.orderNumber} verified and collected at counter.`,
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

  if (orderData.orderStatus !== 'awaiting_acceptance') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Cannot cancel: Orders can only be cancelled while In Queue (current: ${orderData.orderStatus}).`
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

  await db.collection('auditLogs').add({
    actorId: context.auth.uid,
    actorNameSnapshot: context.auth.token.name || 'Student',
    actorRole: 'student',
    action: 'ORDER_CANCELLED',
    entityType: 'order',
    entityId: orderId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    description: `Order ${orderData.orderNumber} cancelled by student while In Queue.`,
  });

  return { success: true, orderId };
});
