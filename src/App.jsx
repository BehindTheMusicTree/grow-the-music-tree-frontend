import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppOld from './components/app/AppOld';
import NotFoundPage from './components/NotFoundPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppOld />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}