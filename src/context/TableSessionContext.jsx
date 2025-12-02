import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';
import lightningService from '../services/lightningService';
import nostrService from '../services/nostrService';

const TableSessionContext = createContext(null);

export function useTableSession() {
  const context = useContext(TableSessionContext);
  if (!context) {
    throw new Error('useTableSession must be used within a TableSessionProvider');
  }
  return context;
}

export function TableSessionProvider({ children }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [timer, setTimer] = useState(60); // 1 minute in seconds
  const [orders, setOrders] = useState([]);
  const [hasOrder, setHasOrder] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [lightningInvoice, setLightningInvoice] = useState(null);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [needsAssistance, setNeedsAssistance] = useState(false);
  const [assistanceReason, setAssistanceReason] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Function definitions that need to be available before useEffect hooks

  const clearSession = useCallback(() => {
    setSessionActive(false);
    setOrders([]);
    setHasOrder(false);
    setTimer(60);
    setLastInteractionTime(Date.now());
  }, []);

  // Function to send notification to server's device via WebSocket
  const notifyServer = useCallback((tableId, reason = 'no_interaction') => {
    console.log(`Table ${tableId} needs assistance - Reason: ${reason}`);

    // Try WebSocket first, fallback to console if not available
    if (websocketService.isConnected()) {
      websocketService.notifyServer(tableId, reason);
    } else {
      // Fallback for when WebSocket is not connected
      console.log('WebSocket not connected, using fallback notification');
      // In production, you might want to implement HTTP fallback here
    }

    // Also update local state immediately for responsiveness
    setNeedsAssistance(true);
    setAssistanceReason(reason);
  }, []);

  const toggleAssistance = useCallback(() => {
    const tableId = window.location.pathname.split('/').pop();

    setNeedsAssistance(prev => {
      const newState = !prev;
      if (newState) {
        notifyServer(tableId, 'customer_request');
        setAssistanceReason('customer_request');
      } else {
        setAssistanceReason('');
        if (websocketService.isConnected()) {
          websocketService.clearAssistance(tableId);
        }
      }
      return newState;
    });
  }, [notifyServer]);

  const handleInteraction = useCallback(() => {
    setLastInteractionTime(Date.now());
    if (!hasOrder && sessionActive) {
      setTimer(60); // Reset timer to 60 seconds on interaction
      if (assistanceReason === 'no_interaction') {
        setNeedsAssistance(false);
        setAssistanceReason('');
      }
    }
  }, [hasOrder, sessionActive, assistanceReason]);



  const addToOrder = useCallback((item) => {
    handleInteraction();
    const existingItem = selectedItems.find(i => i.id === item.id);
    if (existingItem) {
      setSelectedItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  }, [selectedItems, handleInteraction]);

  const removeFromOrder = useCallback((itemId) => {
    handleInteraction();
    setSelectedItems(prev => prev.map(item =>
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0));
  }, [handleInteraction]);

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Effect to set up interaction listeners
  useEffect(() => {
    if (sessionActive && !hasOrder) {
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

      const handleUserInteraction = () => {
        handleInteraction();
      };

      events.forEach(event => {
        window.addEventListener(event, handleUserInteraction);
      });

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleUserInteraction);
        });
      };
    }
  }, [sessionActive, hasOrder, handleInteraction]);

  // Effect to initialize WebSocket connection
  useEffect(() => {
    // Try to connect to WebSocket when session becomes active
    if (sessionActive && !websocketService.isConnected()) {
      websocketService.connect()
        .catch(error => {
          console.log('WebSocket connection failed, running in offline mode:', error);
        });
    }

    // Set up WebSocket event listeners
    const handleWebSocketMessage = (data) => {
      switch (data.type) {
        case 'assistance_cleared':
          if (data.tableId === window.location.pathname.split('/').pop()) {
            setNeedsAssistance(false);
            setAssistanceReason('');
          }
          break;
        case 'table_status_update':
          // Handle table status updates from staff dashboard
          if (data.tableId === window.location.pathname.split('/').pop() && data.status === 'cleared') {
            clearSession();
          }
          break;
        default:
          break;
      }
    };

    websocketService.on('message', handleWebSocketMessage);
    websocketService.on('assistance_cleared', handleWebSocketMessage);
    websocketService.on('table_status_update', handleWebSocketMessage);

    return () => {
      websocketService.off('message', handleWebSocketMessage);
      websocketService.off('assistance_cleared', handleWebSocketMessage);
      websocketService.off('table_status_update', handleWebSocketMessage);
    };
  }, [sessionActive, clearSession]);

  // Effect to handle the timer and server notifications
  useEffect(() => {
    let interval;
    if (sessionActive && !hasOrder && timer > 0) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const timeSinceLastInteraction = (currentTime - lastInteractionTime) / 1000;

        if (timeSinceLastInteraction >= 60 && !needsAssistance) {
          // Instead of clearing session, notify server
          setNeedsAssistance(true);
          setAssistanceReason('no_interaction');
          // Get tableId from URL or context
          const tableId = window.location.pathname.split('/').pop();
          notifyServer(tableId, 'no_interaction');
        }

        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            return 60; // Reset timer instead of clearing session
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, hasOrder, timer, lastInteractionTime, needsAssistance, notifyServer]);

  const startSession = useCallback(() => {
    setSessionActive(true);
    setTimer(60);
    setLastInteractionTime(Date.now());
    setNeedsAssistance(false);
  }, []);

  const addOrder = async (items, paymentMethod) => {
    console.log('Adding order:', { items, paymentMethod });
    const tableId = window.location.pathname.split('/').pop();
    const newOrder = {
      id: Date.now(),
      items,
      timestamp: new Date().toISOString(),
      paymentMethod,
      status: paymentMethod === 'lightning' ? 'pending' : 'awaiting_payment',
      total: items.reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    // Send order to staff dashboard via WebSocket
    if (websocketService.isConnected()) {
      websocketService.submitOrder(tableId, newOrder);
    }

    // Publish order event to Nostr
    try {
      await nostrService.createTableOrderEvent(tableId, newOrder);
      console.log('Order published to Nostr');
    } catch (error) {
      console.error('Failed to publish order to Nostr:', error);
    }

    if (paymentMethod === 'lightning') {
      try {
        // Generate invoice first
        const invoice = await generateLightningInvoice(items);
        console.log('Generated invoice:', invoice);
        setLightningInvoice(invoice);
        setPaymentProcessing(true);

        // Wait for payment confirmation
        const paymentSuccess = await processLightningPayment(invoice.checkingId);
        console.log('Payment success:', paymentSuccess);

        if (paymentSuccess) {
          newOrder.status = 'paid';
          setOrders(prevOrders => [...prevOrders, newOrder]);
          setHasOrder(true);
          setTimer(3600);

          // Send payment update via WebSocket
          if (websocketService.isConnected()) {
            websocketService.paymentUpdate(tableId, {
              orderId: newOrder.id,
              status: 'paid',
              method: 'lightning'
            });
          }

          // Publish payment event to Nostr
          try {
            const paymentData = {
              orderId: newOrder.id,
              status: 'confirmed',
              method: 'lightning',
              amount: invoice.amount,
              currency: 'EUR',
              transactionId: invoice.paymentHash,
              timestamp: new Date().toISOString(),
              lightningInvoice: invoice.paymentRequest
            };

            await nostrService.createPaymentEvent(newOrder.id, paymentData);
            console.log('Payment published to Nostr');
          } catch (error) {
            console.error('Failed to publish payment to Nostr:', error);
          }

          return true;
        } else {
          throw new Error('Payment failed');
        }
      } catch (error) {
        console.error('Lightning payment error:', error);
        return false;
      } finally {
        setPaymentProcessing(false);
        setLightningInvoice(null);
      }
    } else if (paymentMethod === 'later') {
      // Handle Pay Later option
      console.log('Processing Pay Later order');
      setOrders(prevOrders => [...prevOrders, newOrder]);
      setHasOrder(true);
      setTimer(3600);

      // Send payment update via WebSocket
      if (websocketService.isConnected()) {
        websocketService.paymentUpdate(tableId, {
          orderId: newOrder.id,
          status: 'awaiting_payment',
          method: 'later'
        });
      }

      return true;
    }
  };

  const generateLightningInvoice = async (items) => {
    console.log('Generating Lightning invoice for items:', items);

    try {
      const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const itemsString = items.map(item => `${item.quantity}x ${item.name}`).join(', ');
      const memo = `Tip Tab: ${itemsString}`;

      const metadata = {
        items,
        tableId: window.location.pathname.split('/').pop(),
        timestamp: new Date().toISOString(),
      };

      const invoice = await lightningService.generateInvoice(totalAmount, memo, metadata);
      console.log('Generated invoice:', invoice);
      return invoice;
    } catch (error) {
      console.error('Error generating Lightning invoice:', error);

      // Fallback to simulation for development
      console.log('Falling back to simulated invoice');
      const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      return {
        paymentRequest: 'lnbc1500n1ps9h4ppd96hsv4425y0cdgw3hk...',
        amount: totalAmount,
        expiry: 600,
        memo: 'Tip Tab Order (Simulated)',
      };
    }
  };

  const processLightningPayment = async (checkingId) => {
    console.log('Processing Lightning payment');

    try {
      if (checkingId && lightningService.invoiceReadKey) {
        // Check real payment status with LNBits
        let attempts = 0;
        const maxAttempts = 20; // Check for up to 2 minutes

        while (attempts < maxAttempts) {
          const status = await lightningService.checkPaymentStatus(checkingId);

          if (status.paid) {
            console.log('Lightning payment confirmed:', status);

            // Handle payment webhook processing
            await lightningService.handlePaymentWebhook({
              checking_id: checkingId,
              payment_hash: status.paymentHash,
              amount: status.amount * 100, // Convert to millisatoshis
              memo: status.memo,
              pending: false,
            });

            return true;
          }

          // Wait 3 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 3000));
          attempts++;
        }

        throw new Error('Payment timeout - not confirmed within 2 minutes');
      } else {
        // Fallback to simulation for development
        console.log('Using payment simulation');
        const result = await lightningService.simulatePayment({
          paymentRequest: 'simulated',
          amount: 0,
        }, 2000);

        return result.success;
      }
    } catch (error) {
      console.error('Error processing Lightning payment:', error);
      throw error;
    }
  };



  const value = {
    sessionActive,
    timer,
    orders,
    hasOrder,
    paymentProcessing,
    lightningInvoice,
    needsAssistance,
    assistanceReason,
    selectedItems,
    startSession,
    addOrder,
    clearSession,
    handleInteraction,
    toggleAssistance,
    addToOrder,
    removeFromOrder,
    clearSelectedItems,
  };

  return (
    <TableSessionContext.Provider value={value}>
      {children}
    </TableSessionContext.Provider>
  );
}