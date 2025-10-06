import { useState } from 'react';
import { chat } from '../lib/api';

export default function Chatbot() {
  const [input, setInput] = useState('What is an ETF?');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setLoading(true);
    const res = await chat(input);
    setMessages([...newMsgs, { role: 'assistant', content: res.reply }]);
    setInput('');
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold">AI Coach Chatbot</h2>
      <div className="border rounded p-3 min-h-64 bg-white">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block my-1 px-3 py-2 rounded ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-slate-500 text-sm">Thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about investing" />
        <button onClick={send} className="px-4 py-2 bg-emerald-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}
