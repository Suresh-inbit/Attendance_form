import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // You'll need to add this import in your actual code
// import { useLocation } from 'react-router-dom'; // You'll need to add this import in your actual code
import { 
  QrCode, 
  Users, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Smartphone, 
  Monitor,
  CheckCircle,
  AlertCircle,
  Copy,
  Share2,
  Calendar,
  TrendingUp
} from 'lucide-react';

// Mock QR Code component for demo - replace with actual QRCodeSVG
// const QRCodeSVG = ({ value, size, level, includeMargin, className }) => (
//   <div 
//     className={`bg-white border-2 border-gray-200 flex items-center justify-center ${className}`}
//     style={{ width: size, height: size }}
//   >
//     <div className="text-center p-4">
//       <div className="text-xs text-gray-500 mb-2">QR Code</div>
//       <div className="text-xs text-gray-400 break-all">{value}</div>
//     </div>
//   </div>
// );

// Import your existing API function - add this to your actual code
import { getCount } from '../api';



function QRCodePage() {
  // const location = useLocation(); // Add this import in your actual code
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  let today = new Date().toISOString().split('T')[0];

  const getBaseURL = () => {
    const hostname = window.location.hostname;
    return `http://${hostname}/`;
  };

  const fetchCount = async (isInitial = false) => {
    if (!isInitial) setRefreshing(true);
    setError('');
    
    try {
      const res = await getCount(today);
      if (res.success) {
        setCount(res.count);
        setLastUpdated(new Date());
      } else {
        setError('Failed to get attendance count.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      if (!isInitial) setRefreshing(false);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL');
    }
  };
  const formatLastUpdated = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance QR Code</h1>
          {/* <p className="text-gray-600 max-w-md mx-auto">
            Students can scan this QR code or use the link below to mark their attendance
          </p> */}
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 pb-2 border border-gray-100">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Scan to Mark Attendance
                </h2>
                
                <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-inner mb-6">
                  <QRCodeSVG 
                    value={formURL} 
                    size={240}
                    level="M"
                    // includeMargin={true}
                    className="drop-shadow-sm"
                  />
                </div>

              
                {/* URL Section */}
                <div className="bg-gray-50 rounded-xl p-2 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Direct Link:</p>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a 
                      href={formURL} 
                      className="text-blue-600 hover:text-blue-800 transition-colors flex-1 text-left truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formURL}
                    </a>
                    <div className="flex gap-1">
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                    </div>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-600 mt-2 animate-in fade-in duration-200">
                      Link copied to clipboard!
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats and Info Section */}
          <div className="space-y-6">
            {/* Attendance Count */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Today's Attendance</h3>
              </div>
              
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-green-600 mb-2">{count}</div>
                <p className="text-gray-600">Students Present</p>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatLastUpdated(lastUpdated)}</span>
                  {refreshing && (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              <button
                onClick={() => fetchCount(false)}
                disabled={refreshing}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Count</span>
              </button>
            </div>


            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={API_BASE+'admin'}
                  onClick={(e) => { alert('Navigate to /admin'); }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>View Full List</span>
                </a>
                <a
                  href={formURL}
                  onClick={(e) => {alert('Navigate to /'); }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Form</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodePage;