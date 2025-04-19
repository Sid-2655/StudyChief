import { useState, useEffect } from 'react';

export default function StudyChief() {
  const [missions, setMissions] = useState([
    { task: 'Unit 1 – Session 1', duration: 10 },
    { task: 'Unit 2 – Session 1', duration: 15 },
    { task: 'Unit 3 – Session 1', duration: 20 },
  ]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Client-side check to safely access localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMissions = localStorage.getItem('missions');
      if (savedMissions) {
        setMissions(JSON.parse(savedMissions));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Save updated missions to localStorage whenever missions change
      localStorage.setItem('missions', JSON.stringify(missions));
    }
  }, [missions]);

  const startTimer = (index) => {
    setActiveIndex(index);
    setTimeLeft(missions[index].duration * 60);
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTaskChange = (index, value) => {
    const updated = [...missions];
    updated[index].task = value;
    setMissions(updated);
  };

  const handleDurationChange = (index, value) => {
    const updated = [...missions];
    updated[index].duration = parseInt(value) || 0;
    setMissions(updated);
  };

  const addMission = () => {
    setMissions([...missions, { task: 'New Task', duration: 10 }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-yellow-300 p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-yellow-400 tracking-wide drop-shadow-md">
        StudyChief: Mission Dashboard 🚀
      </h1>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {missions.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-yellow-500/30 backdrop-blur-md bg-white/5 shadow-xl shadow-yellow-900/20 space-y-3 transition duration-300 hover:scale-[1.01]"
          >
            <input
              value={m.task}
              onChange={(e) => handleTaskChange(idx, e.target.value)}
              className="w-full bg-transparent text-lg text-yellow-200 font-semibold focus:outline-none border-b border-yellow-500/30 pb-1"
              placeholder="Enter task"
            />
            <input
              type="number"
              value={m.duration}
              onChange={(e) => handleDurationChange(idx, e.target.value)}
              className="w-full bg-transparent text-sm text-yellow-300 border-b border-yellow-500/20 focus:outline-none pb-1"
              placeholder="Duration (min)"
            />
            <div className="flex justify-between items-center pt-3">
              <button
                onClick={() => startTimer(idx)}
                disabled={activeIndex === idx}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeIndex === idx
                    ? 'bg-yellow-700 text-black cursor-not-allowed'
                    : 'bg-yellow-400 text-black hover:bg-yellow-300'
                }`}
              >
                {activeIndex === idx ? 'Running...' : 'Start'}
              </button>
              {activeIndex === idx && (
                <span className="text-lg font-mono animate-pulse">⏱ {formatTime(timeLeft)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-10">
        <button
          onClick={addMission}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold rounded-xl transition-all duration-300 shadow-md shadow-yellow-800"
        >
          ➕ Add New Task
        </button>
      </div>
    </div>
  );
}
