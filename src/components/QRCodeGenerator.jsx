import { useState } from 'react';

export default function QRCodeGenerator() {
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [tableId, setTableId] = useState('1');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateQRCode = () => {
    const tableUrl = `${baseUrl}/table/${tableId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Table QR Code Generator</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-restaurant.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table ID
              </label>
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1, 2, 3, etc."
              />
            </div>
          </div>

          <button
            onClick={generateQRCode}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Generate QR Code
          </button>

          {qrCodeUrl && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-4">QR Code</h3>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={qrCodeUrl}
                      alt={`Table ${tableId} QR Code`}
                      className="w-48 h-48"
                    />
                  </div>
                  <button
                    onClick={() => window.open(qrCodeUrl, '_blank')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download QR Code
                  </button>
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold mb-4">Table URL</h3>
                  <div className="bg-gray-100 p-4 rounded-md font-mono text-sm break-all">
                    {`${baseUrl}/table/${tableId}`}
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${baseUrl}/table/${tableId}`)}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center"
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Print this QR code and place it on Table {tableId}</li>
                  <li>• Customers can scan it with their phone camera</li>
                  <li>• They will be taken directly to their table's menu</li>
                  <li>• Generate a unique QR code for each table</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-md">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Use waterproof QR code stickers for durability</li>
              <li>• Test the QR codes before printing</li>
              <li>• Keep QR codes at eye level on tables</li>
              <li>• Consider NFC tags as an alternative to QR codes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}