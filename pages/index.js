import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiTrash2, FiCheck, FiPlus, FiSettings, FiVolume2, FiVolumeX, FiMoon, FiSun } from 'react-icons/fi';
import { FaFire, FaMedal, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyChiefPro() {
  // Core State
  const [missions, setMissions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('missions');
      return saved ? JSON.parse(saved) : [
        { id: 1, task: 'Unit 1 – Session 1', duration: 25, completed: false },
        { id: 2, task: 'Unit 2 – Session 1', duration: 15, completed: false },
        { id: 3, task: 'Unit 3 – Session 1', duration: 30, completed: false },
      ];
    }
    return [];
  });

  const [activeIndex, setActiveIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const audioRef = useRef(null);

  // Sound Effects
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('missions', JSON.stringify(missions));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [missions, darkMode, soundEnabled]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (soundEnabled && audioRef.current) {
        audioRef.current.play();
      }
      setIsRunning(false);
      if (activeIndex !== null) {
        completeMission(activeIndex);
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, isRunning, activeIndex, soundEnabled]);

  // Streak Calculation
  useEffect(() => {
    const today = new Date().toDateString();
    const lastSession = completedSessions[completedSessions.length - 1]?.date;
    if (lastSession === today) {
      setStreak(prev => prev + 1);
    } else if (lastSession && new Date(lastSession).getDate() !== new Date(today).getDate() - 1) {
      setStreak(0);
    }
  }, [completedSessions]);

  // Core Functions
  const startTimer = (index) => {
    setActiveIndex(index);
    setTimeLeft(missions[index].duration * 60);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setActiveIndex(null);
    setTimeLeft(0);
  };

  const resetTimer = () => {
    if (activeIndex !== null) {
      setTimeLeft(missions[activeIndex].duration * 60);
    }
  };

  const completeMission = (index) => {
    const updated = [...missions];
    updated[index].completed = true;
    setMissions(updated);
    setCompletedSessions(prev => [...prev, {
      task: missions[index].task,
      duration: missions[index].duration,
      date: new Date().toISOString()
    }]);
    setActiveIndex(null);
  };

  const addMission = () => {
    const newId = missions.length > 0 ? Math.max(...missions.map(m => m.id)) + 1 : 1;
    setMissions([...missions, { id: newId, task: 'New Task', duration: 25, completed: false }]);
  };

  const deleteMission = (id) => {
    setMissions(missions.filter(mission => mission.id !== id));
    if (activeIndex !== null && missions[activeIndex].id === id) {
      stopTimer();
    }
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const calculateTotalStudyTime = () => {
    return completedSessions.reduce((total, session) => total + session.duration, 0);
  };

  // UI Components
  const MissionCard = ({ mission, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-6 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl`}
    >
      <div className="flex justify-between items-start">
        <input
          value={mission.task}
          onChange={(e) => {
            const updated = [...missions];
            updated[index].task = e.target.value;
            setMissions(updated);
          }}
          className={`w-full text-lg font-medium focus:outline-none ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        />
        <button
          onClick={() => deleteMission(mission.id)}
          className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <FiTrash2 className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>
      
      <div className="flex items-center mt-4 space-x-4">
        <input
          type="number"
          value={mission.duration}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            if (value > 0 && value <= 120) {
              const updated = [...missions];
              updated[index].duration = value;
              setMissions(updated);
            }
          }}
          className={`w-16 px-3 py-1 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          min="1"
          max="120"
        />
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>minutes</span>
      </div>

      <div className="flex justify-between items-center mt-6">
        {activeIndex === index ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={isRunning ? pauseTimer : () => setIsRunning(true)}
              className={`p-3 rounded-full ${isRunning ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}
            >
              {isRunning ? <FiPause size={18} /> : <FiPlay size={18} />}
            </button>
            <span className={`text-xl font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-blue-500 text-white"
            >
              <FiRefreshCw size={18} />
            </button>
            <button
              onClick={stopTimer}
              className="p-3 rounded-full bg-red-500 text-white"
            >
              <FiCheck size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startTimer(index)}
            className={`px-5 py-2 rounded-lg font-medium ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white transition-colors`}
          >
            Start Session
          </button>
        )}
        {mission.completed && (
          <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
            Completed
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              StudyChief Pro
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your ultimate productivity companion
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-3 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              title="Analytics"
            >
              <FaChartLine className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              title={soundEnabled ? "Sound On" : "Sound Off"}
            >
              {soundEnabled ? (
                <FiVolume2 className={darkMode ? 'text-green-400' : 'text-green-600'} />
              ) : (
                <FiVolumeX className={darkMode ? 'text-red-400' : 'text-red-600'} />
              )}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <FiSun className="text-yellow-400" />
              ) : (
                <FiMoon className="text-gray-700" />
              )}
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        <div className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
              <FaFire className={`text-2xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Streak</p>
              <p className="text-2xl font-bold">{streak} days</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
              <FiCheck className={`text-2xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions Completed</p>
              <p className="text-2xl font-bold">{completedSessions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <FaMedal className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Study Time</p>
              <p className="text-2xl font-bold">{calculateTotalStudyTime()} mins</p>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden`}
          >
            <h3 className="text-xl font-bold mb-4">Your Study Analytics</h3>
            {completedSessions.length > 0 ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">Recent Sessions</h4>
                  <ul className="space-y-2">
                    {completedSessions.slice(0, 5).map((session, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{session.task}</span>
                        <span>{session.duration} mins</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* More analytics can be added here */}
              </div>
            ) : (
              <p className={`py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete your first session to see analytics</p>
            )}
          </motion.div>
        )}

        {/* Missions List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Study Missions</h2>
            <button
              onClick={addMission}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white transition-colors`}
            >
              <FiPlus />
              <span>Add Mission</span>
            </button>
          </div>

          <AnimatePresence>
            {missions.length > 0 ? (
              <div className="grid gap-6">
                {missions.map((mission, index) => (
                  <MissionCard key={mission.id} mission={mission} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
              >
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No missions yet. Add your first study session!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className={`mt-12 pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} text-center`}>
          <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>
            StudyChief Pro © {new Date().getFullYear()} • Built with ❤️ for productive minds
          </p>
        </footer>
      </div>
    </div>
  );
}
