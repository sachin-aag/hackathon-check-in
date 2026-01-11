import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InfoPage from './components/InfoPage';
import CheckInApp from './components/CheckInApp';
import JudgePage from './components/JudgePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoPage />} />
        <Route path="/checkin" element={<CheckInApp />} />
        <Route path="/judge" element={<JudgePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
