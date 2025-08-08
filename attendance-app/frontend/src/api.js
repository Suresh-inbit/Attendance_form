const getBaseURL = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api/attendance`;
};

const API_BASE = getBaseURL();
import axios from 'axios';
export async function addAttendance(rollNumber, name, optionalField) {
  const res = await fetch(`${API_BASE}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rollNumber, name , optionalField }),
  });
  return res.json();
}

export async function getAttendanceList(date) {
  const url = date ? `${API_BASE}/list?date=${encodeURIComponent(date)}` : `${API_BASE}/list`;
  const res = await fetch(url);
  return res.json();
}
export async function getAllRecords() {
    const url = `${API_BASE}/all`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch records');
    }
    return res.json();
}


