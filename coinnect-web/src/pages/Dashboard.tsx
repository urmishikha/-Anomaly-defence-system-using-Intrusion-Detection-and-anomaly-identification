import { useEffect, useState } from 'react';
import { getMe, getRoundupTotal, investRoundup } from '../lib/api';

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [roundup, setRoundup] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await getMe();
      setMe(m);
      const r = await getRoundupTotal();
      setRoundup(r.totalRoundup);
    })();
  }, []);

  async function onInvest() {
    setLoading(true);
    await investRoundup();
    const r = await getRoundupTotal();
    setRoundup(r.totalRoundup);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">COINNECT Dashboard</h1>
      {me && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-800 text-white">
            <div className="text-sm opacity-80">Welcome</div>
            <div className="text-xl">{me.name || me.email}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800 text-white">
            <div className="text-sm opacity-80">Total Invested</div>
            <div className="text-xl">₹ {me.totalInvested?.toFixed(2) ?? '0.00'}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-800 text-white">
            <div className="text-sm opacity-80">Round-up Available</div>
            <div className="text-xl">₹ {roundup.toFixed(2)}</div>
          </div>
        </div>
      )}
      <button disabled={loading} onClick={onInvest} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">
        Invest Round-up
      </button>
    </div>
  );
}
