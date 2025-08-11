import React, { useEffect, useState } from 'react';
import { getAttendanceList } from '../api';
import { Link } from 'react-router-dom';
import { downloadCSV , updateSort, sortList, formatTime12Hour} from '../utils/formUtils'; // Assuming you have a utility function for CSV download
import {setToggleState, getToggleState} from '../api';
import {setToggleAttendance, getToggleAttendance } from '../api';
function AttendanceListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExtraInput, setShowExtraInput] = useState(false);
  const [takeAttendance, setTakeAttendance] = useState(false);

  useEffect(() => {
    // Fetch initial toggle state from backend
    getToggleAttendance().then(state => {
      setTakeAttendance(state);
    });
  }, []);
  
  useEffect(() => {
    // Fetch initial toggle state from backend
    getToggleState().then(state => {
      setShowExtraInput(state);
    });
  }, []);
  const handleToggleAttendance = async () => {
    const updatedState1 = await setToggleAttendance(!takeAttendance);
    setTakeAttendance(updatedState1);
  };
  const handleToggle = async () => {
    const updatedState = await setToggleState(!showExtraInput);
    setShowExtraInput(updatedState);
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(today.getHours() + 6); // Adjusting for timezone
    return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  });

  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (key) => {
    const [newSortKey, newSortDirection] = updateSort(sortKey, sortDirection, key);
    setSortKey(newSortKey);
    setSortDirection(newSortDirection);
  };

  const sortedList = React.useMemo(() => sortList(list, sortKey, sortDirection), 
    [list, sortKey, sortDirection]);
  
  const fetchList = async (isInitial = false) => {
  if (isInitial) setLoading(true); // only show loading on first load
  setError('');
  try {
    const res = await getAttendanceList(selectedDate);
    if (res.success) {
      setList(res.data);
    } else {
      setError('Failed to fetch list.');
    }
  } catch {
    setError('Network error.');
  }
  if (isInitial) setLoading(false);
};


useEffect(() => {
  // initial load
  fetchList(true);

  // auto refresh every 5s without loading spinner
  const intervalId = setInterval(() => {
    fetchList(false);
  }, 10000);

  return () => clearInterval(intervalId);
}, [selectedDate]);

const headers = ['#', 'Roll Number', 'Name', 'Submission Time', 'IP Address'];

const handleDownloadClick = () => {
  downloadCSV(sortedList, `attendance_${selectedDate}.csv`, headers);
};

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4 space-x-2">
          <h2 className="text-xl font-bold">Attendance List</h2>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleDownloadClick}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
          >
            Download CSV
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-md text-gray-800">
            Present Today: <strong>{sortedList.length ? sortedList.length : 0}</strong>
          </p>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <label className="cursor-pointer">Toggle Input </label>
          <button
            onClick={handleToggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              showExtraInput ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                showExtraInput ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        
          <label className="cursor-pointer">Take Attendance </label>
          <button
            onClick={handleToggleAttendance}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              takeAttendance ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                takeAttendance ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="border rounded-xl overflow-x-auto shadow">
            <table className="min-w-full text-left border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-blue-100 text-gray-700 uppercase text-sm">
                  <th className="p-2">#</th>
                  <th className="p-2 cursor-pointer" onClick={() => handleSort('rollNumber')}>
                    Roll Number {sortKey === 'rollNumber' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-2 cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortKey === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-2 cursor-pointer" onClick={() => handleSort('timestamp')}>
                    Submission Time {sortKey === 'timestamp' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-2">IP Address</th>
                   {showExtraInput && <th className="p-2 text-center">Answer</th>}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  sortedList.map((student, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50 even:bg-gray-100">
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">{student.rollNumber}</td>
                      <td className="p-2">{student.name}</td>
                      <td className="p-2">{student.timestamp}</td>

                      {/* <td className="p-2">{new Date(student.timestamp).toLocaleString()}</td> */}
                      <td className="p-2">{student.ipAddress || 'N/A'}</td>
                      {showExtraInput && <td className="p-2 text-center">{student.optionalField || '__'}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-600 hover:underline">
            Go to Form
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AttendanceListPage;
