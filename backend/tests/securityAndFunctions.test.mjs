import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Role Authorization Check Simulation
function canOperatorManageCanteen(user, canteenId) {
  if (user.role === 'admin') return true;
  if (user.role === 'operator') {
    return Array.isArray(user.assignedCanteenIds) && user.assignedCanteenIds.includes(canteenId);
  }
  return false;
}

test('Operator can only manage assigned canteens; Admin can manage all', () => {
  const operator1 = {
    role: 'operator',
    assignedCanteenIds: ['canteen-mb-1', 'canteen-mb-2'],
  };
  const admin = { role: 'admin' };
  const student = { role: 'student' };

  // Operator 1
  assert.equal(canOperatorManageCanteen(operator1, 'canteen-mb-1'), true);
  assert.equal(canOperatorManageCanteen(operator1, 'canteen-mb-2'), true);
  assert.equal(canOperatorManageCanteen(operator1, 'canteen-mb-3'), false); // Assigned to operator 2!

  // Admin
  assert.equal(canOperatorManageCanteen(admin, 'canteen-mb-3'), true);

  // Student
  assert.equal(canOperatorManageCanteen(student, 'canteen-mb-1'), false);
});

// 2. Token Verification Simulation
class TokenVerificationEngine {
  constructor() {
    this.orders = [
      {
        orderId: 'ord-1',
        canteenId: 'canteen-mb-1',
        orderNumber: '#MU-1001',
        pickupToken: 'MU-4892',
        orderStatus: 'ready_for_pickup',
        isTokenVerified: false,
      },
      {
        orderId: 'ord-2',
        canteenId: 'canteen-mb-1',
        orderNumber: '#MU-1002',
        pickupToken: 'MU-7231',
        orderStatus: 'picked_up',
        isTokenVerified: true,
      },
    ];
  }

  verify(canteenId, inputToken) {
    const cleanToken = inputToken.trim().toUpperCase();
    const order = this.orders.find(
      (o) => o.canteenId === canteenId && o.pickupToken === cleanToken
    );

    if (!order) {
      throw new Error(`TOKEN_NOT_FOUND: Token ${cleanToken} not found for this canteen.`);
    }

    if (order.isTokenVerified || order.orderStatus === 'picked_up') {
      throw new Error(`DUPLICATE_PICKUP: Order ${order.orderNumber} already collected!`);
    }

    order.orderStatus = 'picked_up';
    order.isTokenVerified = true;
    return order;
  }
}

test('Token verification succeeds and marks order picked up', () => {
  const engine = new TokenVerificationEngine();
  const res = engine.verify('canteen-mb-1', 'MU-4892');
  assert.equal(res.orderStatus, 'picked_up');
  assert.equal(res.isTokenVerified, true);
});

test('Token verification rejects duplicate collection attempts', () => {
  const engine = new TokenVerificationEngine();
  // ord-2 is already picked_up
  assert.throws(() => {
    engine.verify('canteen-mb-1', 'MU-7231');
  }, /DUPLICATE_PICKUP/);
});

test('Token verification rejects tokens from wrong canteen', () => {
  const engine = new TokenVerificationEngine();
  // Valid token for canteen-mb-1, but operator of canteen-mb-2 attempts to verify
  assert.throws(() => {
    engine.verify('canteen-mb-2', 'MU-4892');
  }, /TOKEN_NOT_FOUND/);
});

// 3. Cancellation Policy Rule Check (Firestore Rules Alignment)
function validateCancellation(order, actorRole, actorUid) {
  if (actorRole === 'admin') return true;

  if (order.userId !== actorUid) {
    throw new Error('PERMISSION_DENIED: Can only cancel own order.');
  }

  // Per Review 1 prompt & firestore.rules: Cancellation only permitted while awaiting_acceptance
  if (order.orderStatus !== 'awaiting_acceptance') {
    throw new Error(`CANNOT_CANCEL: Cancellation not permitted once order moves past awaiting_acceptance (current: ${order.orderStatus}).`);
  }

  return true;
}

test('Cancellation allowed only while awaiting_acceptance', () => {
  const studentUid = 'student-123';
  const orderAwaiting = { userId: studentUid, orderStatus: 'awaiting_acceptance' };
  const orderPreparing = { userId: studentUid, orderStatus: 'preparing' };
  const orderReady = { userId: studentUid, orderStatus: 'ready_for_pickup' };
  const orderPickedUp = { userId: studentUid, orderStatus: 'picked_up' };

  assert.equal(validateCancellation(orderAwaiting, 'student', studentUid), true);

  assert.throws(() => {
    validateCancellation(orderPreparing, 'student', studentUid);
  }, /CANNOT_CANCEL/);

  assert.throws(() => {
    validateCancellation(orderReady, 'student', studentUid);
  }, /CANNOT_CANCEL/);

  assert.throws(() => {
    validateCancellation(orderPickedUp, 'student', studentUid);
  }, /CANNOT_CANCEL/);
});

// 4. Operator Sequential State Machine: Accept / Decline -> Ready -> Collected
function transitionOperatorOrder(currentStatus, action, tokenMatches = true) {
  if (action === 'decline') {
    if (currentStatus === 'awaiting_acceptance') return 'rejected';
    throw new Error(`INVALID_TRANSITION: Cannot decline an order in status ${currentStatus}`);
  }
  if (action === 'accept') {
    // Review 1 requirement: Accept transitions directly to preparing (no separate Start Preparing button)
    if (currentStatus === 'awaiting_acceptance') return 'preparing';
    throw new Error(`INVALID_TRANSITION: Cannot accept an order in status ${currentStatus}`);
  }
  if (action === 'ready') {
    if (currentStatus === 'preparing') return 'ready_for_pickup';
    throw new Error(`INVALID_TRANSITION: Cannot mark ready when not preparing`);
  }
  if (action === 'collected') {
    if (currentStatus !== 'ready_for_pickup') {
      throw new Error(`INVALID_TRANSITION: Order must be ready_for_pickup to be collected`);
    }
    if (!tokenMatches) {
      throw new Error('TOKEN_MISMATCH: Invalid pickup token');
    }
    return 'picked_up';
  }
  throw new Error(`UNKNOWN_ACTION: ${action}`);
}

test('Sequential Operator Workflow: Accept -> Ready -> Collected', () => {
  let status = 'awaiting_acceptance';

  // Step 1: Accept -> directly moves to preparing
  status = transitionOperatorOrder(status, 'accept');
  assert.equal(status, 'preparing');

  // Step 2: Ready -> moves to ready_for_pickup
  status = transitionOperatorOrder(status, 'ready');
  assert.equal(status, 'ready_for_pickup');

  // Step 3: Collected with bad token fails
  assert.throws(() => {
    transitionOperatorOrder(status, 'collected', false);
  }, /TOKEN_MISMATCH/);

  // Step 4: Collected with valid token -> picked_up
  status = transitionOperatorOrder(status, 'collected', true);
  assert.equal(status, 'picked_up');
});

test('Operator Decline transitions awaiting_acceptance directly to rejected', () => {
  const status = transitionOperatorOrder('awaiting_acceptance', 'decline');
  assert.equal(status, 'rejected');
});
