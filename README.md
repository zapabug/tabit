# Tip Tab - Streamlined Table Service

## Overview
Tip Tab is a web-based solution designed to optimize restaurant service by allowing customers to open a tab, order directly from their table, and pay seamlessly. It integrates QR/NFC-based table interaction, real-time order notifications for staff, and optional Lightning payments while ensuring restaurants can continue using their existing POS systems.

## Features
### 1. QR/NFC Table Interaction
- Customers scan a QR code or tap an NFC tag to access their table session (e.g., `www.tiptab.app/table3`).
- A **1-minute timer** starts—if no order is placed, staff gets a notification that a new customer interacted with the table.

### 2. Mobile-Friendly Web App (No Installation Required)
- Displays a **digital menu** with live updates.
- Customers **place orders** directly through the web app, notifying staff without requiring a trip to take orders manually.

### 3. Payment Flexibility
- Customers can choose:
  - **Pay Now (Lightning Payment)** – Immediate checkout, auto-closing the tab.
  - **Pay Later (Card/Cash via Server)** – Server processes payment through the restaurant’s existing POS; they must manually close the tab.

### 4. Smart Tab & Timer System
- **Timer resets to 1 hour** when an order is placed.
- If no payment is made and a new customer scans the QR/NFC, they **see the previous session but can clear it**.
- Notifies staff when a table is reopened or remains inactive for too long.

### 5. Optional Social Media Integration
- If Lightning is used for payment, an optional **Nostr social post** can be triggered (anonymous unless the customer opts in).

## Tech Stack
### Frontend
- **React.js** – For a responsive and mobile-friendly UI
- **TailwindCSS** – For clean and efficient styling
- **QR/NFC Web API** – To handle customer interactions

### Backend
- **Node.js + Express.js** – API server for managing orders and notifications
- **Firebase Firestore** – Real-time session tracking
- **WebSockets** – Live notifications for staff

### Payments
- **BTCPay Server / LNbits** – For Lightning payments
- **Standard POS Workflow** – Works alongside existing restaurant POS systems

## Installation & Setup
1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/tip-tab.git
   cd tip-tab
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Setup Firebase & Environment Variables:**
   - Create a Firebase project and Firestore database.
   - Set up a `.env` file with API keys.
4. **Run the development server:**
   ```sh
   npm start
   ```

## Roadmap
- [ ] Implement QR/NFC scanning
- [ ] Develop a basic ordering system
- [ ] Integrate WebSockets for live notifications
- [ ] Implement Lightning payment processing
- [ ] Add admin/staff dashboard

## Contributing
We welcome contributions! Feel free to open issues or submit pull requests.

## License
MIT License

