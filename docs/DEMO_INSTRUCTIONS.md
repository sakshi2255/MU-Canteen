# Marwadi University — Canteen Evaluation & Demo Guide

This guide is designed for project evaluators and professors reviewing the **MU Canteen** application (Major Project Milestone Review 1).

---

## 1. Quick Start & Execution

### A. Zero-Configuration Local Demo Mode (Recommended for Fast Evaluation)
The mobile app is pre-configured with a complete, offline-persisted Local Demo Mode matching the Marwadi University campus:
```bash
# In the frontend directory:
cd frontend
npm install
npm start
```
- Open on Android device via Expo Go or run `npm run android`.
- No live Firebase keys are required; mock storage preserves state locally across reloads using `AsyncStorage`.

### B. Live Firebase Mode & Database Seeding
To run against a live Firebase project:
1. Populate `frontend/.env` with your Firebase web configuration (see `frontend/.env.example`).
2. Run the canonical database seeding script using the Firebase Admin SDK:
```bash
cd backend/functions
npm install

# Point to your downloaded Firebase Service Account JSON key:
# On Windows PowerShell:
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
npm run seed

# On Linux / macOS / Bash:
GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json" npm run seed
```
The idempotent script seeds:
- 3 Buildings (Main Academic Building, Faculty of Law Building, Campus Hostel Block A)
- 10 Canteens (9 MB canteens including Faculty Lounge + Law Canteen + Hostel Mess)
- 20+ authentic Indian menu items with dietary tags, preparation times, and prices in INR (₹)
- Standard university demo users (Student, Faculty, Operator, Administrator)
- University campus policies and grace period settings

---

## 2. Automated Test Verification

Both frontend and backend provide automated test suites covering all business logic, invariants, and security rules:

```bash
# 1. Frontend business logic & UI invariants (13/13 tests)
cd frontend
npm test

# 2. Frontend TypeScript typecheck (0 errors)
npm run typecheck

# 3. Backend security rules & operator state machine (7/7 tests)
cd ../backend/functions
npm test

# 4. Backend Cloud Functions build (0 errors)
npm run build
```

---

## 3. Demo Persona Switcher

Switch between personas instantaneously via the top Demo Mode banner or on the Sign In screen:

| Persona | Name & Email | Role & Key Capabilities |
| :--- | :--- | :--- |
| **Student** | **Sakshi Patel**<br>`student@marwadiuniversity.ac.in` | Browse 10 campus canteens, filter by floor, add to cart (single-canteen rule), place instant/preorders, accept 10-min grace policy, view live order progress & pickup tokens, cancel while in queue. |
| **Faculty** | **Prof. Rajesh Sharma**<br>`faculty@marwadiuniversity.ac.in` | All student ordering capabilities + exclusive access to the **Faculty Executive Lounge (Main Bldg Floor 3)** (restricted for students). |
| **Operator 1** | **Ramesh Bhai**<br>`operator1@marwadiuniversity.ac.in` | Assigned to **Stationery & Quick Bites** (Floor 1) and **Central Campus Canteen** (Floor 2). Manage canteen Open/Close, linear kitchen queue (`Accept → Ready → Collected`), counter pickup token verification. |
| **Operator 2** | **Suresh Bhai**<br>`operator2@marwadiuniversity.ac.in` | Assigned to **Faculty Executive Lounge** (Floor 3) and **South Indian Hub** (Floor 4). |
| **Administrator** | **Campus Admin Officer**<br>`admin@marwadiuniversity.ac.in` | Campus buildings and floor management, configure canteen types, assign operators, audit logs. |

---

## 4. Key Walkthrough Evaluation Flows

### Flow A: Student Instant Order & Linear Operator Queue
1. Log in as **Sakshi Patel (Student)**.
2. Under "Browse Canteens", select **Canteen 1 (Stationery & Quick Bites)** on Main Building Floor 1.
3. Add an *Aloo Masala Puff* (₹25) and *Cutting Masala Tea* (₹15) to your cart.
4. Open **My Cart**. Ensure order type is **Instant Order**.
5. Proceed to Checkout. Choose **Simulated UPI** (or Cash at Counter).
6. Confirm order. Note the generated **Pickup Token** (e.g. `MU-4892`).
7. Switch to **Ramesh Bhai (Operator)**. Tap **Order Queue** on the operator dashboard.
8. **In Queue Stage**: Observe incoming order with buttons **[Accept]** and **[Decline]**.
9. Tap **[Accept]**: The order transitions directly into **Preparing** (no redundant extra button).
10. **Preparing Stage**: Observe the single button **[Ready]**. Tap **[Ready]**.
11. **Ready Stage**: The order moves to Ready for Pickup with the single button **[Collected]**.
12. Tap **[Collected]**: A token verification dialog opens. Enter `MU-4892` and confirm.
13. The order transitions to **Picked Up**. Re-entering the token is rejected as duplicate collection.

### Flow B: Student Preorder & Policy Acceptance
1. Select **Canteen 2 (Central Campus Canteen)** on Main Building Floor 2.
2. Add a *Mumbai Veg Grilled Sandwich* (₹70) to your cart.
3. In Cart, toggle order type to **Preorder**.
4. Select a slot (e.g. `12:45 PM - 01:00 PM`).
5. Tap **Proceed to Checkout**. The **Preorder & Pickup Policy Modal** opens:
   - Explains the 10-minute collection window after pickup time.
   - Explains that uncollected food will be discarded and a ₹10 fee may apply.
   - Notice the **[Accept & Continue]** button is disabled.
6. Check the mandatory acceptance checkbox. **[Accept & Continue]** becomes active.
7. Tap **[Accept & Continue]** to proceed, or tap **[Decline]** to revert to an Instant Order without reserving the slot.

### Flow C: Cancellation Cutoff Enforcement
1. Place an order as a student.
2. While the order is still **In Queue** (`awaiting_acceptance`), open **Current Orders** -> **Track Order**.
3. Notice the **Request Cancellation** option is active.
4. Once the operator taps **[Accept]** (moving the order into **Preparing**), open tracking again: cancellation is strictly locked and cannot be cancelled because kitchen cooking has already begun.

### Flow D: Operator Pre-Opening Availability Review
1. Log in as **Ramesh Bhai (Operator)**.
2. Toggle the Canteen switch to **OPEN**.
3. Notice the mandatory **Availability Checklist Modal** appears before publishing opening status.
4. Toggle items Available or Sold Out (e.g. mark Samosas Sold Out) and tap **Confirm & Open**.
5. Students browsing the menu immediately see Samosas disabled with a **SOLD OUT** badge.
