import React, { useEffect, useState } from 'react';
import { getAllRecords , deleteAttendance} from '../api';
export default function AllRecordsPage() {
  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllRecords();
      if (res.success) {
        const data = res.data || [];
        setRecords(data); 
        setColumns(data.length > 0 ? Object.keys(data[0]) : []);
      } else {
        setError('Failed to fetch list.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };
    const handleDelete = async (rollNumber,date, ipAddress) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete roll number ${rollNumber}, ${date}, ${ipAddress}, ?`);
    if (!confirmDelete) return;
  
    try {
      const res = await deleteAttendance(rollNumber, date, ipAddress);
      // alert(res.success);
      if (res.success) {
        // Remove the deleted student from the state
        setRecords((prevList) => prevList.filter((record) => record.rollNumber !== rollNumber));
      } else {
        alert(`Delete failed: ${res.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error while deleting.');
    }
  };
  
  useEffect(()=>{
      fetchList();
    }, []);
  if (loading) return <div className="p-4">Loading records...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (records.length === 0) return <div className="p-4">No records found.</div>;

  return (
    <div className="p-4 bg-blue-100 ">
      <h1 className="text-2xl font-bold mb-4">All Attendance Records</h1> 
      {/* <div className='inline-flex mb-4 items-center gap-2'>
        Enter Date and IP:
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          id="ip"
          placeholder="IP Address"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={() => handleDelete('', date, ipAddress)}
          className="bg-red-300 gap-4 px-8 text-center rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div> */}

      <div className="overflow-x-auto bg-white">
        <table className="min-w-max w-full border text-left rounded border-radius-lg">
          <thead className="bg-gray-300">
            <tr>
              {columns.map((col) => (
                <th key={col} className="p-2 border capitalize text-center">{col}</th>
              ))}
              <th className='p-2 text-center'> Delete</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => (
              <tr key={i} className="border-t even:bg-gray-100">
                {columns.map((col) => (
                  <td key={col} className="p-2 border ">
                    {formatCellValue(record[col])}
                  </td>
                ))}
                <td className='text-center'>
                  <button
                    onClick={() => handleDelete(record.rollNumber, record.attendanceDate, record.ipAddress)}
                    className="bg-red-300 px-2 text-center rounded hover:bg-red-600 transition"
                  >
                    <p>Delete</p>
                  </button>        
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('T')) {
    const date = new Date(value);
    return date.toISOString().replace('T', ' ').slice(0, 19); // Format as YYYY-MM-DD HH:MM:SS
  }
  return String(value);
}
