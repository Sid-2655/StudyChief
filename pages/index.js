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
    <div className="min-h-screen bg-black text-white p-4 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-6">StudyChief: Editable Missions</h1>

      {missions.map((m, idx) => (
        <div key={idx} className="p-4 border rounded-xl border-gray-600 space-y-2">
          <input
            value={m.task}
            onChange={(e) => handleTaskChange(idx, e.target.value)}
            className="w-full bg-transparent text-white text-xl font-semibold"
          />
          <input
            type="number"
            value={m.duration}
            onChange={(e) => handleDurationChange(idx, e.target.value)}
            className="w-full bg-transparent text-white text-sm"
          />
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => startTimer(idx)}
              className="px-4 py-2 bg-gray-700 rounded"
              disabled={activeIndex === idx}
            >
              {activeIndex === idx ? 'Running...' : 'Start'}
            </button>
            {activeIndex === idx && (
              <span className="text-lg font-mono">⏱️ {formatTime(timeLeft)}</span>
            )}
          </div>
        </div>
      ))}

      <div className="text-center pt-4">
        <button
          onClick={addMission}
          className="px-6 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700"
        >
          ➕ Add Task
        </button>
      </div>
    </div>
  );
}
