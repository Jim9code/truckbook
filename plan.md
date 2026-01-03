# TruckBooks – Frontend Implementation Plan

## Overview
TruckBooks is a B2B logistics operations web application designed to help logistics business owners track:
- Trips
- Payments
- Costs
- Profit or loss per trip
- Truck performance
- Outstanding customer balances

The frontend must be **clean, minimal, and operator-focused**, prioritizing clarity over visual flair.

This document is the **single source of truth** for frontend structure, data placement, and user flow.

> NOTE:
> UI screenshots from Google Stitch will be provided as visual guidance.
> The screenshots may contain mistakes, extra elements, or misaligned data.
> **Always prioritize the rules and data definitions in this document over screenshots**, while maintaining the same overall UI/UX style.

---

## Core Design Principles

- B2B / accounting-style interface
- Minimal UI, low visual noise
- Table-first layouts
- Form-first workflows
- Desktop-first, mobile responsive
- No animations or marketing visuals
- One accent color (green for profit, red for loss)
- Readability > aesthetics

This is **operations software**, not a consumer app.

---

## Tech Assumptions (Frontend)

- Web application (not native mobile)
- PWA-ready later, but NOT required for MVP
- Auth-based access
- Single company per account (for MVP)

---

## Application Structure

### Global Layout
- Top navigation or left sidebar with:
  - Trips
  - Trucks
  - Outstanding Payments
  - Logout
- No deep nesting
- No hidden menus

---

## Screen List (MVP – FINAL)

1. Signup
2. Login
3. Subscription / Paywall
4. Trips Dashboard (Main screen)
5. Add / Edit Trip
6. Trucks
7. Outstanding Payments

No other screens should be implemented in MVP.

---

## Screen-by-Screen Details

---

### 1. Signup Screen

**Purpose**
Create a new company admin account.

**Fields**
- Company Name
- Full Name
- Email
- Password
- Confirm Password

**Behavior**
- On successful signup → redirect to Subscription screen
- No dashboard access without subscription

**UI Notes**
- Minimal form
- No illustrations
- No testimonials

---

### 2. Login Screen

**Purpose**
Authenticate existing users.

**Fields**
- Email
- Password

**Behavior**
- If subscription inactive → redirect to Paywall
- If active → redirect to Trips Dashboard

---

### 3. Subscription / Paywall Screen

**Purpose**
Convert users to paid customers before app usage.

**Plans**
1. Starter – ₦39,000 / month
2. Large Fleet – ₦99,000 / month (highlighted / recommended)

**Content**
- Plan name
- Price
- Short list of included benefits
- Subscribe button

**Behavior**
- Successful payment → access granted → redirect to Trips Dashboard
- No access to app without active subscription

**UI Notes**
- Trustworthy
- Simple
- No feature overload

---

### 4. Trips Dashboard (MAIN SCREEN)

**Purpose**
Show profit or loss per trip and overall operational visibility.

This is the **home screen** after login.

#### Summary Cards (Top)
- Total Revenue (selected period)
- Total Profit (selected period)
- Active / Pending Trips

These are optional but must not overwhelm the table.

---

#### Trips Table (Core Element)

**Columns**
- Date
- Truck
- Driver
- Customer
- Route (From → To)
- Agreed Price
- Total Cost
- Profit / Loss
- Status (Pending / Completed)

**Rules**
- Profit = Total Received – Total Cost
- Profit shown in green
- Loss shown in red
- Values auto-calculated

---

#### Actions
- “Add Trip” button (primary CTA)
- Filters:
  - Date range
  - Truck
  - Driver
  - Status

---

### 5. Add / Edit Trip Screen

**Purpose**
Record a complete trip with all financial data.

This must be a **single-page form** (no multi-step wizard).

---

#### Sections

##### A. Basic Information
- Trip Date
- Truck (dropdown)
- Driver (dropdown)
- Customer (dropdown)
- Route (From)
- Route (To)
- Status (Pending / Completed)

---

##### B. Payment Details
- Agreed Transport Price
- Payment Type:
  - Full payment before trip
  - Part payment before trip
- Amount Received Before Trip
- Amount Received After Delivery

---

##### C. Operational Costs
- Fuel Cost
- Maintenance / Repair Cost
- Other Costs (optional)

---

##### D. Notes (Optional)
- Free text notes

---

##### E. Auto Summary (Read-only)
- Total Cost
- Total Received
- Net Profit / Loss

These values update live as the form is filled.

---

**Actions**
- Save Trip
- Cancel

---

### 6. Trucks Screen

**Purpose**
Show performance per truck.

---

**Table Columns**
- Truck Name / Plate Number
- Total Trips
- Total Revenue
- Total Cost
- Net Profit

---

**Behavior**
- Clicking a truck filters trips related to that truck
- No editing here, read-only summary

---

### 7. Outstanding Payments Screen

**Purpose**
Track unpaid balances clearly.

This screen must feel **urgent and clear**.

---

**Table Columns**
- Customer
- Trip Reference
- Total Agreed Price
- Amount Paid
- Balance Owed
- Days Outstanding

---

### 8. TB WhatsApp Clerk (Large Fleet Plan - Coming Soon)

**Purpose**
Allow logistics business owners to use WhatsApp to record trips, payments, expenses, and maintenance without opening the dashboard.

**Core Goals**
- Zero learning curve for logistics owners
- Reduce forgotten records
- Make TruckBooks usable even by non-technical users
- Strong differentiation vs other fleet/logistics software

**How it Works**
- User connects their WhatsApp number during onboarding (Large Fleet plan only)
- WhatsApp messages are sent to a webhook on our backend
- The system maintains conversation state per user (simple step-by-step flow)
- Each completed flow creates or updates records in TruckBooks
- All WhatsApp-created records appear instantly in the web dashboard

**MVP WhatsApp Commands & Flows**

1. **Create Trip**
   - Trigger: "new trip"
   - Ask sequentially: Truck, Pickup location, Destination, Trip amount, Payment status (none / half / full)
   - Save: Trip record, Outstanding balance if any

2. **Record Payment**
   - Trigger: "record payment"
   - Ask: Trip or customer, Amount paid
   - Update outstanding balance

3. **Record Expense**
   - Trigger: "add expense"
   - Ask: Truck, Expense type (fuel, repair, toll, other), Amount
   - Attach expense to truck and/or trip

4. **Maintenance Log**
   - Trigger: "maintenance"
   - Ask: Truck, Issue, Cost
   - Save maintenance record

5. **Quick Summary**
   - Trigger: "summary"
   - Respond with: Profit this week/month, Outstanding payments, Trucks with high expenses

**Data Rules**
- All WhatsApp-created records must appear instantly in the web dashboard
- Profit per trip = income – expenses
- Payment states must handle: Half paid, Fully paid, Outstanding

**UI & Plan Logic**
- TB WhatsApp Clerk is only available on the Large Fleet plan (₦99k)
- Starter plan users should see this feature as locked with an upgrade CTA
- Dashboard should show a "WhatsApp Connected" status

**Important Notes**
- WhatsApp UX should feel simple, friendly, and non-technical
- Do not overcomplicate with AI in MVP; structured step-by-step flows are enough
- UI must reflect data accuracy over fancy visuals

---

## Data Consistency Rules

- All money values must use the same currency format
- Profit/Loss must always be auto-calculated
- No manual profit input anywhere
- Tables must be sortable
- Empty states should be simple text (no illustrations)

---

## Relationship Between Screens

- Signup → Paywall → Trips
- Login → (Paywall if unpaid) → Trips
- Trips → Add/Edit Trip
- Trips → Trucks
- Trips → Outstanding Payments

No circular or confusing navigation.

---

## About the Design Screenshots (IMPORTANT)

- Screenshots from Google Stitch are **visual guidance only**
- They define spacing, layout feel, and UI tone
- They may include:
  - Wrong fields
  - Extra fields
  - Misplaced data
- **Always follow this document for data correctness**
- UI should feel similar, but logic must follow this plan

---

## Non-Goals (DO NOT IMPLEMENT)

- GPS tracking
- Driver mobile app
- Load marketplace
- Notifications
- AI features
- Charts-heavy dashboards
- Multi-company switching

These are explicitly out of scope.

---

## Success Criteria for Frontend MVP

- A logistics operator can:
  - Record trips without confusion
  - Clearly see profit or loss per trip
  - Know who owes money
  - Understand which trucks make money

If this is achieved, the frontend is successful.

---

## Final Note

This frontend is designed to support **real logistics operations**, not demos.

Clarity, accuracy, and speed matter more than visuals.

Follow this plan strictly.
