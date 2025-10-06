import { useEffect, useState } from 'react';
import { getLeaderboard } from '../lib/api';

export default function Leaderboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => setRows(await getLeaderboard()))();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-right">Total Invested (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name || 'Anonymous'}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 text-right">{Number(u.totalInvested || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
