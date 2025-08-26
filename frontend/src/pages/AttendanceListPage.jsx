import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Download, 
  Users, 
  Settings, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Filter,
  Trash2,
  Clock,
  MapPin,
  UserCheck,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// Import your existing API functions
import { getAttendanceList } from '../api';
import { setToggleState, getToggleState } from '../api';
import { setToggleAttendance, getToggleAttendance } from '../api';
import { deleteAttendance } from '../api';

// Import utility functions from your existing utils
import { downloadCSV, updateSort, sortList, formatTime12Hour } from '../utils/formUtils';

function AttendanceListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExtraInput, setShowExtraInput] = useState(false);
  const [takeAttendance, setTakeAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(today.getHours() + 6);
    return today.toISOString().split('T')[0];
  });

  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleDelete = async (rollNumber, ipAddress) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${rollNumber}?`);
    if (!confirmDelete) return;

    try {
      const res = await deleteAttendance(rollNumber, selectedDate, ipAddress);
      if (res.success) {
        setList(prevList => prevList.filter(student => student.rollNumber !== rollNumber));
      } else {
        alert(`Delete failed: ${res.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error while deleting.');
    }
  };

  useEffect(() => {
    Promise.all([getToggleAttendance(), getToggleState()])
      .then(([attendanceState, extraInputState]) => {
        setTakeAttendance(attendanceState);
        setShowExtraInput(extraInputState);
      });
  }, []);

  const handleToggleAttendance = async () => {
    const updatedState = await setToggleAttendance(!takeAttendance);
    setTakeAttendance(updatedState);
  };

  const handleToggle = async () => {
    const updatedState = await setToggleState(!showExtraInput);
    setShowExtraInput(updatedState);
  };

  const handleSort = (key) => {
    const [newSortKey, newSortDirection] = updateSort(sortKey, sortDirection, key);
    setSortKey(newSortKey);
    setSortDirection(newSortDirection);
  };

  const filteredList = useMemo(() => {
    if (!searchQuery) return list;
    return list.filter(student =>
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.optionalField && student.optionalField.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [list, searchQuery]);

  const sortedList = useMemo(() => 
    sortList(filteredList, sortKey, sortDirection),
    [filteredList, sortKey, sortDirection]
  );

  const fetchList = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    if (!isInitial) setRefreshing(true);
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
    if (!isInitial) setRefreshing(false);
  };

  useEffect(() => {
    fetchList(true);
    const intervalId = setInterval(() => fetchList(false), 10000);
    return () => clearInterval(intervalId);
  }, [selectedDate]);

  const handleDownloadClick = () => {
    const headers = ['#', 'Roll Number', 'Name', 'Submission Time', 'IP Address'];
    if (showExtraInput) headers.push('Answer');
    downloadCSV(sortedList, `attendance_${selectedDate}.csv`, headers);
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
                <p className="text-gray-600">Manage and track student attendance</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => fetchList(false)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Additional Input Field</h3>
                    <p className="text-sm text-gray-600">Show extra response field in forms</p>
                  </div>
                  <button
                    onClick={handleToggle}
                    className="relative inline-flex items-center"
                  >
                    {showExtraInput ? (
                      <ToggleRight className="w-8 h-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Attendance Collection</h3>
                    <p className="text-sm text-gray-600">Enable/disable attendance submissions</p>
                  </div>
                  <button
                    onClick={handleToggleAttendance}
                    className="relative inline-flex items-center"
                  >
                    {takeAttendance ? (
                      <ToggleRight className="w-8 h-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Today's Summary</h3>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Present</span>
                  <span className="font-bold text-2xl text-green-600">{sortedList.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    takeAttendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {takeAttendance ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-11 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Date Picker */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by roll number, name, or response..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">⚠️ {error}</div>
              <button
                onClick={() => fetchList(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('rollNumber')}
                    >
                      <div className="flex items-center gap-2">
                        Roll Number
                        <SortIcon column="rollNumber" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        <SortIcon column="name" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time
                        <SortIcon column="timestamp" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        IP Address
                      </div>
                    </th>
                    {showExtraInput && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedList.length === 0 ? (
                    <tr>
                      <td colSpan={showExtraInput ? 6 : 5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p className="text-lg">No attendance records found</p>
                          {/* <p className="text-sm">Students will appear here once they submit attendance</p> */}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedList.map((student, idx) => (
                      <tr key={`${student.rollNumber}-${idx}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.rollNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            {/* <span>{student.attendanceDate.split('T')[0]}</span> */}
                            <span className="text-md">{formatTime12Hour(student.timestamp)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                            {student.ipAddress || 'N/A'}
                          </span>
                        </td>
                        {showExtraInput && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              student.optionalField 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {student.optionalField || 'No response'}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Form</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AttendanceListPage;