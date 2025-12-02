# Tab-IT - Streamlined Table Service

## Overview
Tab-IT is a web-based solution designed to optimize restaurant service by allowing customers to open a tab, order directly from their table, and pay seamlessly. It integrates QR/NFC-based table interaction, real-time order notifications for staff, and optional Lightning payments while ensuring restaurants can continue using their existing POS systems.

## 🌑 Nostr Integration

Each Tab-IT restaurant generates its own Nostr keypair for:
- **Receiving table orders** via Nostr events (kind 30000)
- **Processing Lightning payments** through unique order IDs
- **Real-time synchronization** across multiple devices
- **Decentralized order management** without server dependency

### Nostr Key Management
- **Private Key (nsec)**: Securely stored for receiving orders
- **Public Key (npub)**: Shared with customers for restaurant discovery
- **Event Types**: Orders (30000), Assistance (30001), Payments (30002)
- **Restaurant Isolation**: Each restaurant only listens to its own QR-generated table events

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

### 6. Staff Dashboard
- **Real-time Table Management**: View all table statuses at a glance
- **Live Notifications**: Receive instant alerts for new orders and assistance requests
- **Order Tracking**: Monitor order status and payment confirmations
- **Table Control**: Clear tables, mark assistance complete, manage sessions
- **WebSocket Integration**: Real-time updates without page refresh

### 7. Lightning Payment Integration
- **LNBits Integration**: Full Lightning Network support via LNBits
- **Real-time Payment Processing**: Instant payment confirmation and QR code generation
- **ZapSplits Support**: Automatic tip distribution to staff (configurable)
- **Payment Status Tracking**: Complete payment lifecycle monitoring
- **Fallback Support**: Development mode with simulated payments

## Quick Start

### For Development
1. Clone and install: `npm install`
2. Copy environment: `cp .env.example .env`
3. Configure your LNBits settings in `.env`
4. Start WebSocket server: `node server.js` (optional for testing)
5. Run app: `npm run dev`

### For Customers
1. Scan QR code or visit `/table/{tableId}`
2. Browse the menu and select items
3. Choose payment method (Lightning or Pay Later)
4. For Lightning: Scan QR code with your wallet

### For Staff
1. Visit `/staff` to access the dashboard
2. Monitor real-time table status
3. Receive notifications for orders and assistance
4. Manage table sessions and payments

## Configuration

### LNBits Setup
```bash
# Install LNBits plugins:
- zapsplits (auto tips)
- Cashu extension (for staff wallets)
- Webhooks (payment notifications)
```

Configure webhooks to auto-send zaps to staff npubs when payments are complete.

## Roadmap
- [✔️] Implement QR/NFC scanning
- [✔️] Develop a basic ordering system
- [✔️] Integrate WebSockets for live notifications
- [✔️] Implement Lightning payment processing
- [✔️] Add admin/staff dashboard
- [ ] Implement LNBits ZapSplits integration
- [ ] Add Nostr social posting integration
- [ ] Multi-restaurant support
- [ ] Advanced analytics and reporting

## Contributing
We welcome contributions! Feel free to open issues or submit pull requests.

## License
Tab-IT
