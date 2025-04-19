import { useState, useEffect } from 'react';

export default function StudyChief() {
  const [missions, setMissions] = useState([
    { task: 'Unit 1 – Session 1', duration: 10 },
    { task: 'Unit 2 – Session 1', duration: 15 },
    { task: 'Unit 3 – Session 1', duration: 20 },
  ]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (activeIndex !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeIndex !== null) {
      setActiveIndex(null);
    }
    return () => clearInterval(timer);
  }, [timeLeft, activeIndex]);

  const startTimer = (index) => {
    setActiveIndex(index);
    setTimeLeft(missions[index].duration * 60);
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

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const addMission = () => {
    setMissions([...missions, { task: 'New Task', duration: 10 }]);
  };

  return (
    <div className="min-h-screen bg-black text-yellow-300 p-4 space-y-4 font-mono">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-yellow-400 tracking-wider">
        🚀 StudyChief: Mission Control
      </h1>

      {missions.map((m, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl border border-yellow-500 bg-black/40 shadow-md shadow-yellow-800 space-y-3"
        >
          <input
            value={m.task}
            onChange={(e) => handleTaskChange(idx, e.target.value)}
            className="w-full bg-transparent border-b border-yellow-400 focus:outline-none text-xl placeholder-yellow-500"
            placeholder="Task Name"
          />
          <input
            type="number"
            value={m.duration}
            onChange={(e) => handleDurationChange(idx, e.target.value)}
            className="w-full bg-transparent border-b border-yellow-400 focus:outline-none text-sm mt-1 placeholder-yellow-500"
            placeholder="Duration (min)"
          />
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={() => startTimer(idx)}
              disabled={activeIndex === idx}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-bold ${
                activeIndex === idx
                  ? 'bg-yellow-700 text-black'
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
            >
              {activeIndex === idx ? 'Running...' : 'Start'}
            </button>
            {activeIndex === idx && (
              <span className="text-xl animate-pulse">⏱️ {formatTime(timeLeft)}</span>
            )}
          </div>
        </div>
      ))}

      <div className="text-center pt-6">
        <button
          onClick={addMission}
          className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-all duration-300 shadow-md"
        >
          ➕ Add Task
        </button>
      </div>
    </div>
  );
}
