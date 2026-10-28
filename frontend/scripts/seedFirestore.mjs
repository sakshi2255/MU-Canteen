import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBID6aEpDYUdZPW-Dq1lhOaMLtIbeo-Rng",
  authDomain: "mu-canteen-b895a.firebaseapp.com",
  projectId: "mu-canteen-b895a",
  storageBucket: "mu-canteen-b895a.firebasestorage.app",
  messagingSenderId: "231604059707",
  appId: "1:231604059707:android:cabf8e38c301d1a3fc261e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const BUILDINGS = [
  { buildingId: 'bldg-main', name: 'Main Academic Building', code: 'MB', floors: [1, 2, 3, 4, 5, 6], isActive: true },
  { buildingId: 'bldg-law', name: 'Faculty of Law Building', code: 'LAW', floors: [1], isActive: true },
  { buildingId: 'bldg-hostel', name: 'Campus Hostel Block A', code: 'HSTL', floors: [1], isActive: true },
];

const CANTEENS = [
  {
    canteenId: 'canteen-mb-1',
    name: 'Stationery & Quick Bites',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 1,
    canteenType: 'stationery_cafe',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Fresh baked puffs, hot tea, samosas and study stationery items.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-mb-2',
    name: 'Central Campus Canteen',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 2,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in'],
    acceptanceMode: 'auto',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Largest campus food court featuring sandwiches, thali, noodles, and shakes.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-mb-3',
    name: 'Faculty Executive Lounge & Cafe',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 3,
    canteenType: 'faculty_only',
    isOpen: true,
    operatorIds: ['operator2@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Reserved dining and quiet coffee lounge exclusively for MU professors & staff.',
    allowedRoles: ['faculty', 'operator', 'admin'],
    specialEligibilityNotice: 'Restricted: Exclusively for Marwadi University Faculty & Staff members.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-mb-4',
    name: 'South Indian & Juices Hub',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 4,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator2@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Crispy dosas, idli sambhar, fresh seasonal juices and filter coffee.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-mb-5',
    name: 'Snack Bar & Bakehouse',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 5,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Burgers, wraps, cookies, muffins and chilled cold brews.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-mb-6',
    name: 'Skyline Rooftop Cafe',
    buildingId: 'bldg-main',
    buildingName: 'Main Academic Building',
    floor: 6,
    canteenType: 'standard',
    isOpen: false,
    operatorIds: ['operator1@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Rooftop view with evening mocktails, pizza slices, and tea.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-law-1',
    name: 'Law Building Canteen',
    buildingId: 'bldg-law',
    buildingName: 'Faculty of Law Building',
    floor: 1,
    canteenType: 'standard',
    isOpen: true,
    operatorIds: ['operator2@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Quick bites, tea, coffee and snacks for students and moot court participants.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    canteenId: 'canteen-hostel-1',
    name: 'Hostel Mess Point',
    buildingId: 'bldg-hostel',
    buildingName: 'Campus Hostel Block A',
    floor: 1,
    canteenType: 'hostel_mess',
    isOpen: true,
    operatorIds: ['operator1@marwadiuniversity.ac.in'],
    acceptanceMode: 'manual',
    acceptanceTimeoutMinutes: 5,
    isActive: true,
    description: 'Hostel dining mess. Meal coupons and student resident access.',
    allowedRoles: ['student', 'faculty', 'operator', 'admin'],
    specialEligibilityNotice: 'Hostel Resident pass required at pickup counter.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MENU_ITEMS = [
  { itemId: 'item-101', canteenId: 'canteen-mb-1', name: 'Aloo Masala Puff', description: 'Flaky baked pastry filled with spiced potato and peas.', category: 'snacks', price: 25, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-102', canteenId: 'canteen-mb-1', name: 'Paneer Makhani Puff', description: 'Crispy multi-layer puff stuffed with tender cottage cheese filling.', category: 'snacks', price: 35, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-103', canteenId: 'canteen-mb-1', name: 'Special Masala Tea (Cutting)', description: 'Fresh brewed milk tea with ginger, cardamom and cinnamon.', category: 'beverages', price: 15, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-104', canteenId: 'canteen-mb-1', name: 'Samosa with Mint Chutney (2 Pcs)', description: 'Golden fried potato samosas served with sweet dates & spicy mint dip.', category: 'snacks', price: 30, isAvailable: false, isActive: true, isVeg: true },
  { itemId: 'item-105', canteenId: 'canteen-mb-1', name: 'Classmate Spiral Long Notebook', description: '200 pages ruled college spiral bound notebook.', category: 'stationery', price: 75, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-106', canteenId: 'canteen-mb-1', name: 'Blue Gel Pen Set (3 Pack)', description: 'Smooth writing waterproof ink gel pens for examinations.', category: 'stationery', price: 35, isAvailable: true, isActive: true, isVeg: true },

  { itemId: 'item-201', canteenId: 'canteen-mb-2', name: 'Mumbai Veg Grilled Sandwich', description: 'Toasted bread loaded with potato masala, beetroot, cucumber and amul cheese.', category: 'snacks', price: 70, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-202', canteenId: 'canteen-mb-2', name: 'Cheese Chutney Sandwich', description: 'Triple layer sandwich with zesty coriander chutney and generous cheese.', category: 'snacks', price: 60, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-203', canteenId: 'canteen-mb-2', name: 'Gujarati Deluxe Lunch Thali', description: '2 Seasonal Sabzis, Dal, Rice, 4 Rotis, Papad, Salad & Buttermilk.', category: 'meals', price: 110, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-204', canteenId: 'canteen-mb-2', name: 'Cold Coffee with Vanilla Scoop', description: 'Thick espresso blended shake topped with creamy ice cream.', category: 'beverages', price: 55, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-205', canteenId: 'canteen-mb-2', name: 'Hakka Noodles with Veg Manchurian', description: 'Wok tossed noodles accompanied by spicy gravy manchurian balls.', category: 'meals', price: 85, isAvailable: true, isActive: true, isVeg: true },

  { itemId: 'item-301', canteenId: 'canteen-mb-3', name: 'South Indian Filter Kaapi', description: 'Traditional chicory-infused decoction coffee served hot in brass tumbler.', category: 'beverages', price: 30, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-302', canteenId: 'canteen-mb-3', name: 'Paneer Tikka Brown Bread Toast', description: 'High-protein grilled sandwich with marinated cottage cheese.', category: 'snacks', price: 80, isAvailable: true, isActive: true, isVeg: true },

  { itemId: 'item-401', canteenId: 'canteen-mb-4', name: 'Mysore Masala Dosa', description: 'Crispy fermented crepe smeared with red chutney and potato stuffing.', category: 'south_indian', price: 65, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-402', canteenId: 'canteen-mb-4', name: 'Steamed Idli Sambhar (2 Pcs)', description: 'Soft fluffy rice cakes with aromatic lentil sambhar and coconut chutney.', category: 'south_indian', price: 40, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-403', canteenId: 'canteen-mb-4', name: 'Fresh Mosambi (Sweet Lime) Juice', description: 'Freshly pressed juice without preservatives or synthetic colors.', category: 'beverages', price: 45, isAvailable: true, isActive: true, isVeg: true },

  { itemId: 'item-501', canteenId: 'canteen-mb-5', name: 'Warm Fudge Brownie', description: 'Rich dark chocolate cake brownie with melted choco chips.', category: 'bakery', price: 50, isAvailable: true, isActive: true, isVeg: true },
  { itemId: 'item-502', canteenId: 'canteen-mb-5', name: 'Crispy Veggie Burger', description: 'Sesame bun with herb patty, fresh lettuce and mayo spread.', category: 'snacks', price: 60, isAvailable: true, isActive: true, isVeg: true },
];

const USERS = [
  {
    email: 'student@marwadiuniversity.ac.in',
    password: 'password123',
    displayName: 'Sakshi Patel',
    role: 'student',
    department: 'Computer Engineering',
    semester: 8,
    rollNumber: '200050123',
  },
  {
    email: 'faculty@marwadiuniversity.ac.in',
    password: 'password123',
    displayName: 'Prof. Rajesh Sharma',
    role: 'faculty',
    department: 'Faculty of Computer Engineering',
  },
  {
    email: 'operator1@marwadiuniversity.ac.in',
    password: 'password123',
    displayName: 'Ramesh Bhai (Canteen 1 & 2)',
    role: 'operator',
    assignedCanteenIds: ['canteen-mb-1', 'canteen-mb-2'],
  },
  {
    email: 'operator2@marwadiuniversity.ac.in',
    password: 'password123',
    displayName: 'Suresh Bhai (Canteen 3 & 4)',
    role: 'operator',
    assignedCanteenIds: ['canteen-mb-3', 'canteen-mb-4'],
  },
  {
    email: 'admin@marwadiuniversity.ac.in',
    password: 'password123',
    displayName: 'Campus Admin Officer',
    role: 'admin',
  },
];

async function seed() {
  console.log('1. Creating Authentication Users...');
  const userUids = {};
  for (const u of USERS) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
      userUids[u.email] = cred.user.uid;
      console.log(`✓ Created Auth user: ${u.email}`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
        userUids[u.email] = cred.user.uid;
        console.log(`✓ Signed in existing Auth user: ${u.email}`);
      } else {
        console.error(`Auth error for ${u.email}:`, e.message);
      }
    }
  }

  // Now we are signed in! Let's write user profiles and campus data
  console.log('2. Writing User Documents to Firestore...');
  for (const u of USERS) {
    const uid = userUids[u.email];
    if (uid) {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        department: u.department || null,
        semester: u.semester || null,
        rollNumber: u.rollNumber || null,
        assignedCanteenIds: u.assignedCanteenIds || [],
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  console.log('3. Writing Buildings...');
  for (const b of BUILDINGS) {
    await setDoc(doc(db, 'buildings', b.buildingId), b);
  }

  console.log('4. Writing Canteens...');
  for (const c of CANTEENS) {
    await setDoc(doc(db, 'canteens', c.canteenId), c);
  }

  console.log('5. Writing Menu Items...');
  for (const m of MENU_ITEMS) {
    await setDoc(doc(db, 'menuItems', m.itemId), {
      ...m,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  console.log('6. Writing Campus Settings...');
  await setDoc(doc(db, 'settings', 'campus_settings'), {
    campusName: 'Marwadi University, Rajkot',
    allowPreorders: true,
    preorderGracePeriodMinutes: 10,
    preorderPolicyVersion: '1.0-REV1',
    preorderPolicyText: 'Orders not collected within the 10-minute grace period become subject to campus uncollected-order policy. No room delivery is provided on campus.',
    review2Notice: 'Advanced flash sales, late fees and live payment gateways will be activated in Review 2.',
    updatedAt: new Date().toISOString(),
  });

  console.log('All Marwadi University Seed Data Successfully Written to Firestore!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding process failed:', err);
  process.exit(1);
});

