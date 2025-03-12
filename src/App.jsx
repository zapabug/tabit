import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TableSessionProvider } from './context/TableSessionContext';
import TableView from './pages/TableView';
import Menu from './components/Menu';

function App() {
  return (
    <Router>
      <TableSessionProvider>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/table/:tableId" element={<TableView />} />
        </Routes>
      </TableSessionProvider>
    </Router>
  );
}

export default App;
