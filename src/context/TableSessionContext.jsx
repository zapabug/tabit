import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  // Function to simulate sending notification to server's device
  const notifyServer = useCallback((tableId, reason = 'no_interaction') => {
    // In a real implementation, this would send a push notification or use WebSocket
    console.log(`Table ${tableId} needs assistance - Reason: ${reason}`);
    // You would implement actual server notification here
    // For example: 
    // await fetch('/api/notify-server', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ tableId, reason })
    // });
  }, []);

  // Function to toggle assistance request
  const toggleAssistance = useCallback(() => {
    setNeedsAssistance(prev => {
      const newState = !prev;
      if (newState) {
        const tableId = window.location.pathname.split('/').pop();
        notifyServer(tableId, 'customer_request');
        setAssistanceReason('customer_request');
      } else {
        setAssistanceReason('');
      }
      return newState;
    });
  }, [notifyServer]);

  // Function to handle user interaction
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
    const newOrder = {
      id: Date.now(),
      items,
      timestamp: new Date().toISOString(),
      paymentMethod,
      status: paymentMethod === 'lightning' ? 'pending' : 'awaiting_payment'
    };

    if (paymentMethod === 'lightning') {
      try {
        // Generate invoice first
        const invoice = await generateLightningInvoice(items);
        console.log('Generated invoice:', invoice);
        setLightningInvoice(invoice);
        setPaymentProcessing(true);
        
        // Wait for simulated payment (in real app, this would wait for webhook/socket)
        await new Promise(resolve => setTimeout(resolve, 5000)); // Show QR for 5 seconds
        
        const paymentSuccess = await processLightningPayment();
        console.log('Payment success:', paymentSuccess);
        
        if (paymentSuccess) {
          newOrder.status = 'paid';
          setOrders(prevOrders => [...prevOrders, newOrder]);
          setHasOrder(true);
          setTimer(3600);
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
      return true;
    }
  };

  const generateLightningInvoice = async (items) => {
    console.log('Generating Lightning invoice for items:', items);
    // Simulate Lightning invoice generation
    const invoice = {
      paymentRequest: 'lnbc1500n1ps9h4ppd96hsv4425y0cdgw3hk...',
      amount: items.reduce((total, item) => total + (item.price * item.quantity), 0),
      expiry: 600, // 10 minutes
    };
    console.log('Generated invoice:', invoice);
    return invoice;
  };

  const processLightningPayment = async () => {
    console.log('Processing Lightning payment');
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Payment processed successfully');
    return true; // Payment successful
  };

  const clearSession = useCallback(() => {
    setSessionActive(false);
    setOrders([]);
    setHasOrder(false);
    setTimer(60);
    setLastInteractionTime(Date.now());
  }, []);

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