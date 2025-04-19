import { useState, useEffect } from 'react';

const initialMissions = [
  { time: '06:00 – 07:30', task: 'Unit 1 – Session 1', duration: 90 },
  { time: '08:15 – 09:45', task: 'Unit 2 – Session 1', duration: 90 },
  { time: '10:00 – 11:30', task: 'Unit 2 – Session 2', duration: 90 },
  { time: '13:30 – 15:00', task: 'Unit 3 – Session 1', duration: 90 },
  { time: '15:15 – 16:45', task: 'Unit 3 – Session 2', duration: 90 },
  { time: '21:00 – 22:15', task: 'Unit 4 – Session', duration: 75 },
  { time: '22:15 – 23:00', task: 'Unit 5 – Session', duration: 45 },
];

export default function StudyChief() {
  const [missions, setMissions] = useState(initialMissions);
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('missions');
    return saved ? JSON.parse(saved) : Array(missions.length).fill(false);
  });
  const [currentMission, setCurrentMission] = useState(0);
  const [timer, setTimer] = useState(missions[currentMission].duration * 60);
  
  // Timer effect
  useEffect(() => {
    if (completed.every(Boolean)) return; // Don't run if all missions are completed

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(interval);
          handleComplete(currentMission);  // Automatically mark current task as completed when timer ends
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);  // Cleanup on unmount or change of mission
  }, [completed, currentMission]);

  // Update local storage when completed status changes
  useEffect(() => {
    localStorage.setItem('missions', JSON.stringify(completed));
  }, [completed]);

  const handleComplete = (index) => {
    const updated = [...completed];
    updated[index] = !updated[index];
    setCompleted(updated);
  };

  const handleTaskChange = (index, newTask, newTime) => {
    const updatedMissions = [...missions];
    updatedMissions[index].task = newTask;
    updatedMissions[index].time = newTime;
    setMissions(updatedMissions);
  };

  const handleStartNewMission = (index) => {
    setCurrentMission(index);
    setTimer(missions[index].duration * 60);  // Set new timer based on mission's duration
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-4">StudyChief: Mission Control</h1>

      <div className="space-y-4">
        {missions.map((m, idx) => (
          <div key={idx} className={`p-4 border rounded-xl ${completed[idx] ? 'border-green-500 bg-green-900/20' : 'border-gray-600'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  <input
                    type="text"
                    value={m.task}
                    onChange={(e) => handleTaskChange(idx, e.target.value, m.time)}
                    className="bg-transparent text-white border-none focus:ring-0"
                  />
                </h2>
                <input
                  type="text"
                  value={m.time}
                  onChange={(e) => handleTaskChange(idx, m.task, e.target.value)}
                  className="text-sm bg-transparent text-white border-none focus:ring-0"
                />
              </div>
              <div>
                {completed[idx] ? (
                  <span className="text-green-700 font-semibold">Done</span>
                ) : (
                  <button
                    onClick={() => handleStartNewMission(idx)}
                    className="px-4 py-2 rounded-lg bg-gray-700"
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm">Time left: {formatTime(timer)}</p>
          </div>
        ))}
      </div>

      {completed.every(Boolean) && (
        <div className="mt-6 p-4 border-2 border-yellow-500 rounded-xl bg-yellow-900/20 text-center">
          <h2 className="text-xl font-bold">🎉 Mission Accomplished!</h2>
          <p className="mt-2">Reward Unlocked: Eat something good or buy a treat 🏆</p>
        </div>
      )}
    </div>
  );
}
