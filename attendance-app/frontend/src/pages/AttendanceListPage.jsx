import React, { useEffect, useState } from 'react';
import { getAttendanceList } from '../api';
import { Link } from 'react-router-dom';

function AttendanceListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    });

  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

    // Sorting function:
    const handleSort = (key) => {
    if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
    };

    // Sorting the list before rendering:
    const sortedList = React.useMemo(() => {
    // sort list based on sortKey and sortDirection
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    }, [list, sortKey, sortDirection]);

  const fetchList = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [selectedDate]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Attendance List</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded"
            />
          <button
            onClick={fetchList}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          >Refresh</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
        <div className="border rounded-lg overflow-x-auto shadow">
          <table className="min-w-full text-left border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-blue-100 text-gray-700 uppercase text-sm">
                {/* <th className="p-2">Date</th> */}
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
              </tr>
            </thead>
            <tbody>
                {list.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">No submissions yet.</td></tr>
                ) : (
                    sortedList.map((student, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50 even:bg-gray-100">
                        {/* <td className="p-2">{student.attendanceDate}</td> */}
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{student.rollNumber}</td>
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">{new Date(student.timestamp).toLocaleString()}</td>
                        <td className="p-2">{student.ipAddress || 'N/A'}</td>
                    </tr>
                    ))
                )}
            </tbody>

          </table>
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-600 hover:underline">Go to Form</Link>
        </div>
      </div>
    </div>
  );
}

export default AttendanceListPage;
