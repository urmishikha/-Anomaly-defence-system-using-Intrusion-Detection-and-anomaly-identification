import { useEffect, useState } from 'react';
import { getGoals, createGoal } from '../lib/api';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [name, setName] = useState('New Phone');
  const [target, setTarget] = useState(5000);

  useEffect(() => {
    (async () => setGoals(await getGoals()))();
  }, []);

  async function addGoal() {
    const g = await createGoal(name, Number(target));
    setGoals((prev) => [g, ...prev]);
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Savings Goals</h2>
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Goal name" />
        <input className="border rounded px-3 py-2 w-32" type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} placeholder="Target" />
        <button onClick={addGoal} className="px-4 py-2 bg-emerald-600 text-white rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {goals.map((g) => (
          <li key={g.id} className="border rounded p-3 flex justify-between">
            <span className="font-medium">{g.name}</span>
            <span className="text-slate-600">₹ {g.targetAmount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
