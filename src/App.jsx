import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InfoPage from './components/InfoPage';
import CheckInApp from './components/CheckInApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoPage />} />
        <Route path="/checkin" element={<CheckInApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
