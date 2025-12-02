import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TableSessionProvider } from './context/TableSessionContext';
import TableView from './pages/TableView';
import Menu from './components/Menu';
import StaffDashboard from './pages/StaffDashboard';
import QRCodeGenerator from './components/QRCodeGenerator';

function App() {
  return (
    <Router>
      <TableSessionProvider>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/table/:tableId" element={<TableView />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/qr-generator" element={<QRCodeGenerator />} />
        </Routes>
      </TableSessionProvider>
    </Router>
  );
}

export default App;
