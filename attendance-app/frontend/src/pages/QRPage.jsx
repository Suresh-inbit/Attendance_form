import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation } from 'react-router-dom';
import { getCount } from '../api';

function QRCodePage() {
  const location = useLocation();
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');

  let today = new Date().toISOString().split('T')[0];

  const getBaseURL = () => {
    const hostname = window.location.hostname;
    // Change 5000 to your backend port
    return `http://${hostname}:5173/`; 
  };

  const fetchCount = async (isInitial = false) => {
    setError('');
    try {
      const res = await getCount(today);
      if (res.success) {
        setCount(res.count);
      } else {
        setError('Failed to get count.');
      }
    } catch {
      setError('Network error.');
    }
  };

  useEffect(() => {
    fetchCount(true);
    const intervalId = setInterval(() => {
      fetchCount(false);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [today]);

  const API_BASE = getBaseURL();
  const formURL = API_BASE;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Scan to Open Attendance Form</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <QRCodeSVG value={formURL} size={256} />
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="mt-4 text-gray-600">
        Or visit: <a href={formURL} className="text-blue-500 underline">{formURL}</a>
      </p>
      <p className="mt-2 text-xl">Present: <b>{count}</b></p>
    </div>
  );
}

export default QRCodePage;
