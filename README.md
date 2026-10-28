# MU Canteen — Marwadi University Central Canteen Platform

[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-58.0-black?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_&_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-079FA7)]()

A centralized campus canteen mobile application developed for **Marwadi University, Rajkot** (B.Tech Computer Engineering Final-Year Major Project, Milestone Review 1).

---

## 📱 Review 1 Overview & Features

MU Canteen is a genuine React Native mobile application for Android (with cross-platform iOS compatibility), built with modular MVC architecture, Firebase integration, and a zero-configuration Local Demo Mode.

### 👥 Four University Roles
1. **Student:** Browse campus canteens, filter by floor, place instant/preorders, accept 10-minute grace period policy, live tracking with visual stepper, view pickup tokens, cancel before preparation.
2. **Faculty / Staff:** All student ordering features with access to restricted venues like the **Faculty Executive Lounge (Main Bldg Floor 3)**.
3. **Canteen Operator:** Manage assigned canteens, open/close with pre-opening menu availability review, live kitchen order queue, advance preparation status (`Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Picked Up`), counter pickup token verification with duplicate protection, operational reports.
4. **College Administrator:** Campus buildings and floor management, canteen configuration (types: standard, faculty-only, stationery, hostel mess), user role assignment, preorder grace-period defaults, tamper-evident security audit logs.

### 🏛️ Campus Structure (Configurable Seed Data)
- **Main Academic Building (Floors 1–6):**
  - Floor 1: Stationery & Quick Bites (Puffs, Tea, Samosas, Notebooks, Pens)
  - Floor 2: Central Campus Canteen (Sandwiches, Gujarati Thali, Cold Coffee, Meals)
  - Floor 3: Faculty Executive Lounge (Reserved for Faculty & Staff)
  - Floor 4: South Indian & Juices Hub (Mysore Masala Dosa, Idli Sambhar, Mosambi Juice)
  - Floor 5: Snack Bar & Bakehouse (Fudge Brownies, Veg Burgers)
  - Floor 6: Skyline Rooftop Cafe
- **Faculty of Law Building:** Law Building Canteen
- **Campus Hostel Block A:** Hostel Mess Point (Resident pass eligibility)

---

## 🎨 Design System & Branding

Aligned with the **Marwadi University student portal** visual style:
- **Primary Color:** `#079FA7` (University Turquoise / Teal)
- **Accent:** `#00BCD4` / `#00838F`
- **Backgrounds:** Clean `#F8FAFC` & White surfaces `#FFFFFF`
- **Text:** Dark charcoal `#1E293B` & Muted grey `#64748B`
- **Icons:** Thin-line icons via `lucide-react-native`
- **Restrained Status Badges:** Green (Success / Open), Amber (Pending / Prep), Red (Danger / Closed)

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Expo CLI** (via `npx expo`)

### 2. Install Dependencies
```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies (if working with Cloud Functions)
cd ../backend/functions
npm install
cd ../..
```

### 3. Run the Mobile Application
```bash
# In the frontend directory:
cd frontend

# Start Expo development server (scan QR code with Expo Go on Android / iOS)
npm start

# Run on Android Emulator or connected USB device
npm run android

# Run on Web (for quick browser testing)
npm run web
```

---

## 🧪 Automated Testing

Both frontend and backend contain automated unit test suites covering the core business logic, cart invariants, token validation, and security rules:

```bash
# Run all tests
npm test

# Run frontend unit tests
npm run frontend:test

# Run backend security & state machine tests
npm run backend:test

# Run TypeScript typecheck
npm run frontend:typecheck
```

---

## 🔑 Demo Mode & Test Accounts

If live Firebase credentials are not yet configured in `.env`, the mobile application **automatically launches in zero-setup Local Demo Mode** with full offline persistence (`AsyncStorage`) and seed data.

You can instantly switch roles using the **top Demo Mode Banner** or on the **Sign In Screen**:

| Persona | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@marwadiuniversity.ac.in` | `demo123` | Sakshi Patel (Sem 8 CE) — Cart, Preorder, Pickup Token |
| **Faculty** | `faculty@marwadiuniversity.ac.in` | `demo123` | Prof. Rajesh Sharma — Access to Faculty Lounge (Floor 3) |
| **Operator** | `operator1@marwadiuniversity.ac.in` | `demo123` | Ramesh Bhai — Canteen 1 & 2 Kitchen Queue, Token Verification |
| **Operator 2** | `operator2@marwadiuniversity.ac.in` | `demo123` | Suresh Bhai — Canteen 3 & 4 |
| **Administrator** | `admin@marwadiuniversity.ac.in` | `demo123` | Campus Admin — Buildings, Roles, Settings, Audit Logs |

---

## 📁 Repository Structure

```
MU Canteen/
├── frontend/                     # React Native Mobile App (Expo SDK 58, React 19)
│   ├── src/
│   │   ├── config/               # Firebase client config & environment loaders
│   │   ├── theme/                # MU design tokens (Colors, Typography, Spacing)
│   │   ├── models/               # Strongly typed data models
│   │   ├── services/             # Live Firebase & DemoStorage engine
│   │   ├── context/              # AuthContext, CartContext, CampusContext
│   │   ├── navigation/           # React Navigation role navigators
│   │   ├── components/           # Reusable UI library (Card, Header, Badge, Modal, Input)
│   │   ├── views/                # Role screens (Student, Operator, Admin, Auth)
│   │   └── utils/                # Token generation, idempotency guards, INR formatters
│   ├── tests/                    # Frontend unit tests
│   ├── app.json                  # Android package configuration
│   └── package.json
├── backend/                      # Firebase Backend Resources
│   ├── firestore.rules           # Production security rules
│   ├── firestore.indexes.json    # Composite indexes
│   ├── firebase.json             # Firebase configuration
│   ├── functions/                # Cloud Functions (TypeScript)
│   ├── scripts/                  # Standalone campus seeding script
│   └── tests/                    # Backend security unit tests
├── docs/                         # Architecture, Firebase setup & demo guides
└── package.json                  # Root scripts & orchestrator
```

---

## 🔮 Roadmap: Review 2 Extensions

The codebase is modularly architected to accommodate Review 2 differentiating features without refactoring core Review 1 modules:
- [ ] **Automated Uncollected Order Resolution:** 10-minute timer expiration handling
- [ ] **₹10 Late-Fee Processing:** Automatic penalty calculation on uncollected preorders
- [ ] **Surplus Flash Sales:** Operator food-safety verification and 50%-off instant listings
- [ ] **Real Payment Gateway Integration:** Razorpay / Cashfree UPI & Card processing
- [ ] **Background Push Notifications:** FCM delay alerts & order ready buzzers

