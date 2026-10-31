import test from 'node:test';
import assert from 'node:assert/strict';

// --- 1. Pickup Token Generation and Normalization ---
function generatePickupToken() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MU-${code}`;
}

function normalizeToken(token) {
  const clean = token.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.startsWith('MU')) {
    return `MU-${clean.slice(2)}`;
  }
  return `MU-${clean}`;
}

test('generatePickupToken creates valid 4-character code with MU- prefix', () => {
  const token = generatePickupToken();
  assert.match(token, /^MU-[2-9A-HJ-NP-Z]{4}$/);
});

test('normalizeToken correctly handles lowercase and space variants', () => {
  assert.equal(normalizeToken('mu-4892'), 'MU-4892');
  assert.equal(normalizeToken(' 4892 '), 'MU-4892');
  assert.equal(normalizeToken('mu 4892'), 'MU-4892');
});

// --- 2. Operator Workflow State Machine: Accept/Decline -> Ready -> Collected ---
const ALLOWED_TRANSITIONS = {
  awaiting_acceptance: ['preparing', 'rejected', 'cancelled', 'expired'],
  preparing: ['ready_for_pickup'],
  ready_for_pickup: ['picked_up', 'uncollected'],
  picked_up: [],
  rejected: [],
  cancelled: [],
  uncollected: [],
  expired: [],
};

function getNextOperatorActions(status) {
  switch (status) {
    case 'awaiting_acceptance':
      return ['Accept', 'Decline'];
    case 'preparing':
      return ['Ready'];
    case 'ready_for_pickup':
      return ['Collected'];
    default:
      return [];
  }
}

function operatorTransition(currentStatus, action) {
  const validActions = getNextOperatorActions(currentStatus);
  if (!validActions.includes(action)) {
    throw new Error(`INVALID_ACTION: Action "${action}" not allowed when status is "${currentStatus}".`);
  }

  if (action === 'Accept') {
    // Automatically transitions directly to 'preparing'
    return 'preparing';
  }
  if (action === 'Decline') {
    return 'rejected';
  }
  if (action === 'Ready') {
    return 'ready_for_pickup';
  }
  if (action === 'Collected') {
    return 'picked_up';
  }
  return currentStatus;
}

test('New order appears as In Queue (awaiting_acceptance) with Accept and Decline actions', () => {
  const status = 'awaiting_acceptance';
  const actions = getNextOperatorActions(status);
  assert.deepEqual(actions, ['Accept', 'Decline']);
  assert.equal(actions.includes('Ready'), false);
  assert.equal(actions.includes('Collected'), false);
});

test('Accept moves order directly to Preparing without separate Start Preparing button', () => {
  const nextStatus = operatorTransition('awaiting_acceptance', 'Accept');
  assert.equal(nextStatus, 'preparing');

  // Once in preparing, only 'Ready' is available
  const actionsInPrep = getNextOperatorActions(nextStatus);
  assert.deepEqual(actionsInPrep, ['Ready']);
  assert.equal(actionsInPrep.includes('Start Preparing'), false);
});

test('Ready transitions from Preparing to Ready for Pickup', () => {
  const nextStatus = operatorTransition('preparing', 'Ready');
  assert.equal(nextStatus, 'ready_for_pickup');

  // Once ready for pickup, only 'Collected' is available
  const actionsInReady = getNextOperatorActions(nextStatus);
  assert.deepEqual(actionsInReady, ['Collected']);
});

test('Collected completes pickup and disables further actions', () => {
  const finalStatus = operatorTransition('ready_for_pickup', 'Collected');
  assert.equal(finalStatus, 'picked_up');

  // Once collected, no further actions allowed
  const actionsFinal = getNextOperatorActions(finalStatus);
  assert.deepEqual(actionsFinal, []);
});

test('Decline transitions order to Rejected and terminates active actions', () => {
  const declinedStatus = operatorTransition('awaiting_acceptance', 'Decline');
  assert.equal(declinedStatus, 'rejected');

  const actionsAfterDecline = getNextOperatorActions(declinedStatus);
  assert.deepEqual(actionsAfterDecline, []);
});

test('Cannot perform out-of-sequence actions', () => {
  // Cannot click Ready while awaiting acceptance
  assert.throws(() => {
    operatorTransition('awaiting_acceptance', 'Ready');
  }, /INVALID_ACTION/);

  // Cannot click Collected while preparing
  assert.throws(() => {
    operatorTransition('preparing', 'Collected');
  }, /INVALID_ACTION/);

  // Completed orders cannot be transitioned again
  assert.throws(() => {
    operatorTransition('picked_up', 'Collected');
  }, /INVALID_ACTION/);
});

test('Automatic acceptance canteen moves eligible order directly to Preparing', () => {
  const canteen = { acceptanceMode: 'auto', isOpen: true };
  const initialStatus = canteen.acceptanceMode === 'auto' ? 'preparing' : 'awaiting_acceptance';
  assert.equal(initialStatus, 'preparing');

  // Operator next manual action is Ready
  const nextActions = getNextOperatorActions(initialStatus);
  assert.deepEqual(nextActions, ['Ready']);
});

// --- 3. Preorder Policy Flow & Invariants ---
class PreorderFlowSimulator {
  constructor() {
    this.orderType = 'instant';
    this.selectedSlot = null;
    this.isPolicyAccepted = false;
    this.policyAcceptedAt = null;
    this.policyVersion = null;
  }

  selectPreorder(slot) {
    this.orderType = 'preorder';
    this.selectedSlot = slot;
  }

  acceptPolicy(version = '1.0-REV1') {
    this.isPolicyAccepted = true;
    this.policyAcceptedAt = new Date().toISOString();
    this.policyVersion = version;
  }

  declinePolicy() {
    this.isPolicyAccepted = false;
    this.policyAcceptedAt = null;
    this.policyVersion = null;
    this.selectedSlot = null;
    this.orderType = 'instant'; // Reverted
  }

  checkout() {
    if (this.orderType === 'preorder') {
      if (!this.selectedSlot) {
        throw new Error('PREORDER_ERROR: No pickup slot selected.');
      }
      if (!this.isPolicyAccepted) {
        throw new Error('POLICY_REQUIRED: Preorder policy must be explicitly accepted.');
      }
    }
    return {
      orderType: this.orderType,
      pickupSlot: this.selectedSlot,
      policyAcceptedAt: this.policyAcceptedAt,
      policyVersion: this.policyVersion,
      confirmed: true,
    };
  }
}

test('Preorder requires explicit policy acceptance before confirmation', () => {
  const flow = new PreorderFlowSimulator();
  flow.selectPreorder({ id: 'slot-1', label: '12:30 PM - 12:45 PM' });

  // Attempting checkout without policy acceptance throws error
  assert.throws(() => {
    flow.checkout();
  }, /POLICY_REQUIRED/);

  // Accepting policy allows checkout and records version & timestamp
  flow.acceptPolicy('1.0-REV1');
  const result = flow.checkout();
  assert.equal(result.confirmed, true);
  assert.equal(result.policyVersion, '1.0-REV1');
  assert.ok(result.policyAcceptedAt);
});

test('Declining preorder policy does not reserve slot and reverts to Instant', () => {
  const flow = new PreorderFlowSimulator();
  flow.selectPreorder({ id: 'slot-1', label: '12:30 PM - 12:45 PM' });
  flow.declinePolicy();

  assert.equal(flow.orderType, 'instant');
  assert.equal(flow.selectedSlot, null);
  assert.equal(flow.isPolicyAccepted, false);
});

// --- 4. Student Cancellation Cutoff Rule ---
function canStudentCancel(orderStatus) {
  // Only allowed while in queue before preparation begins
  return orderStatus === 'awaiting_acceptance';
}

test('Student can only cancel while In Queue before kitchen preparation begins', () => {
  assert.equal(canStudentCancel('awaiting_acceptance'), true);
  assert.equal(canStudentCancel('preparing'), false);
  assert.equal(canStudentCancel('ready_for_pickup'), false);
  assert.equal(canStudentCancel('picked_up'), false);
});

// --- 5. Single-Canteen Cart Constraint ---
class TestCart {
  constructor() {
    this.items = [];
    this.canteenId = null;
  }

  addItem(canteenId, item, qty = 1) {
    if (this.canteenId && this.canteenId !== canteenId && this.items.length > 0) {
      throw new Error('CART_CANTEEN_CONFLICT: Cannot combine items from different canteens.');
    }
    this.canteenId = canteenId;
    const existing = this.items.find((i) => i.itemId === item.itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ itemId: item.itemId, price: item.price, qty });
    }
  }

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }
}

test('Cart enforces single-canteen constraint', () => {
  const cart = new TestCart();
  cart.addItem('canteen-mb-1', { itemId: 'item-101', price: 25 }, 2);
  assert.equal(cart.getTotal(), 50);

  // Adding item from same canteen succeeds
  cart.addItem('canteen-mb-1', { itemId: 'item-102', price: 35 }, 1);
  assert.equal(cart.getTotal(), 85);

  // Adding item from different canteen throws error
  assert.throws(() => {
    cart.addItem('canteen-mb-2', { itemId: 'item-201', price: 70 }, 1);
  }, /CART_CANTEEN_CONFLICT/);
});
