# Tip Tab Demo Guide

## 🚀 Quick Demo Setup

### 1. Start the Application

For development with full WebSocket support:
```bash
npm run dev:full
```

Or just the frontend:
```bash
npm run dev
```

### 2. Test Different User Experiences

#### Customer Experience
1. Visit `http://localhost:5173/table/1` (Table 1)
2. Browse the menu items in different categories
3. Add items to your order using the + button
4. Click "Place Order" when ready
5. Choose payment method:
   - **Lightning**: Scan QR code (simulated in development)
   - **Pay Later**: Order will be marked as awaiting payment

#### Staff Experience
1. Visit `http://localhost:5173/staff`
2. Monitor real-time table statuses
3. Receive notifications for:
   - New customer interactions (1-minute timer)
   - Assistance requests
   - New orders with payment details
4. Manage tables:
   - Mark assistance complete
   - Clear tables when customers leave

#### QR Code Generation
1. Visit `http://localhost:5173/qr-generator`
2. Configure base URL and table numbers
3. Generate downloadable QR codes for each table
4. Print and place on restaurant tables

## 🎯 Key Features to Test

### 1. Real-time Notifications
- Open both customer and staff views in different tabs
- Place an order and watch it appear instantly on staff dashboard
- Request assistance and see the alert on staff side

### 2. Timer System
- Access a table without ordering
- After 1 minute, staff should get "no activity" notification
- Place an order to reset timer to 1 hour

### 3. Payment Processing
- Test Lightning payment flow (simulated in development)
- Verify order status updates properly
- Check that "Pay Later" orders show as "awaiting payment"

### 4. Mobile Responsiveness
- Test on mobile device viewport
- Verify touch interactions work properly
- Check navigation menu on small screens

### 5. Multi-language Support
- Menu supports English, Portuguese, Spanish, German, and French
- Browser language detection
- Test different language display

## 🔧 Configuration Options

### Environment Variables (.env)
```env
# LNBits Configuration
VITE_LNBITS_URL=https://your-lnbits-instance.com
VITE_LNBITS_ADMIN_KEY=your_admin_key_here
VITE_LNBITS_INVOICE_KEY=your_invoice_read_key_here

# Features
VITE_ZAPSPLITS_ENABLED=true

# WebSocket
VITE_WEBSOCKET_URL=ws://localhost:8080
```

### Menu Customization
Edit `src/components/Menu.jsx`:
- Add/modify `MENU_ITEMS` array
- Update `TRANSLATIONS` object for new languages
- Adjust categories and pricing

### Restaurant Branding
- Update restaurant name in components
- Modify colors via Tailwind CSS classes
- Add logo to navigation component

## 🎨 Design Features

### Visual Elements
- **Dark theme** for customer menu (restaurant ambiance)
- **Light theme** for staff dashboard (professional interface)
- **Real-time indicators** (pulsing alerts, live timers)
- **Touch-optimized** buttons and interactions
- **Responsive design** for all screen sizes

### User Experience
- **Progressive disclosure** - only show relevant information
- **Immediate feedback** - instant visual responses to actions
- **Graceful fallbacks** - works without WebSocket/LNBits
- **Accessibility** - proper ARIA labels and keyboard navigation

## 🚀 Production Deployment

### Static Hosting
The app builds to static files in `dist/`:
- Deploy to Netlify, Vercel, GitHub Pages, etc.
- No server required for frontend
- WebSocket server runs separately

### WebSocket Server
For production, you'll need:
```bash
node server.js  # Basic development server
```

Production-ready WebSocket server should include:
- Authentication
- Database persistence
- Load balancing
- Error handling
- Monitoring

### LNBits Integration
For real Lightning payments:
1. Set up LNBits instance
2. Configure API keys in environment
3. Set up webhooks for payment notifications
4. Enable ZapSplits for tip distribution

## 🔍 Troubleshooting

### Common Issues
1. **WebSocket not connecting**: Check server is running on correct port
2. **LNBits errors**: Verify API keys and URL configuration
3. **Build fails**: Check for TypeScript errors or missing dependencies
4. **QR codes not working**: Ensure base URL is correct for your deployment

### Debug Mode
Add to `.env`:
```env
VITE_DEBUG=true
```

This enables additional console logging for troubleshooting.

## 📱 Mobile Testing Tips

1. Use browser developer tools to test mobile viewports
2. Test touch interactions on actual devices
3. Verify QR codes scan correctly with phone cameras
4. Check performance on slower connections

## 🎯 Demo Script

### Restaurant Owner Demo
1. "Let me show you how easy it is to set up" (QR Generator)
2. "Customers scan this QR code" (Table View)
3. "They can browse our menu in multiple languages" (Menu)
4. "Orders appear instantly on your dashboard" (Staff Dashboard)
5. "You receive Lightning payments with automatic tips" (Payment)

### Staff Training Demo
1. "This is your dashboard - shows all table status"
2. "You get real-time notifications for assistance"
3. "New orders appear here with payment details"
4. "You can clear tables when customers leave"
5. "The system works even if internet is temporarily down"

---

**Ready to transform your restaurant service!** 🚀