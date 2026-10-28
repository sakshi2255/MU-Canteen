# Evaluation & Demo Mode Guide

MU Canteen includes a zero-configuration **Demo Mode** with realistic Marwadi University campus data.

---

## 1. Instant Demo Accounts

On the Login screen or through the top Demo Banner pill, you can immediately switch between four primary user personas:

| Role | Name & Email | Permissions & Accessible Features |
| :--- | :--- | :--- |
| **Student** | **Sakshi Patel**<br>`student@marwadiuniversity.ac.in` | Browse 8+ campus canteens, filter by floor, add to cart (single-canteen rule), place instant/preorders, accept 10-min grace policy, view live order progress & pickup tokens, cancel before prep. |
| **Faculty** | **Prof. Rajesh Sharma**<br>`faculty@marwadiuniversity.ac.in` | All student ordering capabilities + exclusive access to the **Faculty Executive Lounge (Main Bldg Floor 3)** which is locked for ordinary students. |
| **Operator 1** | **Ramesh Bhai**<br>`operator1@marwadiuniversity.ac.in` | Assigned to **Stationery & Quick Bites** (Floor 1) and **Central Campus Canteen** (Floor 2). Can toggle canteen Open/Close with menu availability check, accept/reject orders, advance status (Preparing, Ready), and verify pickup tokens. |
| **Operator 2** | **Suresh Bhai**<br>`operator2@marwadiuniversity.ac.in` | Assigned to **Faculty Executive Lounge** (Floor 3) and **South Indian Corner** (Floor 4). |
| **Administrator** | **Campus Admin Officer**<br>`admin@marwadiuniversity.ac.in` | Manage campus buildings, configure floors, add/edit canteens, set access restrictions (e.g. Faculty Only, Hostel Mess), assign operators, view user roles, edit policy text & grace periods, view security audit logs. |

---

## 2. Walkthrough: Key Evaluation Flows

### Flow A: Student Instant Order
1. Log in as **Sakshi Patel (Student)**.
2. Select **Canteen 1 (Stationery & Quick Bites)** on Main Building Floor 1.
3. Add an *Aloo Masala Puff* (₹25) and *Cutting Masala Tea* (₹15) to your cart.
4. Open Cart. Verify order type is **Instant Order**.
5. Proceed to Checkout. Choose **Simulated UPI**.
6. Place order. Note the generated **Pickup Token** (e.g., `MU-4892`).
7. Switch to **Ramesh Bhai (Operator)**. Open **Kitchen Order Queue**.
8. View incoming order -> Tap **Accept Order** -> Tap **Start Preparing** -> Tap **Mark Ready for Pickup**.
9. Tap **Verify Token** -> Enter `MU-4892` -> Tap **Verify & Handover Food**.
10. Verify order is marked `PICKED UP`. Attempting to enter the token a second time shows: *Duplicate pickup rejected*.

### Flow B: Student Preorder & Grace-Period Policy
1. Select **Canteen 2 (Central Campus Canteen)** on Main Building Floor 2.
2. Add a *Mumbai Veg Grilled Sandwich* (₹70) to your cart.
3. Open Cart. Switch order type to **Preorder**.
4. Choose a break pickup window: `12:45 PM - 01:00 PM`.
5. Tap **Proceed to Checkout**. The **Preorder & Pickup Policy Modal** opens explaining:
   - 10-minute grace period rule
   - Uncollected order policy
   - No campus delivery
   - Cancellation cutoff
   - Review 2 notice for late fees (₹10) and surplus flash sales
6. Check *"I have read and agree to the MU Canteen pickup policy"* and confirm.
7. Place preorder with **Cash at Counter** (status: `pending` payment).

### Flow C: Cancellation Cutoff Enforcement
1. While an order is in `awaiting_acceptance` or `accepted`, open **Live Order Tracking**.
2. Notice the button **"Request Cancellation"** is active.
3. If the operator moves the order to `preparing`, open tracking again: the cancellation button is disabled because kitchen cooking has already begun.

### Flow D: Operator Pre-Opening Availability Review
1. Log in as **Ramesh Bhai (Operator)**.
2. Toggle Canteen switch to **OPEN**.
3. Notice the mandatory **Availability Checklist Modal** appears before publishing opening status.
4. Toggle items Available or Sold Out (e.g. mark Samosas Sold Out) and tap **Confirm & Open**.
5. Students browsing the menu now see Samosas disabled with a **SOLD OUT** badge.

