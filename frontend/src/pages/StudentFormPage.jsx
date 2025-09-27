import React, { useState, useEffect, use } from 'react';
import { User, Hash, MessageSquare, CheckCircle, AlertCircle, Loader2, Calendar, Users, TriangleAlert, CalendarDays, CalendarX2} from 'lucide-react';
import { addAttendance, getLeaveCount } from '../api';
import {setToggleState, getToggleState} from '../api';
import { getToggleAttendance } from '../api';

function StudentFormPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leaveCount, setLeaveCount] = useState(0);
  const [showExtraInput, setShowExtraInput] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localRollNumber, setLocalRollNumber] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const localStorageKey = `attendance_${today}`;
  const localRollNumberKey = `rollNumber`;

  useEffect(() => {
    const storedRollNumber = localStorage.getItem(localRollNumberKey);
    if (storedRollNumber) {
      setLocalRollNumber(storedRollNumber);
        // setRollNumber(storedRollNumber); // Pre-fill the roll number field
    }
    }, [localRollNumberKey]);

  useEffect(() => {
    if (rollNumber) {
      localStorage.setItem(localRollNumberKey, rollNumber);
      setLocalRollNumber(rollNumber);

    }
  }, [rollNumber, localRollNumberKey]);
  useEffect(() => {
    const alreadySubmitted = localStorage.getItem(localStorageKey);
    if (alreadySubmitted) {
      setIsSubmitted(true);
    }
  }, [localStorageKey]);

  const fetchLeaveCount = async (rollNum) => {
  if (!rollNum) {
    console.warn('No roll number provided for leave count fetch');
    return;
  }
  
  setError('');
  
  try {
    const res = await getLeaveCount(rollNum);
    console.log('Leave count response:', res);
    if (res.success) {
      setLeaveCount(res.count);
      setTotalCount(res.totalCount);
    } else {
      setError('Failed to fetch leave count.');
    }
  } catch (error) {
    setError('Network error fetching leave count.');
  }
};
useEffect(() => {
  const storedRollNumber = rollNumber || localStorage.getItem(localRollNumberKey);
  if (isSubmitted) {
    fetchLeaveCount(storedRollNumber);
  }
}, [isSubmitted, rollNumber]);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const [toggleState, attendanceState] = await Promise.all([
          getToggleState(),
          getToggleAttendance()
        ]);
        
        setShowExtraInput(toggleState);
        
        if (!attendanceState) {
          setError('Attendance is disabled.');
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
        // Store submission status in localStorage
        localStorage.setItem(localStorageKey, 'true');
        setIsSubmitted(true);
        // Reset form after a brief delay to show the success message
        setTimeout(() => {
          setRollNumber('');
          setName('');
          setAnswer('');
          setSuccess('');
        }, 2000);
      } 
      else if (res.message === 'Roll number already marked present.') {
          setError(res.message);
          // Also set the local flag to prevent further attempts
          localStorage.setItem(localStorageKey, 'true');
          setIsSubmitted(true);
          console.log("Attendance already marked");
      }
      else {
        setError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      // Add a 3-second delay before hiding the loading state.
      // This ensures the user sees the success/error message for a moment.
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };
  // if (isSubmitted) {
  //       return (
  //           <div>
  //               <h2>✅ Thank You!</h2>
  //               <p>Your attendance for today has already been recorded.</p>
  //           </div>
  //       );
  //   }
  // if (isInitializing) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading attendance form...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Attendance</h1>
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
        {!isSubmitted && (
            
          
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
        )}
        
        {isSubmitted && (
          // Display Roll Number if available
          <div className="">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4 transition-all animate-in slide-in-from-left-2 duration-400">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">Your attendance for today has already been marked.</span>
            </div>  
            <div className="flex items-center mb-4 gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <Hash className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Roll Number: {localRollNumber}</span>
            </div>
            <div
              className={` text-bold text-sm mb-4 font-semibold border rounded-xl p-4 
                ${leaveCount<0?"text-red-600 bg-yellow-50 border-yellow-200":leaveCount/totalCount > 0.25 
                  ? "text-red-600 bg-red-50 border-red-200" 
                  : "text-green-600 bg-green-50 border-green-200"}`
              }
            >
              {leaveCount==0 &&totalCount==0
                ? "Loading...":
              leaveCount<0 
                ? <div className="flex gap-3 ">
                  <TriangleAlert className="h-5 w-5 text-red-500 flex-shrink-0"/>
                  Did you enter correct Roll Number? 
                  </div >:
              leaveCount/totalCount > 0.25
                ? <div className='flex items-center gap-3'>
                    <TriangleAlert className="h-5 w-5 text-red-500 "/>
                    Please attend class regularly! <br />
                    Leave taken: {leaveCount} days
                    <br />
                    Attendance percentage: {totalCount > 0 ? (((totalCount - leaveCount) / totalCount) * 100).toFixed(2) : '0'}%
                  </div>
                : 
                <div className='flex gap-3 text-green-700'>  <CalendarX2 className="h-5 w-5 text-green-500 "/>
                
                Leave taken: {leaveCount} days
                </div>
                }
            </div>
          </div>
        )}

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Having trouble? Contact TA.
          </p>
        </div>
          
      </div>
      
    </div>
  );
  
}

export default StudentFormPage;