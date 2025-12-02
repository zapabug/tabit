import { useState, useEffect } from 'react';

export default function CreateManageTables() {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ id: '', name: '', capacity: 2, location: '' });
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing tables from localStorage
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

  // Save tables to localStorage
  const saveTables = (updatedTables) => {
    setTables(updatedTables);
    localStorage.setItem('tabit_tables', JSON.stringify(updatedTables));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Add new table
  const handleAddTable = () => {
    if (!newTable.name || !newTable.id) {
      alert('Please fill in table name and ID');
      return;
    }

    // Check for duplicate ID
    if (tables.some(table => table.id === newTable.id)) {
      alert('Table ID already exists');
      return;
    }

    const tableToAdd = {
      ...newTable,
      id: newTable.id.trim(),
      name: newTable.name.trim(),
      capacity: parseInt(newTable.capacity) || 2,
      location: newTable.location.trim(),
      status: 'inactive',
      createdAt: new Date().toISOString()
    };

    saveTables([...tables, tableToAdd]);
    setNewTable({ id: '', name: '', capacity: 2, location: '' });
    setShowForm(false);
  };

  // Delete table
  const handleDeleteTable = (tableId) => {
    if (confirm('Are you sure you want to delete this table?')) {
      saveTables(tables.filter(table => table.id !== tableId));
    }
  };

  // Update table
  const handleUpdateTable = (tableId, field, value) => {
    const updatedTables = tables.map(table => 
      table.id === tableId 
        ? { ...table, [field]: value }
        : table
    );
    saveTables(updatedTables);
  };

  // Get table URL
  const getTableUrl = (tableId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/table/${tableId}`;
  };

  // Get QR code URL
  const getQRCodeUrl = (tableId) => {
    const tableUrl = getTableUrl(tableId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`;
  };

  // Generate QR code for all tables
  const generateAllQRCodes = () => {
    const qrCodes = tables.map(table => ({
      tableId: table.id,
      tableName: table.name,
      qrUrl: getQRCodeUrl(table.id),
      tableUrl: getTableUrl(table.id)
    }));

    // Create a simple HTML page with all QR codes
    const qrPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Table QR Codes - Tab-IT</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .qr-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .qr-item { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
        .qr-item h3 { margin: 0 0 10px 0; color: #333; }
        .qr-item img { max-width: 150px; height: auto; }
        .table-url { font-size: 12px; color: #666; word-break: break-all; margin-top: 10px; }
        .print-btn { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Table QR Codes for Your Restaurant</h1>
    <div class="qr-container">
        ${qrCodes.map(qr => `
        <div class="qr-item">
            <h3>Table ${qr.tableName} (${qr.tableId})</h3>
            <img src="${qr.qrUrl}" alt="Table ${qr.tableName} QR Code">
            <div class="table-url">${qr.tableUrl}</div>
        </div>
        `).join('')}
    </div>
    <div style="margin-top: 30px; text-align: center;">
        <button class="print-btn" onclick="window.print()">Print All QR Codes</button>
    </div>
    <script>
        // Auto-fit QR codes to page
        window.addEventListener('load', function() {
            window.print();
        });
    </script>
</body>
</html>`;

    // Open in new window
    const newWindow = window.open('', '_blank');
    newWindow.document.write(qrPage);
    newWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Add New Table Form */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-900">
            {showForm ? '➕ Add New Table' : '📋 Manage Tables'}
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Table'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table ID *
                </label>
                <input
                  type="text"
                  value={newTable.id}
                  onChange={(e) => setNewTable(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., T1, TABLE-1, 1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this table
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name *
                </label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Window Table 1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Display name for staff and customers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of seats at this table
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newTable.location}
                  onChange={(e) => setNewTable(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Near Window, Patio, Back Room"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Physical location in restaurant
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddTable}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Table
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tables List */}
      {tables.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Your Tables ({tables.length})
              </h3>
              <button
                onClick={generateAllQRCodes}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-2H4m2 8h12m-4-4h8" />
                </svg>
                Generate All QR Codes
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tables.map((table) => (
                    <tr key={table.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {table.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          table.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {table.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => window.open(getQRCodeUrl(table.id), '_blank')}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View QR
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUpdateTable(table.id, 'status', table.status === 'active' ? 'inactive' : 'active')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          {table.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Table Management Tips</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• <strong>Unique IDs</strong>: Use simple, memorable identifiers (T1, T2, TABLE1, etc.)</li>
          <li>• <strong>Descriptive Names</strong>: Help staff quickly identify tables (Window Table 1, Patio Table, etc.)</li>
          <li>• <strong>Consistent Pattern</strong>: Use the same naming convention throughout your restaurant</li>
          <li>• <strong>Test QR Codes</strong>: Scan each code with your phone before printing</li>
          <li>• <strong>Durable Materials</strong>: Use waterproof or laminated QR codes for restaurant environment</li>
          <li>• <strong>Proper Placement</strong>: Position QR codes at eye level where customers can easily scan them</li>
          <li>• <strong>Backup Plan</strong>: Keep spare QR codes ready in case of damage</li>
        </ul>
      </div>

      {saved && (
        <div className="bg-green-50 rounded-lg p-4 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-medium">Tables saved successfully!</span>
        </div>
      )}
    </div>
  );
}