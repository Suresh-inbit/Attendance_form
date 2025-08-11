import React from 'react';
import {QRCodeSVG}  from 'qrcode.react';
import { useLocation } from 'react-router-dom';

const getBaseURL = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5173/`;
};
const API_BASE = getBaseURL() || 'http://localhost:5000/api' ;
function QRCodePage() {
  const location = useLocation();

  // Build full URL for the form page
  const formURL = API_BASE;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Scan to Open Attendance Form</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <QRCodeSVG value={formURL} size={256} />
      </div>

      <p className="mt-4 text-gray-600">
        Or visit: <a href={formURL} className="text-blue-500 underline">{formURL}</a>
      </p>
    </div>
  );
}

export default QRCodePage;
