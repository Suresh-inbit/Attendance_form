const getBaseURL = () => {
  const hostname = window.location.hostname;
  return  `http://${hostname}:5000/api`;
};

const API_BASE = getBaseURL() || 'http://localhost:5000/api' || 'http://127.0.0.1:5000/api';
import axios from 'axios';
export async function addAttendance(rollNumber, name, optionalField) {
  const res = await fetch(`${API_BASE}/attendance/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rollNumber, name , optionalField }),
  });
  return res.json();
}

export async function getAttendanceList(date) {
  const url = date ? `${API_BASE}/attendance/list?date=${encodeURIComponent(date)}` : `${API_BASE}/attendance/list`;
  const res = await fetch(url);
  return res.json();
}
export async function getAllRecords() {
    const url = `${API_BASE}/attendance/list-all`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch records');
    }
    return res.json();
}
export async function deleteAttendance(rollNumber, date, ipAddress) {
  const res = await fetch(`${API_BASE}/attendance/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rollNumber, date , ipAddress}),
  });
  return res.json();
}

export const setToggleState = async (newState) => {
  const res = await fetch(`${API_BASE}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: newState }),
  });
  if (!res.ok) {
    throw new Error('Failed to update toggle state');
  }
  const data = await res.json();
  return data.state; // server should respond with { state: true/false }
};

export const getToggleState = async () => {
  const res = await fetch(`${API_BASE}/toggle`);
  if (!res.ok) {
    throw new Error('Failed to fetch toggle state');
  }
  const data = await res.json();
  return data.state;
};

export const getToggleAttendance = async () => {
  const res = await fetch(`${API_BASE}/toggle/toggle-attendance`);
  if (!res.ok) {
    throw new Error('Failed to fetch attendance toggle state');
  }
  const data = await res.json();
  return data.state;
};

export const setToggleAttendance = async (newState) => {
  const res = await fetch(`${API_BASE}/toggle/toggle-attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: newState }),
  });
  if (!res.ok) {
    throw new Error('Failed to update attendance toggle state');
  }
  const data = await res.json();
  return data.state; // server should respond with { state: true/false }
}

export const getCount = async (Date) => {
  const url = Date ? `${API_BASE}/attendance/count?date=${encodeURIComponent(Date)}` : `${API_BASE}/attendance/list`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch toggle state');
  }
  const count = await res.json();
  return count;
};

// Make API functions globally accessible for console testing
window.addAttendance = addAttendance;
window.getAttendanceList = getAttendanceList;
window.getAllRecords = getAllRecords;
window.deleteAttendance = deleteAttendance;
window.setToggleState = setToggleState;
window.getToggleState = getToggleState;
window.getToggleAttendance = getToggleAttendance;
window.setToggleAttendance = setToggleAttendance;
window.getCount = getCount;
