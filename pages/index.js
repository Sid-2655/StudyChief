import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiTrash2, FiCheck, FiPlus, FiVolume2, FiVolumeX, FiMoon, FiSun } from 'react-icons/fi';
import { FaFire, FaMedal, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// SSR-safe initialization helper
const initializeState = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const MissionCard = memo(({ 
  mission, 
  index, 
  darkMode, 
  isRunning, 
  timeLeft, 
  activeIndex,
  onTaskChange,
  onDurationChange,
  onDelete,
  onStart,
  onPause,
  onReset,
  onStop
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={`p-6 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl`}
  >
    <div className="flex justify-between items-start">
      <input
        value={mission.task}
        onChange={(e) => onTaskChange(index, e.target.value)}
        className={`w-full text-lg font-medium focus:outline-none ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      />
      <button
        onClick={() => onDelete(mission.id)}
        className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      >
        <FiTrash2 className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
      </button>
    </div>
    
    <div className="flex items-center mt-4 space-x-4">
      <input
        type="number"
        value={mission.duration}
        onChange={(e) => onDurationChange(index, e.target.value)}
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
            onClick={isRunning ? onPause : () => onStart(index)}
            className={`p-3 rounded-full ${isRunning ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {isRunning ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
          <span className={`text-xl font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={onReset}
            className="p-3 rounded-full bg-blue-500 text-white"
          >
            <FiRefreshCw size={18} />
          </button>
          <button
            onClick={onStop}
            className="p-3 rounded-full bg-red-500 text-white"
          >
            <FiCheck size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onStart(index)}
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
));

const formatTime = (secs) => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export default function StudyChiefPro() {
  const [missions, setMissions] = useState(() => 
    initializeState('missions', [
      { id: 1, task: 'Unit 1 – Session 1', duration: 25, completed: false },
      { id: 2, task: 'Unit 2 – Session 1', duration: 15, completed: false },
      { id: 3, task: 'Unit 3 – Session 1', duration: 30, completed: false },
    ])
  );

  const [activeIndex, setActiveIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => 
    initializeState('completedSessions', [])
  );
  const [darkMode, setDarkMode] = useState(() => 
    initializeState('darkMode', true)
  );
  const [soundEnabled, setSoundEnabled] = useState(() => 
    initializeState('soundEnabled', true)
  );
  const [streak, setStreak] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const audioRef = useRef(null);
  const activeMissionRef = useRef();

  // Initialize audio and sync ref
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync ref with current mission
  useEffect(() => {
    activeMissionRef.current = missions[activeIndex]?.duration * 60 || 0;
    if (activeIndex !== null) {
      setTimeLeft(missions[activeIndex].duration * 60);
    }
  }, [missions, activeIndex]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('missions', JSON.stringify(missions));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    localStorage.setItem('completedSessions', JSON.stringify(completedSessions));
  }, [missions, darkMode, soundEnabled, completedSessions]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeMission(activeIndex);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled && audioRef.current) {
        audioRef.current.play();
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activeIndex, soundEnabled]);

  // Streak calculation
  useEffect(() => {
    if (completedSessions.length === 0) return;
    
    const lastSessionDate = new Date(completedSessions[completedSessions.length - 1].date);
    const today = new Date();
    
    const isSameDay = (d1, d2) => 
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    const isConsecutiveDay = (d1, d2) => {
      const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
      return diff >= 1 && diff < 2;
    };

    if (isSameDay(lastSessionDate, today)) {
      setStreak(prev => prev + 1);
    } else if (!isConsecutiveDay(lastSessionDate, today)) {
      setStreak(0);
    }
  }, [completedSessions]);

  const completeMission = useCallback((index) => {
    if (index === null || index >= missions.length) return;
    
    setMissions(prev => prev.map((m, i) => 
      i === index ? {...m, completed: true} : m
    ));
    
    setCompletedSessions(prev => [...prev, {
      task: missions[index].task,
      duration: missions[index].duration,
      date: new Date().toISOString()
    }]);
    
    setActiveIndex(null);
    setIsRunning(false);
  }, [missions]);

  const startTimer = useCallback((index) => {
    setActiveIndex(index);
    setTimeLeft(missions[index].duration * 60);
    setIsRunning(true);
  }, [missions]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setActiveIndex(null);
    setTimeLeft(0);
  }, []);

  const resetTimer = useCallback(() => {
    if (activeIndex !== null) {
      setTimeLeft(missions[activeIndex].duration * 60);
    }
  }, [activeIndex, missions]);

  const addMission = useCallback(() => {
    const newId = missions.length > 0 ? Math.max(...missions.map(m => m.id)) + 1 : 1;
    setMissions(prev => [...prev, { id: newId, task: 'New Task', duration: 25, completed: false }]);
  }, [missions]);

  const deleteMission = useCallback((id) => {
    setMissions(prev => prev.filter(mission => mission.id !== id));
    if (activeIndex !== null && missions[activeIndex].id === id) {
      stopTimer();
    }
  }, [activeIndex, missions, stopTimer]);

  const handleTaskChange = useCallback((index, value) => {
    setMissions(prev => prev.map((m, i) => 
      i === index ? {...m, task: value} : m
    ));
  }, []);

  const handleDurationChange = useCallback((index, value) => {
    const numValue = Math.min(120, Math.max(1, parseInt(value) || 1));
    setMissions(prev => prev.map((m, i) => 
      i === index ? {...m, duration: numValue} : m
    ));
  }, []);

  const calculateTotalStudyTime = useCallback(() => {
    return completedSessions.reduce((total, session) => total + session.duration, 0);
  }, [completedSessions]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-12">
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
              </div>
            ) : (
              <p className={`py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete your first session to see analytics</p>
            )}
          </motion.div>
        )}

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
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    index={index}
                    darkMode={darkMode}
                    isRunning={isRunning}
                    timeLeft={timeLeft}
                    activeIndex={activeIndex}
                    onTaskChange={handleTaskChange}
                    onDurationChange={handleDurationChange}
                    onDelete={deleteMission}
                    onStart={startTimer}
                    onPause={pauseTimer}
                    onReset={resetTimer}
                    onStop={stopTimer}
                  />
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

        <footer className={`mt-12 pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} text-center`}>
          <p className={darkMode ? 'text-gray-500' : 'text-gray-600'}>
            StudyChief Pro © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
