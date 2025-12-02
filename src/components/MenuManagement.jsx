import { useState, useEffect } from 'react';
import nostrService from '../services/nostrService';

export default function MenuManagement() {
  const [restaurantKey, setRestaurantKey] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [saved, setSaved] = useState(false);
  const [showNostrSetup, setShowNostrSetup] = useState(false);

  const handleSaveKey = () => {
    if (restaurantKey && restaurantName) {
      // Validate and save Nostr key
      if (nostrService.validateNsec(restaurantKey)) {
        nostrService.initialize(restaurantKey);
        nostrService.saveKey();

        localStorage.setItem('tabit_restaurant_name', restaurantName);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Invalid Nostr private key format. Please check your nsec key.');
      }
    }
  };

  const generateNostrKeyPair = () => {
    const keyPair = nostrService.generateKeyPair();

    // Save the generated key
    localStorage.setItem('tabit_generated_nsec', keyPair.privateKey);
    localStorage.setItem('tabit_generated_npub', keyPair.publicKey);

    return keyPair;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Restaurant Profile Setup */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Profile Setup</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Restaurant Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nostr Private Key (nsec)
            </label>
            <textarea
              value={restaurantKey}
              onChange={(e) => setRestaurantKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="nsec1... (your Nostr private key)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep this key secure. It allows your restaurant to receive Nostr events and Lightning payments.
            </p>
          </div>

          <button
            onClick={handleSaveKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {saved ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nostr Key Generation */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              🔑 No Key Pair Yet?
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              Generate a new Nostr key pair for your restaurant. Each Tab-IT restaurant needs its own unique key pair to receive orders and payments.
            </p>
            <button
              onClick={() => setShowNostrSetup(!showNostrSetup)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Generate Key Pair
            </button>
          </div>
        </div>

        {showNostrSetup && (
          <div className="mt-4 p-4 bg-white rounded-md border border-yellow-200">
            <h4 className="font-semibold text-gray-900 mb-3">Generated Key Pair</h4>
            {(() => {
              const keyPair = generateNostrKeyPair();
              return (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Key (npub)</label>
                    <div className="p-3 bg-gray-100 rounded font-mono text-sm break-all">
                      {keyPair.publicKey}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Share this key with customers for them to find your restaurant
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Private Key (nsec)</label>
                    <div className="p-3 bg-red-50 rounded font-mono text-sm break-all border border-red-200">
                      {keyPair.privateKey}
                    </div>
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ IMPORTANT: Save this key securely. Anyone with this key can access your restaurant's orders and payments.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Menu Items Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Items Management</h2>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 How to Add Menu Items</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Open the file: <code className="bg-blue-100 px-1 rounded">src/components/Menu.jsx</code></li>
            <li>Find the <code className="bg-blue-100 px-1 rounded">MENU_ITEMS</code> array</li>
            <li>Add new items with this structure:</li>
          </ol>
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <pre className="text-xs overflow-x-auto">
{`{
  id: 15,
  name: 'Your Item Name',
  translationKey: 'your_item_key',
  price: 12.50,
  category: 'Main Dishes'
}`}
            </pre>
          </div>

          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside mt-4">
            <li>Add translations in the <code className="bg-blue-100 px-1 rounded">TRANSLATIONS</code> object</li>
            <li>Save the file and reload your app</li>
            <li>Test the new items appear in customer view</li>
          </ol>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use descriptive names that translate well</li>
            <li>• Group similar items in categories</li>
            <li>• Use pricing with 2 decimal places (e.g., 12.50)</li>
            <li>• Test on mobile devices for touch interactions</li>
            <li>• Keep menu items updated regularly</li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">🍽️ Recommended Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {['Most Requested', 'Starters', 'Main Dishes', 'Drinks', 'Desserts', 'Kids Menu', 'Specials', 'Sides'].map(category => (
              <div key={category} className="p-2 bg-white rounded border border-purple-200 text-center">
                {category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Setup */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Configuration</h2>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚡ Lightning Setup</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>To enable Lightning payments, you need:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>LNBits instance (your own or hosted)</li>
                <li>API keys from LNBits dashboard</li>
                <li>Environment variables configured</li>
              </ul>

              <div className="mt-3 p-3 bg-white rounded">
                <h4 className="font-medium mb-2">Environment Variables (.env):</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`VITE_LNBITS_URL=https://your-lnbits-instance.com
VITE_LNBITS_ADMIN_KEY=your_admin_key
VITE_LNBITS_INVOICE_KEY=your_invoice_key
VITE_ZAPSPLITS_ENABLED=true`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🏗️ Future Payment APIs</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>We plan to integrate with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Sats</strong> - Direct Bitcoin Lightning network</li>
                <li><strong>SwissBitcoinPay</strong> - Swiss Bitcoin payment processor</li>
                <li><strong>Cashu</strong> - Chaumian ecash system</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Contact us to prioritize payment methods for your region.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Table QR Codes</h2>
        <p className="text-sm text-gray-600 mb-4">
          Generate QR codes for each table in your restaurant. Each table gets a unique QR code.
        </p>

        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-900 mb-2">📱 How to Use</h3>
          <ol className="text-sm text-indigo-800 space-y-2 list-decimal list-inside">
            <li>Switch to the "Tables" tab in this dashboard</li>
            <li>Use the QR Generator option for each table</li>
            <li>Print the QR codes and place them on tables</li>
            <li>Test by scanning with your phone camera</li>
          </ol>
        </div>
      </div>
    </div>
  );
}