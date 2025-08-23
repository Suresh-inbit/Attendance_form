import React, { useState, useEffect } from 'react';
import { User, Hash, MessageSquare, CheckCircle, AlertCircle, Loader2, Calendar, Users } from 'lucide-react';
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
  const [showExtraInput, setShowExtraInput] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const [toggleState, attendanceState] = await Promise.all([
          getToggleState(),
          getToggleAttendance()
        ]);
        
        setShowExtraInput(toggleState);
        
        if (!attendanceState) {
          setError('Attendance is currently disabled.');
        }
      } catch (err) {
        console.error('Failed to initialize form', err);
        setError('Failed to load form. Please refresh the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeForm();
  }, []);

  const validate = () => {
    if (!rollNumber) {
      setError('Roll Number is required.');
      return false;
    }
    if (!rollNumber.match(/^[a-zA-Z0-9]+$/)) {
      setError('Roll Number must contain only letters and numbers.');
      return false;
    }
    if (rollNumber.length < 3) {
      setError('Roll Number must be at least 3 characters long.');
      return false;
    }
    if (!name) {
      setError('Name is required.');
      return false;
    }
    if (!name.match(/^[A-Za-z ]+$/)) {
      setError('Name must contain only letters and spaces.');
      return false;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters long.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await addAttendance(rollNumber, name, answer);
      if (res.success) {
        setSuccess('Attendance submitted successfully!');
        // Reset form after successful submission
        setTimeout(() => {
          setRollNumber('');
          setName('');
          setAnswer('');
          setSuccess('');
        }, 2000);
      } else {
        setError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Attendance</h1>
          {/* <p className="text-gray-600">Mark your attendance for today's session</p> */}
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour:'2-digit',
              minute:'numeric'
            })}</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roll Number Input */}
            <div className="space-y-2">
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="rollNumber"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="e.g., EE25X001"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2" >
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Conditional Answer Input */}
            {showExtraInput && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                  Additional Response
                  <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="answer"
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Your response..."
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <span>Mark Attendance</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        {/* <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Having trouble? Contact your administrator for assistance.
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default StudentFormPage;