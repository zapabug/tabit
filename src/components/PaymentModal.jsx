import { useState, useCallback, useEffect } from 'react';
import { useTableSession } from '../context/TableSessionContext';

const PaymentModal = ({ 
  onPayment, 
  onCancel, 
  selectedItems,
  showPaymentModal,
  setShowPaymentModal 
}) => {
  const { paymentProcessing, lightningInvoice } = useTableSession();
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('PaymentModal mounted');
  }, []);

  const handleLightningPayment = useCallback(() => {
    console.log('Lightning button clicked');
    onPayment('lightning');
  }, [onPayment]);

  const handlePayLater = useCallback(() => {
    console.log('Pay Later button clicked');
    onPayment('later');
  }, [onPayment]);

  const handleCancel = useCallback(() => {
    console.log('Cancel button clicked');
    onCancel();
  }, [onCancel]);

  const handleCopyInvoice = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(lightningInvoice.paymentRequest);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy invoice:', error);
      setError('Failed to copy invoice');
      setTimeout(() => setError(null), 2000);
    }
  }, [lightningInvoice]);

  // Prevent closing when clicking modal background
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
    }
  }, []);

  if (!showPaymentModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={handleBackdropClick}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Choose Payment Method</h3>
        
        {paymentProcessing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Processing Lightning Payment...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your payment</p>
          </div>
        ) : lightningInvoice ? (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="aspect-square w-full max-w-[200px] mx-auto bg-gray-800 p-2 rounded-lg shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(lightningInvoice.paymentRequest)}`}
                  alt="Lightning Invoice QR Code"
                  className="w-full h-full"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-300 mb-2">Amount: €{lightningInvoice.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Expires in {Math.floor(lightningInvoice.expiry / 60)} minutes</p>
                <button
                  onClick={handleCopyInvoice}
                  className={`mt-2 text-sm flex items-center justify-center mx-auto transition-colors ${
                    copySuccess ? 'text-green-400' : 'text-blue-400 hover:text-blue-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copySuccess ? 'Copied!' : 'Copy Invoice'}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors active:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleLightningPayment}
              disabled={paymentProcessing}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors active:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Pay Now ₿</span>
            </button>
            
            <button
              type="button"
              onClick={handlePayLater}
              disabled={paymentProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Pay Later/Open Tab</span>
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors active:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 