import { useState, useEffect } from 'react';

export default function StudyChief() {
  const [missions, setMissions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('missions');
      return saved ? JSON.parse(saved) : [
        { task: 'Unit 1 – Session 1', duration: 10, completed: false }
      ];
    }
    return [];
  });
  const [activeIndex, setActiveIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalCompletedTime, setTotalCompletedTime] = useState(0);

  useEffect(() => {
    localStorage.setItem('missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    let timer;
    if (activeIndex !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && activeIndex !== null) {
      markCompleted(activeIndex);
      setActiveIndex(null);
    }
    return () => clearInterval(timer);
  }, [timeLeft, activeIndex]);

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
    setMissions([...missions, { task: 'New Task', duration: 10, completed: false }]);
  };

  const markCompleted = (index) => {
    const updated = [...missions];
    if (!updated[index].completed) {
      updated[index].completed = true;
      setTotalCompletedTime((prev) => prev + updated[index].duration);
    }
    setMissions(updated);
  };

  const exportTasks = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(missions));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "missions.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importTasks = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const data = JSON.parse(fileReader.result);
      setMissions(data);
    };
    fileReader.readAsText(e.target.files[0]);
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
                disabled={activeIndex === idx || m.completed}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  m.completed ? 'bg-green-600 text-black cursor-not-allowed' : activeIndex === idx ? 'bg-yellow-700 text-black' : 'bg-yellow-400 text-black hover:bg-yellow-300'
                }`}
              >
                {m.completed ? 'Done' : activeIndex === idx ? 'Running...' : 'Start'}
              </button>
              {activeIndex === idx && (
                <span className="text-lg font-mono animate-pulse">⏱ {formatTime(timeLeft)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-10 space-x-4">
        <button
          onClick={addMission}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold rounded-xl transition-all duration-300 shadow-md shadow-yellow-800"
        >
          ➕ Add New Task
        </button>

        <button
          onClick={exportTasks}
          className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
        >
          📤 Export
        </button>

        <label className="cursor-pointer inline-block px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
          📥 Import
          <input type="file" onChange={importTasks} className="hidden" />
        </label>
      </div>

      <div className="mt-12 max-w-xl mx-auto bg-yellow-900/20 p-4 rounded-xl border border-yellow-700 text-center">
        <h2 className="text-xl font-bold mb-2">📊 Daily Summary</h2>
        <p>Total Tasks: {missions.length}</p>
        <p>Completed: {missions.filter(m => m.completed).length}</p>
        <p>Time Studied: {totalCompletedTime} minutes</p>
      </div>
    </div>
  );
}
