import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import websocketService from '../services/websocketService';
import Navigation from '../components/Navigation';

// Mock data for demonstration - in real app, this would come from WebSocket/API
const mockTableSessions = [
  {
    tableId: '1',
    status: 'active',
    customerCount: 2,
    timeElapsed: 15,
    hasOrder: false,
    needsAssistance: false,
    lastActivity: new Date(),
    selectedItems: []
  },
  {
    tableId: '2',
    status: 'active',
    customerCount: 4,
    timeElapsed: 45,
    hasOrder: true,
    needsAssistance: true,
    assistanceReason: 'customer_request',
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    orders: [
      {
        id: 1,
        items: [
          { name: 'Super Bock', quantity: 2, price: 1.50 },
          { name: 'Poncha de Tangerina', quantity: 1, price: 4.00 }
        ],
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'awaiting_payment',
        total: 7.00
      }
    ]
  },
  {
    tableId: '3',
    status: 'inactive',
    customerCount: 0,
    timeElapsed: 0,
    hasOrder: false,
    needsAssistance: false,
    lastActivity: new Date(Date.now() - 60 * 60 * 1000),
    selectedItems: []
  }
];

export default function StaffDashboard() {
  const [tableSessions, setTableSessions] = useState(mockTableSessions);
  const [selectedTable, setSelectedTable] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  // Initialize WebSocket connection and set up listeners
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect()
      .catch(error => {
        console.log('WebSocket connection failed, running in demo mode:', error);
        // Fall back to simulation mode if WebSocket fails
      });

    // Set up WebSocket event listeners
    const handleServerNotification = (data) => {
      setTableSessions(prev => prev.map(table => {
        if (table.tableId === data.tableId) {
          const updatedTable = { ...table };
          updatedTable.needsAssistance = true;
          updatedTable.assistanceReason = data.reason;
          updatedTable.lastActivity = new Date(data.timestamp);

          addNotification(`Table ${data.tableId} needs assistance - ${data.reason}`);
          return updatedTable;
        }
        return table;
      }));
    };

    const handleOrderSubmitted = (data) => {
      setTableSessions(prev => prev.map(table => {
        if (table.tableId === data.tableId) {
          const updatedTable = { ...table };
          updatedTable.hasOrder = true;
          updatedTable.orders = [...(updatedTable.orders || []), data.order];
          updatedTable.lastActivity = new Date(data.timestamp);

          const total = data.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          addNotification(`New order at Table ${data.tableId} - €${total.toFixed(2)}`);
          return updatedTable;
        }
        return table;
      }));
    };

    const handlePaymentUpdate = (data) => {
      setTableSessions(prev => prev.map(table => {
        if (table.tableId === data.tableId) {
          const updatedTable = { ...table };
          if (updatedTable.orders) {
            updatedTable.orders = updatedTable.orders.map(order =>
              order.id === data.paymentData.orderId
                ? { ...order, ...data.paymentData }
                : order
            );
          }

          const statusText = data.paymentData.status === 'paid' ? 'Paid' : 'Awaiting Payment';
          addNotification(`Payment update: Table ${data.tableId} Order #${data.paymentData.orderId} - ${statusText}`);
          return updatedTable;
        }
        return table;
      }));
    };

    const handleAssistanceRequest = (data) => {
      setTableSessions(prev => prev.map(table => {
        if (table.tableId === data.tableId) {
          const updatedTable = { ...table };
          updatedTable.needsAssistance = true;
          updatedTable.assistanceReason = data.reason;
          updatedTable.lastActivity = new Date(data.timestamp);

          addNotification(`Assistance requested at Table ${data.tableId} - ${data.reason}`);
          return updatedTable;
        }
        return table;
      }));
    };

    // Register WebSocket listeners
    websocketService.on('server_notification', handleServerNotification);
    websocketService.on('order_submitted', handleOrderSubmitted);
    websocketService.on('payment_update', handlePaymentUpdate);
    websocketService.on('assistance_request', handleAssistanceRequest);

    return () => {
      // Clean up listeners
      websocketService.off('server_notification', handleServerNotification);
      websocketService.off('order_submitted', handleOrderSubmitted);
      websocketService.off('payment_update', handlePaymentUpdate);
      websocketService.off('assistance_request', handleAssistanceRequest);
    };
  }, []);

  // Fallback simulation for when WebSocket is not connected
  useEffect(() => {
    if (!autoRefresh || websocketService.isConnected()) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setTableSessions(prev => prev.map(table => {
        if (table.status === 'active') {
          const updatedTable = { ...table };
          updatedTable.timeElapsed = Math.floor((Date.now() - updatedTable.lastActivity.getTime()) / 60000);

          // Simulate assistance notification after 1 minute of inactivity
          if (!table.hasOrder && table.timeElapsed > 1 && !table.needsAssistance) {
            updatedTable.needsAssistance = true;
            updatedTable.assistanceReason = 'no_interaction';
            addNotification(`Table ${table.tableId} needs assistance - No activity for ${table.timeElapsed} minutes`);
          }

          return updatedTable;
        }
        return table;
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const addNotification = useCallback((message) => {
    const notification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);

    // Remove notification after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  }, []);

  const clearTable = useCallback((tableId) => {
    setTableSessions(prev => prev.map(table =>
      table.tableId === tableId
        ? { ...table, status: 'inactive', hasOrder: false, needsAssistance: false, orders: [], selectedItems: [] }
        : table
    ));

    // Send table cleared notification via WebSocket
    if (websocketService.isConnected()) {
      websocketService.updateTableStatus(tableId, 'cleared');
    }

    addNotification(`Table ${tableId} cleared`);
  }, [addNotification]);

  const markAssistanceComplete = useCallback((tableId) => {
    setTableSessions(prev => prev.map(table =>
      table.tableId === tableId
        ? { ...table, needsAssistance: false, assistanceReason: '' }
        : table
    ));

    // Send assistance cleared notification via WebSocket
    if (websocketService.isConnected()) {
      websocketService.clearAssistance(tableId);
    }

    addNotification(`Assistance completed for Table ${tableId}`);
  }, [addNotification]);

  const simulateNewCustomer = useCallback((tableId) => {
    const newSession = {
      tableId,
      status: 'active',
      customerCount: Math.floor(Math.random() * 4) + 1,
      timeElapsed: 0,
      hasOrder: false,
      needsAssistance: false,
      lastActivity: new Date(),
      selectedItems: []
    };

    setTableSessions(prev => {
      const filtered = prev.filter(t => t.tableId !== tableId);
      return [...filtered, newSession];
    });

    addNotification(`New customer at Table ${tableId}`);
  }, [addNotification]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (table) => {
    if (table.needsAssistance) return 'bg-red-100 border-red-300 text-red-800';
    if (table.status === 'inactive') return 'bg-gray-100 border-gray-300 text-gray-600';
    if (table.hasOrder) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const getStatusText = (table) => {
    if (table.needsAssistance) return 'Needs Assistance';
    if (table.status === 'inactive') return 'Available';
    if (table.hasOrder) return 'Has Order';
    return 'Active';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-gray-600">Casa da Levada Restaurant</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </label>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Customer View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="space-y-2">
            {notifications.map(notification => (
              <div key={notification.id} className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-yellow-800">{notification.message}</span>
                </div>
                <span className="text-xs text-yellow-600">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Table Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tableSessions.map(table => (
            <div key={table.tableId} className={`border rounded-lg p-4 ${getStatusColor(table)}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Table {table.tableId}</h3>
                  <p className="text-sm opacity-75">{getStatusText(table)}</p>
                </div>
                {table.needsAssistance && (
                  <span className="animate-pulse inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Alert
                  </span>
                )}
              </div>

              {table.status === 'active' && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customers:</span>
                    <span className="font-medium">{table.customerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time elapsed:</span>
                    <span className="font-medium">{formatTime(table.timeElapsed)}</span>
                  </div>
                  {table.hasOrder && (
                    <div className="mt-3 p-2 bg-white bg-opacity-50 rounded">
                      <div className="font-medium mb-1">Order Summary:</div>
                      {table.orders?.map(order => (
                        <div key={order.id} className="text-xs space-y-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-1 font-medium">
                            Total: €{order.total.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {table.needsAssistance && (
                    <div className="text-xs bg-red-100 p-2 rounded">
                      Reason: {table.assistanceReason === 'no_interaction' ? 'No activity' : 'Customer request'}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                {table.status === 'active' && (
                  <>
                    {table.needsAssistance && (
                      <button
                        onClick={() => markAssistanceComplete(table.tableId)}
                        className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Help Complete
                      </button>
                    )}
                    <button
                      onClick={() => clearTable(table.tableId)}
                      className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Clear Table
                    </button>
                  </>
                )}
                {table.status === 'inactive' && (
                  <button
                    onClick={() => simulateNewCustomer(table.tableId)}
                    className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Simulate Customer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Table {selectedTable.tableId} Details</h3>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Add detailed table information here */}
          </div>
        </div>
      )}
      </div>
    </>
  );
}