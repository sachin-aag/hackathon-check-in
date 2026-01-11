import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InfoPage from './components/InfoPage';
import CheckInApp from './components/CheckInApp';
import JudgePage from './components/JudgePage';
import RankingsPage from './components/RankingsPage';
import VotePage from './components/VotePage';
import FinalRankingsPage from './components/FinalRankingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoPage />} />
        <Route path="/checkin" element={<CheckInApp />} />
        <Route path="/judge" element={<JudgePage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/final-rankings" element={<FinalRankingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
