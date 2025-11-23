# 📱 Student Expense Tracker  
*A React Native + Expo + SQLite mobile app for tracking and analyzing expenses.*

---

## 🚀 Overview
This mobile app lets students record expenses, filter them by date range, and view total spending analytics.  
All data is stored **locally** on-device using SQLite through `expo-sqlite`.

---

## 📦 Features
- Add expenses with **amount, category, note, and date**
- Filter expenses by:
  - **All**
  - **This Week**
  - **This Month**
- Automatic calculations:
  - **Total spending** (per active filter)
  - **Category-wise spending totals**
- Edit existing expenses using a SQLite `UPDATE`
- Delete expenses
- Persistent storage (data remains after app restarts)

---

## ▶️ How to Run the App

## **Requirements**
- Node.js + npm  
- Expo CLI → `npm install -g expo-cli`  
- macOS with Xcode installed (required for **iOS Simulator**)  

---

## **Installation**
```bash
npm install
npx expo start
📱 Expo Go (Physical Device)
	•	This app can run on real devices, but during development, Expo Go sometimes showed “Internet offline” depending on network restrictions.

🖥️ iOS Simulator (Recommended)
	•	Works perfectly without network issues
	•	From Expo CLI: i (press i key to launch simulator)
  ```

  ## 📊 Analytics Included
  `
	•	Total spending dynamically updates based on filter
	•	Spending by category
	•	All totals update when:
	•	New expenses are added
	•	Expenses are edited
	•	Expenses are deleted
	•	Filters change

### ✏️ Editing Expenses
`
	•	Tap an existing expense row
	•	The form auto-fills with the expense data
	•	Modify any fields
	•	Press Save Changes
	•	Under the hood, the app executes:
UPDATE expenses
SET amount = ?, category = ?, note = ?, date = ?
WHERE id = ?;

### 🐞 Known Issues / Limitations
`
	•	Date input uses a plain text field (no date-picker UI)
	•	Category totals are based on user-entered strings
	•	e.g., Food and food count as two categories
	•	Weekly filter uses last 7 days, not the official calendar week
	•	No highlight on “currently editing” item
	•	No validation for invalid date formats (e.g., “abc123”)

### 👨‍💻 Technology Used
`
	•	React Native
	•	Expo
	•	SQLite via expo-sqlite
	•	JavaScript (no TypeScript)

```bash
Author: Sean Cooper
University of South Florida
```
