const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;
// console.log(API_BASE);
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
  const res = await fetch(`${API_BASE}/toggle/input`, {
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
  const res = await fetch(`${API_BASE}/toggle/input`);
  if (!res.ok) {
    throw new Error('Failed to fetch toggle state');
  }
  const data = await res.json();
  return data.state;
};

export const getToggleAttendance = async () => {
  const res = await fetch(`${API_BASE}/toggle/attendance`);
  if (!res.ok) {
    throw new Error('Failed to fetch attendance toggle state');
  }
  const data = await res.json();
  return data.state;
};

export const setToggleAttendance = async (newState) => {
  const res = await fetch(`${API_BASE}/toggle/attendance`, {
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

export const getCount = async (date) => {
  const url = date ? `${API_BASE}/attendance/count?date=${encodeURIComponent(date)}` : `${API_BASE}/attendance/list`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch count of students');
  }
  const response = await res.json();
  return response;
};

export const getLeaveCount = async (rollNumber) => {
  const url = `${API_BASE}/attendance/leave-count?rollNumber=${encodeURIComponent(rollNumber)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch present days');
  }
  const response = await res.json();
  return response;
};

export const setCloseAttendance = async () => {
  const res = await fetch(`${API_BASE}/attendance/close-attendance`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to close attendance');
  }
  const data = await res.json();
  console.log(data);
  return data.state; // server should respond with { state: true/false }
};
export const getNoteFromBackend = async () => {
  const res = await fetch(`${API_BASE}/toggle/get-note`);
  if (!res.ok) {
    throw new Error('Failed to fetch note from backend');
  }
  const data = await res.json();
  console.log("Note fetched from backend:", data.note);
  return data.note; // server should respond with { note: "Your note here" }
};
export const setNoteToBackend = async (note) => {
  const res = await fetch(`${API_BASE}/toggle/set-note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  if (!res.ok) {
    throw new Error('Failed to set note to backend');
  }
  const data = await res.json();
  console.log("Note set to backend:", data.note);
  return data.note; // server should respond with { note: "Your note here" }
}
// Make API functions globally accessible for console testing
// window.addAttendance = addAttendance;
// window.getAttendanceList = getAttendanceList;
// window.getAllRecords = getAllRecords;
// window.deleteAttendance = deleteAttendance;
// window.setToggleState = setToggleState;
// window.getToggleState = getToggleState;
// window.getToggleAttendance = getToggleAttendance;
// window.setToggleAttendance = setToggleAttendance;
// window.getCount = getCount;
window.setCloseAttendance = setCloseAttendance