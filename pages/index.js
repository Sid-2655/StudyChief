import { useState, useEffect } from 'react';

export default function Home() {
  const initialSessions = [
    { id: 1, label: '6:00 AM – 8:00 AM | Unit 1', done: false },
    { id: 2, label: '8:45 AM – 10:45 AM | Unit 2 - Part A', done: false },
    { id: 3, label: '11:15 AM – 1:15 PM | Unit 2 - Part B', done: false },
    { id: 4, label: '1:45 PM – 3:45 PM | Unit 3', done: false },
    { id: 5, label: '9:00 PM – 11:00 PM | Unit 4', done: false },
    { id: 6, label: '11:15 PM – 12:00 AM | Unit 5 Overview', done: false }
  ];

  const [sessions, setSessions] = useState([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('studySessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      checkComplete(parsed);
    } else {
      setSessions(initialSessions);
    }
  }, []);

  const toggleSession = (id) => {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, done: !s.done } : s
    );
    setSessions(updated);
    localStorage.setItem('studySessions', JSON.stringify(updated));
    checkComplete(updated);
  };

  const checkComplete = (list) => {
    setComplete(list.every(s => s.done));
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400">🎯 StudyChief: Mission Control</h1>
      <ul className="space-y-4 w-full max-w-md">
        {sessions.map(session => (
          <li key={session.id} className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-xl shadow">
            <span className={session.done ? "line-through text-gray-400" : ""}>{session.label}</span>
            <button
              onClick={() => toggleSession(session.id)}
              className={`ml-4 px-3 py-1 rounded-lg font-bold ${
                session.done ? "bg-green-600 text-white" : "bg-yellow-500 text-black"
              }`}
            >
              {session.done ? "Done" : "Mark"}
            </button>
          </li>
        ))}
      </ul>

      {complete && (
        <div className="mt-10 text-green-400 text-xl font-semibold">
          ✅ All sessions complete! Reward unlocked 🎁
        </div>
      )}
    </main>
  );
}
