import React, { useEffect, useState } from 'react';
import { getAllRecords } from '../api';
import { useLocation } from 'react-router-dom';

export default function AllRecordsPage() {
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  useEffect(() => {
    if (location.state?.submitted) {
      setSuccessMessage('✅ Attendance successfully submitted!');
      // Optional: Clear it after a few seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    }
    fetchList();
  }, []);

  if (loading) return <div className="p-4">Loading records...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (records.length === 0) return <div className="p-4">No records found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Attendance Records</h1>

      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-max w-full border text-left">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="p-2 border capitalize">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => (
              <tr key={i} className="border-t even:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="p-2 border">
                    {formatCellValue(record[col])}
                  </td>
                ))}
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
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    return date.toLocaleString();
  }
  return String(value);
}
