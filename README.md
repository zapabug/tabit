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

set up LNBits instance
enable lnbits plugins:
    zapsplits (auto tips)
    Cashu extension (for staff wallets)
Configure webhooks auto spend zaps to satff npubs

## Roadmap
- [✔️] Implement QR/NFC scanning 
- [ ] Develop a basic ordering system
- [ ] Integrate WebSockets for live notifications
- [ ] Implement Lightning payment processing
- [ ] Add admin/staff dashboard

## Contributing
We welcome contributions! Feel free to open issues or submit pull requests.

## License
Tab-IT
