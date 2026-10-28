import test from 'node:test';
import assert from 'node:assert/strict';

// Test token generator and normalizer
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

// Test Order State Machine Transitions
const allowedTransitions = {
  awaiting_acceptance: ['accepted', 'rejected', 'cancelled', 'expired'],
  accepted: ['preparing', 'cancelled', 'rejected'],
  preparing: ['ready_for_pickup'],
  ready_for_pickup: ['picked_up', 'uncollected'],
  picked_up: [],
  rejected: [],
  cancelled: [],
  uncollected: [],
  expired: [],
};

function canTransition(from, to) {
  const list = allowedTransitions[from] || [];
  return list.includes(to);
}

function canStudentCancel(orderStatus) {
  return orderStatus === 'awaiting_acceptance' || orderStatus === 'accepted';
}

test('State transitions follow valid lifecycle', () => {
  assert.equal(canTransition('awaiting_acceptance', 'accepted'), true);
  assert.equal(canTransition('accepted', 'preparing'), true);
  assert.equal(canTransition('preparing', 'ready_for_pickup'), true);
  assert.equal(canTransition('ready_for_pickup', 'picked_up'), true);

  // Illegal transitions
  assert.equal(canTransition('rejected', 'picked_up'), false);
  assert.equal(canTransition('picked_up', 'preparing'), false);
  assert.equal(canTransition('ready_for_pickup', 'accepted'), false);
});

test('Student can only cancel BEFORE kitchen preparation begins', () => {
  assert.equal(canStudentCancel('awaiting_acceptance'), true);
  assert.equal(canStudentCancel('accepted'), true);
  assert.equal(canStudentCancel('preparing'), false);
  assert.equal(canStudentCancel('ready_for_pickup'), false);
  assert.equal(canStudentCancel('picked_up'), false);
});

// Test Single Canteen Cart Invariant
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

