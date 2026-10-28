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

// 3. Cancellation Policy Rule Check
function validateCancellation(order, actorRole, actorUid) {
  if (actorRole === 'admin') return true;

  if (order.userId !== actorUid) {
    throw new Error('PERMISSION_DENIED: Can only cancel own order.');
  }

  if (order.orderStatus === 'preparing' || order.orderStatus === 'ready_for_pickup') {
    throw new Error('CANNOT_CANCEL: Food is already being prepared or is ready.');
  }

  if (order.orderStatus === 'picked_up') {
    throw new Error('CANNOT_CANCEL: Order has already been collected.');
  }

  return true;
}

test('Cancellation allowed only before food preparation starts', () => {
  const studentUid = 'student-123';
  const orderAwaiting = { userId: studentUid, orderStatus: 'awaiting_acceptance' };
  const orderAccepted = { userId: studentUid, orderStatus: 'accepted' };
  const orderPreparing = { userId: studentUid, orderStatus: 'preparing' };
  const orderReady = { userId: studentUid, orderStatus: 'ready_for_pickup' };

  assert.equal(validateCancellation(orderAwaiting, 'student', studentUid), true);
  assert.equal(validateCancellation(orderAccepted, 'student', studentUid), true);

  assert.throws(() => {
    validateCancellation(orderPreparing, 'student', studentUid);
  }, /CANNOT_CANCEL/);

  assert.throws(() => {
    validateCancellation(orderReady, 'student', studentUid);
  }, /CANNOT_CANCEL/);
});

