import { useState, useEffect } from 'react';

export default function TableQRGenerator() {
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [tableId, setTableId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [tables, setTables] = useState([]);

  // Load tables from localStorage
  useEffect(() => {
    const savedTables = localStorage.getItem('tabit_tables');
    if (savedTables) {
      try {
        setTables(JSON.parse(savedTables));
      } catch (error) {
        console.error('Failed to load tables:', error);
      }
    }
  }, []);

  const generateQRCode = () => {
    if (!tableId) {
      alert('Please enter a table ID');
      return;
    }

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

  const generateAllQRCodes = () => {
    if (tables.length === 0) {
      alert('No tables found. Please create tables first.');
      return;
    }

    const qrCodes = tables.map(table => ({
      tableId: table.id,
      tableName: table.name,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}/table/${table.id}`)}`,
      tableUrl: `${baseUrl}/table/${table.id}`
    }));

    // Create a simple HTML page with all QR codes
    const qrPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Table QR Codes - Tab-IT</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { text-align: center; margin-bottom: 30px; }
        .qr-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; }
        .qr-item { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .qr-item h3 { margin: 0 0 10px 0; color: #1f2937; font-size: 18px; }
        .qr-item .table-id { color: #007bff; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
        .qr-item img { max-width: 180px; height: auto; border-radius: 8px; margin: 10px 0; }
        .qr-item .table-url { font-size: 11px; color: #6c757d; word-break: break-all; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 10px; }
        .print-btn { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin: 30px auto; display: block; }
        .print-btn:hover { background: #0056b3; }
        @media print {
            body { margin: 10px; }
            .qr-container { grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .print-btn { display: none; }
            .qr-item { break-inside: avoid; page-break-inside: avoid; }
        }
        @media (max-width: 800px) {
            .qr-container { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
            .qr-container { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍽️ Tab-IT Table QR Codes</h1>
        <p>Your Restaurant Table Access Codes</p>
    </div>
    <div class="qr-container">
        ${qrCodes.map(qr => `
            <div class="qr-item">
                <div class="table-id">TABLE ${qr.tableId}</div>
                <h3>${qr.tableName}</h3>
                <img src="${qr.qrUrl}" alt="Table ${qr.tableName} QR Code">
                <div class="table-url">${qr.tableUrl}</div>
            </div>
        `).join('')}
    </div>
    <div style="text-align: center; margin-top: 40px;">
        <button class="print-btn" onclick="window.print()">🖨 Print All QR Codes</button>
    </div>
    <script>
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        });
    </script>
</body>
</html>`;

    // Open in new window
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(qrPage);
      newWindow.document.title = 'Tab-IT Table QR Codes';
      newWindow.document.close();
    } else {
      // Fallback: create download
      const blob = new Blob([qrPage], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-qr-codes.html';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Single QR Code Generator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Single QR Code</h2>
        
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
              onChange={(e) => setTableId(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., T1, TABLE-1, 1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for this table
            </p>
          </div>
        </div>

        <button
          onClick={generateQRCode}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Generate QR Code
        </button>

        {qrCodeUrl && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
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
                <div className="bg-gray-100 p-4 rounded-md font-mono text-sm break-all max-w-xs">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2m0 0h2a2 2 0 012 2m0 0h2a2 2 0 012 2" />
                      </svg>
                      Copy URL
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Print this QR code and place it on Table {tableId}</li>
                <li>• Customers can scan it with their phone camera</li>
                <li>• They will be taken directly to their table's menu</li>
                <li>• Test the QR code before printing</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Batch QR Code Generation */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Batch QR Generation</h3>
        <p className="text-sm text-purple-800 mb-4">
          Generate QR codes for all your tables at once. Perfect for printing and setup.
        </p>
        
        <button
          onClick={generateAllQRCodes}
          className="w-full md:w-auto px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-2H4m2 8h12m-4-4h8" />
          </svg>
          Generate All Table QR Codes
        </button>
        
        <p className="text-xs text-purple-600 mt-2">
          This will create a printable page with all your table QR codes
        </p>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-900 mb-3">💡 QR Code Best Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-yellow-800 mb-2">🏃 Physical Setup</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use waterproof materials for restaurants</li>
              <li>• Position at eye level (3-4 feet high)</li>
              <li>• Ensure good lighting in QR area</li>
              <li>• Consider table stands or holders</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-yellow-800 mb-2">📱 Digital Best Practices</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Test QR codes before mass printing</li>
              <li>• Use high-quality images for scanning</li>
              <li>• Include table number prominently</li>
              <li>• Keep backup QR codes available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}