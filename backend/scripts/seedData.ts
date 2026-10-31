/**
 * Marwadi University — Canteen Management Platform
 * Authoritative Canonical Backend Seed Script (Firebase Admin SDK)
 *
 * Idempotent: Uses { merge: true } so running repeatedly does NOT duplicate or erase existing records.
 *
 * Usage:
 *   npx ts-node seedData.ts
 * or require and invoke seedDatabase(db)
 */

import * as admin from 'firebase-admin';

export const SEED_BUILDINGS = [
  {
    buildingId: 'bldg-main',
    name: 'Main Academic Building',
    code: 'MB',
    floors: [1, 2, 3, 4, 5, 6],
    isActive: true,
  },
  {
    buildingId: 'bldg-law',
    name: 'Faculty of Law Building',
    code: 'LAW',
    floors: [1],
    isActive: true,
  },
  {
    buildingId: 'bldg-hostel',
    name: 'Campus Hostel Block A',
    code: 'HSTL',
    floors: [1],
    isActive: true,
  },
];

export const SEED_CANTEENS = [
  // 9 Combined Main Building & Law Building canteen points:
  {
    canteenId: 'canteen-mb-1',
    name: 'Stationery & Quick Bites',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 1,
    canteenType: 'stationery_cafe',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Fresh baked puffs, samosas, cutting tea and stationery supplies.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-mb-1-tea',
    name: 'Campus Chai & Morning Kiosk',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 1,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'auto',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Special ginger masala tea, bun maska, and hot breakfast snacks.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-mb-2',
    name: 'Central Campus Food Court',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 2,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'auto',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Largest food court featuring grilled sandwiches, lunch thali, noodles and shakes.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-mb-2-cafe',
    name: 'Central Espresso Bar',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 2,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Cold coffees, frappes, hot cappuccino, and chocolate cookies.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-mb-3',
    name: 'Faculty Executive Lounge & Cafe',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 3,
    canteenType: 'faculty_only',
    isOpen: true,
    operatorIds: ['operator2@marwadiuniversity.ac.in', 'demo-operator-2'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Reserved executive dining and quiet coffee lounge exclusively for MU professors and staff.',
    allowedRoles: ['faculty', 'operator', 'admin'],
    specialEligibilityNotice: 'Restricted: Exclusively for Marwadi University Faculty & Staff members.',
  },
  {
    canteenId: 'canteen-mb-4',
    name: 'South Indian & Juices Hub',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 4,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator2@marwadiuniversity.ac.in', 'demo-operator-2'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Crispy dosas, idli sambhar, fresh seasonal juices and South Indian filter coffee.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-mb-5',
    name: 'Snack Bar & Bakehouse',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 5,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Veggie burgers, panini wraps, warm brownies and bakery treats.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-mb-6',
    name: 'Skyline Rooftop Cafe',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 6,
    canteenType: 'standard',
    isOpen: false,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Rooftop dining view with evening pizza slices, mocktails, and snacks.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  {
    canteenId: 'canteen-law-1',
    name: 'Law Building Canteen',
    buildingId: 'bldg-law',
    buildingName: 'Faculty of Law Building',
    floor: 1,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator2@marwadiuniversity.ac.in', 'demo-operator-2'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Dedicated food and refreshment point for Law students, faculty, and moot court attendees.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
  },
  // Separately configured Hostel Mess:
  {
    canteenId: 'canteen-hostel-1',
    name: 'Campus Hostel Mess Point',
    buildingId: 'bldg-hostel',
    buildingName: 'Campus Hostel Block A',
    floor: 1,
    canteenType: 'hostel_mess',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in', 'demo-operator-1'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Residential dining mess with meal coupon tokens for campus hostel residents.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    specialEligibilityNotice: 'Hostel resident pass required for verification at counter.',
  },
];

export const SEED_MENU_ITEMS = [
  // Stationery & Quick Bites (Floor 1)
  { itemId: 'item-101', canteenId: 'canteen-mb-1', name: 'Aloo Masala Puff', category: 'snacks', price: 25, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-102', canteenId: 'canteen-mb-1', name: 'Paneer Makhani Puff', category: 'snacks', price: 35, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-103', canteenId: 'canteen-mb-1', name: 'Special Masala Tea (Cutting)', category: 'beverages', price: 15, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-104', canteenId: 'canteen-mb-1', name: 'Samosa with Mint Chutney (2 Pcs)', category: 'snacks', price: 30, isAvailable: false, isActive: true, isVeg: true },
  { itemId: 'item-105', canteenId: 'canteen-mb-1', name: 'Classmate Spiral Long Notebook', category: 'stationery', price: 75, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-106', canteenId: 'canteen-mb-1', name: 'Blue Gel Pen Set (3 Pack)', category: 'stationery', price: 35, isAvailable: true, isActive: true, isVeg: true },

  // Central Campus Food Court (Floor 2)
  { itemId: 'item-201', canteenId: 'canteen-mb-2', name: 'Mumbai Veg Grilled Sandwich', category: 'snacks', price: 70, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-202', canteenId: 'canteen-mb-2', name: 'Cheese Chutney Sandwich', category: 'snacks', price: 60, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-203', canteenId: 'canteen-mb-2', name: 'Gujarati Deluxe Lunch Thali', category: 'meals', price: 110, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-204', canteenId: 'canteen-mb-2', name: 'Cold Coffee with Vanilla Scoop', category: 'beverages', price: 55, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-205', canteenId: 'canteen-mb-2', name: 'Hakka Noodles with Veg Manchurian', category: 'meals', price: 85, isAvailable: true, isActive: true, isVeg: true },

  // Faculty Executive Lounge (Floor 3 - Faculty Only)
  { itemId: 'item-301', canteenId: 'canteen-mb-3', name: 'South Indian Filter Kaapi', category: 'beverages', price: 30, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-302', canteenId: 'canteen-mb-3', name: 'Paneer Tikka Brown Bread Toast', category: 'snacks', price: 80, isAvailable: true, isActive: true, isVeg: true },

  // South Indian & Juices Hub (Floor 4)
  { itemId: 'item-401', canteenId: 'canteen-mb-4', name: 'Mysore Masala Dosa', category: 'south_indian', price: 65, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-402', canteenId: 'canteen-mb-4', name: 'Steamed Idli Sambhar (2 Pcs)', category: 'south_indian', price: 40, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-403', canteenId: 'canteen-mb-4', name: 'Fresh Mosambi (Sweet Lime) Juice', category: 'beverages', price: 45, isAvailable: true, isActive: true, isVeg: true },

  // Snack Bar & Bakehouse (Floor 5)
  { itemId: 'item-501', canteenId: 'canteen-mb-5', name: 'Warm Fudge Brownie', category: 'bakery', price: 50, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-502', canteenId: 'canteen-mb-5', name: 'Crispy Veggie Burger', category: 'snacks', price: 60, isAvailable: true, isActive: true, isVeg: true },

  // Law Building Canteen (Law Floor 1)
  { itemId: 'item-law-1', canteenId: 'canteen-law-1', name: 'Grilled Veg Club Sandwich', category: 'snacks', price: 65, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-law-2', canteenId: 'canteen-law-1', name: 'Hot Lemon Ginger Tea', category: 'beverages', price: 20, isAvailable: true, isActive: true, isVeg: true },

  // Hostel Mess (Hostel Floor 1)
  { itemId: 'item-hostel-1', canteenId: 'canteen-hostel-1', name: 'Hostel Resident Evening Thali', category: 'meals', price: 80, isAvailable: true, isActive: true, isVeg: true },
];

export const SEED_USERS = [
  {
    uid: 'demo-student-1',
    email: 'student@marwadiuniversity.ac.in',
    displayName: 'Sakshi Patel',
    role: 'student',
    department: 'Computer Engineering',
    semester: 8,
    rollNumber: '200050123',
    accountStatus: 'active',
  },
  {
    uid: 'demo-faculty-1',
    email: 'faculty@marwadiuniversity.ac.in',
    displayName: 'Prof. Rajesh Sharma',
    role: 'faculty',
    department: 'Faculty of Computer Engineering',
    accountStatus: 'active',
  },
  {
    uid: 'demo-operator-1',
    email: 'operator1@marwadiuniversity.ac.in',
    displayName: 'Ramesh Bhai (Canteen 1 & 2)',
    role: 'operator',
    assignedCanteenIds: ['canteen-mb-1', 'canteen-mb-1-tea', 'canteen-mb-2', 'canteen-mb-2-cafe', 'canteen-mb-5', 'canteen-mb-6', 'canteen-hostel-1'],
    accountStatus: 'active',
  },
  {
    uid: 'demo-operator-2',
    email: 'operator2@marwadiuniversity.ac.in',
    displayName: 'Suresh Bhai (Canteen 3 & 4)',
    role: 'operator',
    assignedCanteenIds: ['canteen-mb-3', 'canteen-mb-4', 'canteen-law-1'],
    accountStatus: 'active',
  },
  {
    uid: 'demo-admin-1',
    email: 'admin@marwadiuniversity.ac.in',
    displayName: 'Campus Admin Officer',
    role: 'admin',
    accountStatus: 'active',
  },
];

export const SEED_SETTINGS = {
  campusName: 'Marwadi University, Rajkot',
  allowPreorders: true,
  preorderGracePeriodMinutes: 10,
  preorderCollectionWindowMinutes: 12,
  preorderPolicyVersion: '1.0-REV1',
  preorderPolicyText:
    '1. Preorder slots are strictly reserved. Please arrive within the 12-minute food collection window.\n' +
    '2. A 10-minute late timer window (grace period) begins after the 12-minute mark.\n' +
    '3. Food delivery is NOT provided on campus; all orders are self-pickup at the designated canteen counter.\n' +
    '4. Cancellation is permitted only BEFORE kitchen preparation begins (while In Queue).\n' +
    '5. In Review 2, uncollected orders after the full window will incur a ₹110 late fee or be transferred to discounted flash sales.',
  review2Notice: 'Advanced flash sales, automated grace-period expiry, late-fee billing and live payment gateways will be activated in Review 2.',
};

/**
 * Idempotent Seed Runner
 * Uses { merge: true } so running repeatedly does NOT overwrite existing accounts or alter existing production data.
 */
export async function seedDatabase(db: admin.firestore.Firestore): Promise<{
  buildingsCount: number;
  canteensCount: number;
  menuItemsCount: number;
  usersCount: number;
}> {
  const batch = db.batch();

  // 1. Buildings
  for (const b of SEED_BUILDINGS) {
    const ref = db.collection('buildings').doc(b.buildingId);
    batch.set(ref, b, { merge: true });
  }

  // 2. Canteens
  for (const c of SEED_CANTEENS) {
    const ref = db.collection('canteens').doc(c.canteenId);
    batch.set(ref, { ...c, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  // 3. Menu Items
  for (const item of SEED_MENU_ITEMS) {
    const ref = db.collection('menuItems').doc(item.itemId);
    batch.set(ref, { ...item, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  // 4. User Profiles (Non-destructive: will not overwrite existing active user accounts)
  for (const u of SEED_USERS) {
    const ref = db.collection('users').doc(u.uid);
    batch.set(ref, { ...u, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  // 5. Settings
  const settingsRef = db.collection('settings').doc('campus_settings');
  batch.set(settingsRef, { ...SEED_SETTINGS, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

  await batch.commit();

  return {
    buildingsCount: SEED_BUILDINGS.length,
    canteensCount: SEED_CANTEENS.length,
    menuItemsCount: SEED_MENU_ITEMS.length,
    usersCount: SEED_USERS.length,
  };
}


// Auto-run if executed directly via CLI
if (require.main === module) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    const firestore = admin.firestore();
    console.log('🌱 [MU Canteen] Seeding canonical database collections...');
    seedDatabase(firestore)
      .then((res) => {
        console.log(`✅ [MU Canteen] Seeding completed successfully:`);
        console.log(`   - Buildings:  ${res.buildingsCount}`);
        console.log(`   - Canteens:   ${res.canteensCount}`);
        console.log(`   - Menu Items: ${res.menuItemsCount}`);
        console.log(`   - Users:      ${res.usersCount}`);
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ [MU Canteen] Seeding failed:', err.message);
        console.log('ℹ️ Ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid Firebase Service Account JSON key.');
        process.exit(1);
      });
  } catch (err: any) {
    console.error('❌ [MU Canteen] Initialization error:', err.message);
    process.exit(1);
  }
}
