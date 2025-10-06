import { useEffect, useState } from 'react';
import { getTransactions, getRoundupTotal } from '../lib/api';

function calcRoundup(amount: number) {
  const ceil = Math.ceil(amount);
  const ru = ceil - amount;
  return ru === 0 ? 1 : Math.round(ru * 100) / 100;
}

export default function Roundup() {
  const [txs, setTxs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const list = await getTransactions();
      setTxs(list);
      const r = await getRoundupTotal();
      setTotal(r.totalRoundup);
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Round-up Tracker</h2>
      <div className="text-sm text-slate-600">Total Available: ₹ {total.toFixed(2)}</div>
      <div className="divide-y rounded border">
        {txs.map((t) => (
          <div key={t.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.description}</div>
              <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div>₹ {t.amount.toFixed(2)}</div>
              <div className="text-xs text-emerald-600">Round-up: ₹ {calcRoundup(Math.abs(t.amount)).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
