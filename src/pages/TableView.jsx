import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTableSession } from '../context/TableSessionContext';
import Menu from '../components/Menu';

export default function TableView() {
  const { tableId } = useParams();
  const { 
    sessionActive, 
    timer, 
    hasOrder,
    orders,
    startSession, 
    clearSession 
  } = useTableSession();

  useEffect(() => {
    if (!sessionActive) {
      startSession();
    }
  }, [sessionActive, startSession]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateTotal = (orderItems) => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Table {tableId}</h1>
            {!hasOrder && timer > 0 && (
              <div className="text-gray-600">
                Session expires in: {formatTime(timer)}
              </div>
            )}
          </div>

          {sessionActive && !hasOrder && (
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <p className="text-blue-700">
                Welcome! Your session has started. Please place an order within {formatTime(timer)} or a server will be notified to assist you.
              </p>
            </div>
          )}

          {hasOrder ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
              {orders.map((orderItems, orderIndex) => (
                <div key={orderIndex} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Order #{orderIndex + 1}</h3>
                  {orderItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between py-2">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t text-right">
                    <span className="text-lg font-semibold">
                      Total: €{calculateTotal(orderItems).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Menu />
          )}

          {sessionActive && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearSession}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 