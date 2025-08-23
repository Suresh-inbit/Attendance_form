import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentFormPage from './pages/StudentFormPage';
import AttendanceListPage from './pages/AttendanceListPage';
import AllRecordsPage from './pages/AllRecordsPage';
import QRCodePage from './pages/QRPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentFormPage />} />
        <Route path="/admin" element={<AttendanceListPage />} />
        <Route path="/data" element={<AllRecordsPage />} />
        <Route path="/qr" element={<QRCodePage />} />
        <Route path="*" element={<div className="text-center mt-10">Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
