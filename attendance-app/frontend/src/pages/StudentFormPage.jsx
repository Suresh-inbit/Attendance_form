import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { addAttendance } from '../api';
import {setToggleState, getToggleState} from '../api';
import { getToggleAttendance } from '../api';
function StudentFormPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [showExtraInput, setShowExtraInput] = useState();
  // const [takeAttendance, setTakeAttendance] = useState();
  useEffect(() => {
    (async () => {
      try {
        const state = await getToggleState();
        setShowExtraInput(state);
      } catch (err) {
        console.error('Failed to fetch toggle state', err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const state = await getToggleAttendance();
        // setTakeAttendance(state);
        if (!state) {
          setError('Attendance is currently disabled.');
          console.log(state);

        }
      } catch (err) {
        console.error('Failed to fetch attendance toggle state', err);
      }
    })();
  }, []);
  const validate = () => {
    if (!rollNumber.match(/^[a-zA-Z0-9]+$/)) {
      setError('Roll Number must be alphanumeric.');
      return false;
    }
    if (!name.match(/^[A-Za-z ]+$/)) {
      setError('Name must contain only letters and spaces.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await addAttendance(rollNumber, name, answer);
      if (res.success) {
        setSuccess('Attendance submitted!');
        // setTimeout(() => navigate('/list'), 1000);
        setRollNumber('');
        setName('');
        setAnswer('');
      } else {
        setError(res.message || 'Submission failed.');
      }
    } catch {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <form
        className="bg-white p-8 rounded-lg shadow-lg ring size-max max-w-md"
        onSubmit={handleSubmit}
        aria-label="Student Attendance Form">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Attendance</h2>
        <div className="mb-4">
          <label htmlFor="rollNumber" className="block mb-1 font-medium">Roll Number</label>
          <input
            id="rollNumber"
            type="text"
            value={rollNumber}
            onChange={e => setRollNumber(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            required
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        {showExtraInput && (
        <div className="mb-4">
          <label htmlFor="answer" className="block mb-1 font-medium">Answer</label>
          <input
            id="answer"
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        )}
        
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {success && <div className="mb-2 text-green-600">{success}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default StudentFormPage;
