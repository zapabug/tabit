# Tip Tab Setup Guide

## Overview
Tip Tab is a complete restaurant table service solution with QR/NFC interaction, real-time ordering, Lightning payments, and staff management.

## Prerequisites
- Node.js 16+ and npm
- LNBits instance (for Lightning payments)
- WebSocket server (for real-time notifications)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# LNBits Configuration
REACT_APP_LNBITS_URL=https://your-lnbits-instance.com
REACT_APP_LNBITS_ADMIN_KEY=your_admin_key_here
REACT_APP_LNBITS_INVOICE_KEY=your_invoice_read_key_here

# ZapSplits Configuration  
REACT_APP_ZAPSPLITS_ENABLED=true

# WebSocket Configuration
REACT_APP_WEBSOCKET_URL=ws://localhost:8080

# App Configuration
REACT_APP_RESTAURANT_NAME=Casa da Levada
REACT_APP_CURRENCY=EUR
REACT_APP_SAT_PER_EUR=100
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Configuration

### LNBits Setup

1. **Install LNBits**: Follow the [LNBits installation guide](https://github.com/lnbits/lnbits)

2. **Create Wallet**: Create a wallet for your restaurant

3. **Get API Keys**: 
   - Go to your wallet settings
   - Copy the "Admin Key" and "Invoice Read Key"
   - Add them to your `.env` file

4. **Enable Extensions**:
   - **ZapSplits**: For automatic tip distribution to staff
   - **Webhooks**: For payment notifications
   - **LNURLPay**: For Lightning addresses

### WebSocket Server Setup

The app includes a WebSocket service for real-time communication. You'll need a WebSocket server that handles:

- `server_notification` - Customer assistance requests
- `order_submitted` - New orders from tables  
- `payment_update` - Payment status updates
- `assistance_request` - Help requests
- `table_status_update` - Table status changes

### ZapSplits Configuration

For automatic tip distribution:

1. Enable ZapSplits extension in LNBits
2. Configure staff wallet addresses or npubs
3. Set tip distribution percentages

## Feature Usage

### Customer Experience

1. **Access Table**: Scan QR code or NFC tag to go to `/table/{tableId}`
2. **Browse Menu**: View items with translations
3. **Place Order**: Select items and choose payment method
4. **Pay with Lightning**: Scan QR code with Lightning wallet
5. **Request Assistance**: Use the assistance button

### Staff Experience

1. **Access Dashboard**: Go to `/staff`
2. **Monitor Tables**: View real-time table status
3. **Receive Notifications**: Get alerts for orders and assistance
4. **Manage Tables**: Clear tables, mark assistance complete
5. **View Orders**: See order details and payment status

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Menu.jsx        # Main menu component
│   ├── PaymentModal.jsx # Payment processing modal
│   └── Navigation.jsx  # App navigation
├── context/            # React context providers
│   └── TableSessionContext.jsx  # Table session state
├── pages/              # Page components
│   ├── TableView.jsx   # Customer table view
│   └── StaffDashboard.jsx  # Staff dashboard
├── services/           # External service integrations
│   ├── websocketService.js   # WebSocket client
│   └── lightningService.js   # Lightning/LNBits integration
└── App.jsx            # Main app component with routing
```

### Adding New Features

1. **Menu Items**: Edit `MENU_ITEMS` array in `Menu.jsx`
2. **Translations**: Add to `TRANSLATIONS` object in `Menu.jsx`
3. **WebSocket Events**: Add handlers in `websocketService.js`
4. **Payment Methods**: Extend `lightningService.js`

### Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## Production Deployment

### Build the App
```bash
npm run build
```

### Deploy to Static Hosting
The `dist/` folder contains the built application that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

### WebSocket Server for Production
For production, you'll need:
- Persistent WebSocket server (Node.js with `ws` library)
- Database for storing orders and sessions
- HTTPS/WSS for secure connections
- Load balancing for scalability

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check `REACT_APP_WEBSOCKET_URL` is correct
   - Ensure WebSocket server is running
   - Check firewall/network settings

2. **LNBits Invoice Generation Failed**
   - Verify LNBits URL is accessible
   - Check API keys are correct and have proper permissions
   - Ensure wallet has sufficient balance

3. **Payment Not Confirming**
   - Check LNBits webhook configuration
   - Verify payment was actually sent
   - Check LNBits logs for errors

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
REACT_APP_DEBUG=true
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Configure LNBits to allow your app's domain
3. **Rate Limiting**: Implement rate limiting on WebSocket server
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Always use HTTPS in production

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check LNBits and WebSocket server logs
4. Open an issue on the GitHub repository

## License

Tab-IT License - See LICENSE file for details.