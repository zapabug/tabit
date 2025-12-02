/**
 * Simple WebSocket Server for Tip Tab Development
 * 
 * This is a basic WebSocket server for development and testing.
 * For production, you would want a more robust solution with:
 * - Authentication
 * - Database persistence
 * - Load balancing
 * - Proper error handling
 * 
 * To run this server:
 * npm install ws
 * node server.js
 */

const WebSocket = require('ws');

const PORT = process.env.WS_PORT || 8080;

// Store connected clients
const clients = new Map();

// Store table sessions (in production, use a database)
const tableSessions = new Map();

// WebSocket server
const wss = new WebSocket.Server({ 
  port: PORT,
  path: '/ws'
});

console.log(`WebSocket server started on port ${PORT}`);

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  
  const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  clients.set(clientId, {
    ws,
    type: 'unknown',
    connectedAt: new Date()
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    timestamp: Date.now()
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message);
      handleMessage(clientId, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON format',
        timestamp: Date.now()
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(clientId);
  });
});

function handleMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'heartbeat':
      // Respond to heartbeat
      client.ws.send(JSON.stringify({
        type: 'heartbeat_response',
        timestamp: Date.now()
      }));
      break;

    case 'server_notification':
      handleServerNotification(clientId, message);
      break;

    case 'order_submitted':
      handleOrderSubmitted(clientId, message);
      break;

    case 'assistance_request':
      handleAssistanceRequest(clientId, message);
      break;

    case 'assistance_cleared':
      handleAssistanceCleared(clientId, message);
      break;

    case 'table_status_update':
      handleTableStatusUpdate(clientId, message);
      break;

    case 'payment_update':
      handlePaymentUpdate(clientId, message);
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

function handleServerNotification(clientId, message) {
  const { tableId, reason } = message;
  
  // Broadcast to all staff clients
  broadcastToStaff({
    type: 'server_notification',
    tableId,
    reason,
    timestamp: Date.now()
  });

  // Send confirmation back to sender
  const client = clients.get(clientId);
  if (client) {
    client.ws.send(JSON.stringify({
      type: 'notification_sent',
      tableId,
      reason,
      timestamp: Date.now()
    }));
  }
}

function handleOrderSubmitted(clientId, message) {
  const { tableId, order } = message;
  
  // Store order
  if (!tableSessions.has(tableId)) {
    tableSessions.set(tableId, {
      orders: [],
      status: 'active'
    });
  }
  
  const session = tableSessions.get(tableId);
  session.orders.push(order);
  session.lastOrder = Date.now();

  // Broadcast to all staff clients
  broadcastToStaff({
    type: 'order_submitted',
    tableId,
    order,
    timestamp: Date.now()
  });

  // Send confirmation back to sender
  const client = clients.get(clientId);
  if (client) {
    client.ws.send(JSON.stringify({
      type: 'order_received',
      orderId: order.id,
      timestamp: Date.now()
    }));
  }
}

function handleAssistanceRequest(clientId, message) {
  const { tableId, reason } = message;
  
  // Broadcast to all staff clients
  broadcastToStaff({
    type: 'assistance_request',
    tableId,
    reason,
    timestamp: Date.now()
  });
}

function handleAssistanceCleared(clientId, message) {
  const { tableId } = message;
  
  // Broadcast to all clients for this table
  broadcastToTable(tableId, {
    type: 'assistance_cleared',
    tableId,
    timestamp: Date.now()
  });
}

function handleTableStatusUpdate(clientId, message) {
  const { tableId, status, data } = message;
  
  // Update session
  if (!tableSessions.has(tableId)) {
    tableSessions.set(tableId, {});
  }
  
  const session = tableSessions.get(tableId);
  session.status = status;
  session.lastUpdate = Date.now();
  Object.assign(session, data);

  // Broadcast to all clients
  broadcast({
    type: 'table_status_update',
    tableId,
    status,
    data,
    timestamp: Date.now()
  }, { excludeClientId: clientId });
}

function handlePaymentUpdate(clientId, message) {
  const { tableId, paymentData } = message;
  
  // Broadcast to staff
  broadcastToStaff({
    type: 'payment_update',
    tableId,
    paymentData,
    timestamp: Date.now()
  });
}

function broadcast(message, options = {}) {
  const { excludeClientId } = options;
  
  clients.forEach((client, clientId) => {
    if (excludeClientId && clientId === excludeClientId) {
      return;
    }

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToStaff(message) {
  clients.forEach((client) => {
    // In a real implementation, you'd identify staff clients
    // For now, we'll broadcast to all clients except the sender
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToTable(tableId, message) {
  clients.forEach((client) => {
    // In a real implementation, you'd track which client belongs to which table
    // For now, we'll broadcast to all clients
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

// Clean up disconnected clients
setInterval(() => {
  clients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.CLOSED) {
      clients.delete(clientId);
    }
  });
}, 30000);

// Simulate some activity for testing
setInterval(() => {
  if (Math.random() > 0.8) { // 20% chance
    const tableId = Math.floor(Math.random() * 10) + 1;
    const reasons = ['customer_request', 'no_interaction', 'payment_help'];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    broadcastToStaff({
      type: 'server_notification',
      tableId,
      reason,
      timestamp: Date.now()
    });
    
    console.log(`Simulated assistance request for Table ${tableId}: ${reason}`);
  }
}, 30000); // Every 30 seconds

console.log('WebSocket server is running');
console.log(`Connect your app to: ws://localhost:${PORT}`);
console.log('The server will simulate some activity for testing purposes.');