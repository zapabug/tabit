class LightningService {
  constructor() {
    this.lnbitsUrl = import.meta.env.VITE_LNBITS_URL || 'https://lnbits.com';
    this.adminKey = import.meta.env.VITE_LNBITS_ADMIN_KEY || '';
    this.invoiceReadKey = import.meta.env.VITE_LNBITS_INVOICE_KEY || '';
    this.zapsplitsEnabled = import.meta.env.VITE_ZAPSPLITS_ENABLED === 'true';
  }

  // Generate a Lightning invoice using LNBits API
  async generateInvoice(amount, memo = 'Tip Tab Order', metadata = {}) {
    try {
      const response = await fetch(`${this.lnbitsUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.invoiceReadKey || this.adminKey,
        },
        body: JSON.stringify({
          out: false, // This is an invoice (incoming payment)
          amount: Math.round(amount * 100), // Convert to millisatoshis (assuming 1 EUR = 100 sats for demo)
          memo,
          expiry: 600, // 10 minutes
          metadata: JSON.stringify(metadata),
        }),
      });

      if (!response.ok) {
        throw new Error(`LNBits API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        paymentRequest: data.payment_request,
        paymentHash: data.payment_hash,
        amount: amount,
        expiry: data.expiry || 600,
        checkingId: data.checking_id,
        memo: data.memo,
      };
    } catch (error) {
      console.error('Error generating Lightning invoice:', error);
      throw error;
    }
  }

  // Check payment status
  async checkPaymentStatus(checkingId) {
    try {
      const response = await fetch(`${this.lnbitsUrl}/api/v1/payments/${checkingId}`, {
        headers: {
          'X-Api-Key': this.adminKey,
        },
      });

      if (!response.ok) {
        throw new Error(`LNBits API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        paid: data.paid,
        amount: data.amount / 100, // Convert back from millisatoshis
        fee: data.fee ? data.fee / 100 : 0,
        memo: data.memo,
        time: data.time,
        bolt11: data.bolt11,
        preimage: data.preimage,
        paymentHash: data.payment_hash,
        details: data.details,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  // Pay a Lightning invoice (for staff tips/withdrawals)
  async payInvoice(paymentRequest, amount) {
    if (!this.adminKey) {
      throw new Error('Admin key required for making payments');
    }

    try {
      const response = await fetch(`${this.lnbitsUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.adminKey,
        },
        body: JSON.stringify({
          out: true, // This is a payment (outgoing)
          bolt11: paymentRequest,
          amount: Math.round(amount * 100), // Convert to millisatoshis
        }),
      });

      if (!response.ok) {
        throw new Error(`LNBits API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        paymentHash: data.payment_hash,
        checkingId: data.checking_id,
        fee: data.fee ? data.fee / 100 : 0,
        memo: data.memo,
        preimage: data.preimage,
        details: data.details,
      };
    } catch (error) {
      console.error('Error paying Lightning invoice:', error);
      throw error;
    }
  }

  // ZapSplits integration for automatic tip distribution
  async distributeTip(totalAmount, staffPubkeys = []) {
    if (!this.zapsplitsEnabled || !staffPubkeys.length) {
      console.log('ZapSplits not enabled or no staff pubkeys provided');
      return null;
    }

    try {
      // This would integrate with LNBits ZapSplits extension
      // For now, we'll simulate equal distribution
      const tipPerStaff = totalAmount / staffPubkeys.length;
      const results = [];

      for (const pubkey of staffPubkeys) {
        try {
          // In real implementation, this would use ZapSplits API
          // For demo purposes, we'll just log the distribution
          console.log(`Distributing €${tipPerStaff.toFixed(2)} tip to staff member: ${pubkey}`);

          results.push({
            pubkey,
            amount: tipPerStaff,
            status: 'success',
          });
        } catch (error) {
          console.error(`Failed to distribute tip to ${pubkey}:`, error);
          results.push({
            pubkey,
            amount: tipPerStaff,
            status: 'failed',
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error distributing tips:', error);
      throw error;
    }
  }

  // Create a payment link for QR code generation
  createPaymentUrl(invoice) {
    // For mobile wallets, use lightning: protocol
    return `lightning:${invoice.paymentRequest}`;
  }

  // Generate QR code URL (using external service)
  generateQRCodeUrl(invoice) {
    const encodedInvoice = encodeURIComponent(invoice.paymentRequest);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedInvoice}`;
  }

  // Validate Lightning address format
  validateLightningAddress(address) {
    // Basic validation for lightning addresses (user@domain)
    const lightningAddressRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return lightningAddressRegex.test(address);
  }

  // Get wallet balance (for staff)
  async getWalletBalance() {
    if (!this.adminKey) {
      throw new Error('Admin key required for wallet balance');
    }

    try {
      const response = await fetch(`${this.lnbitsUrl}/api/v1/wallet`, {
        headers: {
          'X-Api-Key': this.adminKey,
        },
      });

      if (!response.ok) {
        throw new Error(`LNBits API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        balance: data.balance / 100, // Convert from millisatoshis
        name: data.name,
        id: data.id,
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  // Webhook handler for payment confirmations
  async handlePaymentWebhook(paymentData) {
    console.log('Lightning payment webhook received:', paymentData);

    // This would typically:
    // 1. Verify the webhook signature
    // 2. Update order status in database
    // 3. Send notifications
    // 4. Process tip distribution if enabled

    try {
      const { checking_id, payment_hash, amount, memo, pending } = paymentData;

      if (pending) {
        console.log('Payment pending:', checking_id);
        return { status: 'pending' };
      }

      console.log(`Payment confirmed: ${amount/100} sats for ${memo}`);

      // Here you would typically:
      // - Update order status to 'paid'
      // - Send confirmation to customer
      // - Notify staff
      // - Distribute tips if ZapSplits is enabled

      return { status: 'confirmed' };
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      throw error;
    }
  }

  // Simulate payment for development/testing
  simulatePayment(invoice, delay = 3000) {
    return new Promise((resolve) => {
      console.log(`Simulating Lightning payment for €${invoice.amount.toFixed(2)}`);

      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for simulation

        if (success) {
          console.log('Lightning payment simulation: SUCCESS');
          resolve({
            success: true,
            paymentHash: 'simulated_' + Date.now(),
            preimage: 'simulated_preimage_' + Date.now(),
          });
        } else {
          console.log('Lightning payment simulation: FAILED');
          resolve({
            success: false,
            error: 'Payment simulation failed',
          });
        }
      }, delay);
    });
  }
}

// Singleton instance
const lightningService = new LightningService();

export default lightningService;