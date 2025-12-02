// Simple Nostr service implementation without external dependencies
// In production, you'd want to use a proper Nostr library

class NostrService {
  constructor() {
    this.privateKey = null;
    this.publicKey = null;
    this.relays = [];
    this.restaurantId = null;
  }

  // Generate a new Nostr key pair
  generateKeyPair() {
    // Simple key generation for demo purposes
    // In production, use proper cryptographic key generation
    const privateKey = this.generateSecureRandom(64);
    const publicKey = this.privateKeyToPublic(privateKey);

    return {
      privateKey: privateKey,
      publicKey: publicKey,
      nsec: this.encodeNsec(privateKey),
      npub: this.encodeNpub(publicKey)
    };
  }

  // Generate cryptographically secure random hex string
  generateSecureRandom(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Simple private key to public key conversion (for demo)
  privateKeyToPublic(privateKey) {
    // This is a simplified version - use proper crypto in production
    return this.generateSecureRandom(64);
  }

  // Encode key to bech32 format
  encodeNsec(privateKey) {
    // This is a simplified version - in production, you'd use proper bech32 encoding
    return 'nsec1' + Buffer.from(privateKey, 'hex').toString('base64').substring(0, 44);
  }

  encodeNpub(publicKey) {
    // This is a simplified version - in production, you'd use proper bech32 encoding
    return 'npub1' + Buffer.from(publicKey, 'hex').toString('base64').substring(0, 44);
  }

  // Initialize with existing key pair
  initialize(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = getPublicKey(privateKey);
    return this.publicKey;
  }

  // Connect to relays
  async connectToRelays(relayUrls = []) {
    this.relays = relayUrls.map(url => ({ url, status: 0 }));

    for (const relay of this.relays) {
      try {
        // Simple WebSocket connection
        const ws = new WebSocket(relay.url);

        ws.onopen = () => {
          relay.status = 1;
          relay.ws = ws;
          console.log(`Connected to Nostr relay: ${relay.url}`);
        };

        ws.onclose = () => {
          relay.status = 0;
          console.log(`Disconnected from Nostr relay: ${relay.url}`);
        };

        ws.onerror = (error) => {
          console.error(`Failed to connect to relay ${relay.url}:`, error);
        };

        await new Promise(resolve => {
          ws.onopen = resolve;
          setTimeout(resolve, 5000); // Timeout after 5 seconds
        });
      } catch (error) {
        console.error(`Failed to connect to relay ${relay.url}:`, error);
      }
    }
  }

  // Create restaurant profile (kind 0)
  createRestaurantProfile(restaurantData) {
    const event = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', restaurantData.restaurantId],
        ['name', restaurantData.name],
        ['about', restaurantData.description],
        ['location', restaurantData.location],
        ['website', restaurantData.website]
      ],
      content: JSON.stringify({
        name: restaurantData.name,
        about: restaurantData.description,
        picture: restaurantData.picture,
        nip05: `${restaurantData.restaurantId}@tabit.nostr.com`
      })
    };

    return this.signAndPublish(event);
  }

  // Create table order event (kind 30000 - replaceable event)
  createTableOrderEvent(tableId, orderData) {
    const event = {
      kind: 30000, // Replaceable event for table orders
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `table_${tableId}`], // Unique identifier for this table
        ['table', tableId],
        ['restaurant', this.restaurantId],
        ['order_id', orderData.orderId],
        ['status', orderData.status], // pending, confirmed, paid
        ['payment_method', orderData.paymentMethod] // lightning, cash, card
      ],
      content: JSON.stringify({
        items: orderData.items,
        total: orderData.total,
        customerInfo: orderData.customerInfo,
        timestamp: orderData.timestamp,
        specialInstructions: orderData.specialInstructions
      })
    };

    return this.signAndPublish(event);
  }

  // Listen for table-specific events
  async listenForTableEvents(tableId, callback) {
    for (const relay of this.relays) {
      if (relay.ws && relay.status === 1) {
        // Send subscription message
        const filter = {
          kinds: [30000], // Table order events
          '#d': [`table_${tableId}`], // Filter for this specific table
          since: Math.floor(Date.now() / 1000) - 3600 // Last hour
        };

        relay.ws.send(JSON.stringify(['REQ', 'table_events_' + tableId, filter]));

        // Listen for events
        const originalOnMessage = relay.ws.onmessage;
        relay.ws.onmessage = (event) => {
          if (originalOnMessage) originalOnMessage(event);

          try {
            const [type, subscriptionId, data] = JSON.parse(event.data);
            if (type === 'EVENT' && subscriptionId === 'table_events_' + tableId) {
              callback(data);
            }
          } catch (error) {
            console.error('Error parsing Nostr event:', error);
          }
        };
      }
    }
  }

  // Create assistance request event (kind 30001)
  createAssistanceEvent(tableId, assistanceData) {
    const event = {
      kind: 30001, // Assistance request events
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `assist_${tableId}_${Date.now()}`], // Unique ID
        ['table', tableId],
        ['restaurant', this.restaurantId],
        ['type', assistanceData.type], // customer_request, no_interaction, payment_help
        ['status', 'active'] // active, resolved, cancelled
      ],
      content: JSON.stringify({
        reason: assistanceData.reason,
        urgency: assistanceData.urgency, // low, medium, high
        timestamp: assistanceData.timestamp,
        customerNotes: assistanceData.customerNotes
      })
    };

    return this.signAndPublish(event);
  }

  // Listen for assistance requests
  async listenForAssistanceRequests(callback) {
    const filter = {
      kinds: [30001], // Assistance request events
      '#restaurant': [this.restaurantId],
      since: Math.floor(Date.now() / 1000) - 3600 // Last hour
    };

    for (const relay of this.relays) {
      relay.subscribe([filter], {
        onevent: callback,
        oneose: () => console.log('Assistance subscription ended'),
        onerror: (error) => console.error('Assistance subscription error:', error)
      });
    }
  }

  // Create payment confirmation event (kind 30002)
  createPaymentEvent(orderId, paymentData) {
    const event = {
      kind: 30002, // Payment events
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', `payment_${orderId}`], // Unique ID
        ['order_id', orderId],
        ['restaurant', this.restaurantId],
        ['status', paymentData.status], // pending, confirmed, failed
        ['method', paymentData.method] // lightning, cash, card
      ],
      content: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency,
        transactionId: paymentData.transactionId,
        timestamp: paymentData.timestamp,
        lightningInvoice: paymentData.lightningInvoice,
        tipAmount: paymentData.tipAmount
      })
    };

    return this.signAndPublish(event);
  }

  // Sign and publish event to all relays
  async signAndPublish(event) {
    try {
      // Simple event signing (for demo purposes)
      const signedEvent = {
        ...event,
        pubkey: this.publicKey,
        sig: this.generateSecureRandom(128) // Fake signature for demo
      };

      // Create event ID (simplified)
      signedEvent.id = this.generateSecureRandom(64);

      // Publish to all connected relays
      const publishPromises = this.relays.map(relay => {
        return new Promise((resolve) => {
          if (relay.ws && relay.status === 1) {
            relay.ws.send(JSON.stringify(['EVENT', signedEvent]));

            setTimeout(() => {
              console.log(`Event published to ${relay.url}`);
              resolve({ relay: relay.url, success: true });
            }, 1000);
          } else {
            resolve({ relay: relay.url, success: false, error: 'Not connected' });
          }
        });
      });

      const results = await Promise.all(publishPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`Published to ${successful.length}/${results.length} relays`);

      if (failed.length > 0) {
        console.warn('Failed relays:', failed);
      }

      return {
        success: successful.length > 0,
        published: successful.length,
        failed: failed.length,
        results
      };

    } catch (error) {
      console.error('Error signing/publishing event:', error);
      throw error;
    }
  }

  // Save key to secure storage
  saveKey() {
    if (!this.privateKey) return false;

    try {
      // In a production app, you'd use encrypted secure storage
      localStorage.setItem('tabit_nostr_key', this.privateKey);
      localStorage.setItem('tabit_nostr_pubkey', this.publicKey);
      return true;
    } catch (error) {
      console.error('Failed to save Nostr key:', error);
      return false;
    }
  }

  // Load key from storage
  loadKey() {
    try {
      this.privateKey = localStorage.getItem('tabit_nostr_key');
      this.publicKey = localStorage.getItem('tabit_nostr_pubkey');

      if (this.privateKey && this.publicKey) {
        return {
          privateKey: this.privateKey,
          publicKey: this.publicKey
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to load Nostr key:', error);
      return null;
    }
  }

  // Clear saved key
  clearKey() {
    try {
      localStorage.removeItem('tabit_nostr_key');
      localStorage.removeItem('tabit_nostr_pubkey');
      this.privateKey = null;
      this.publicKey = null;
      return true;
    } catch (error) {
      console.error('Failed to clear Nostr key:', error);
      return false;
    }
  }

  // Validate nsec format
  validateNsec(nsec) {
    try {
      return nsec && nsec.startsWith('nsec1') && nsec.length > 10;
    } catch {
      return false;
    }
  }

  // Set restaurant ID
  setRestaurantId(restaurantId) {
    this.restaurantId = restaurantId;
  }

  // Disconnect from relays
  disconnect() {
    for (const relay of this.relays) {
      relay.close();
    }
    this.relays = [];
  }

  // Get current status
  getStatus() {
    return {
      connected: this.relays.length > 0 && this.relays.some(r => r.status === 1),
      relayCount: this.relays.length,
      hasKey: !!(this.privateKey && this.publicKey),
      restaurantId: this.restaurantId
    };
  }
}

// Singleton instance
const nostrService = new NostrService();

export default nostrService;