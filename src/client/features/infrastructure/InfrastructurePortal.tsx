import { useState, useEffect } from 'react';

export default function InfrastructurePortal() {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 62,
    latency: 124,
    uptime: '15d 4h 2m'
  });

  // Mocking real-time updates for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(20, Math.min(80, prev.memory + (Math.random() * 5 - 2.5))),
        latency: Math.max(50, Math.min(300, prev.latency + (Math.random() * 40 - 20)))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 text-slate-300 font-mono">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          مراقبة البنية التحتية
        </h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-400 tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 mb-2">استهلاك المعالج (CPU)</p>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-white">{metrics.cpu.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${metrics.cpu}%` }}></div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 mb-2">استهلاك الذاكرة (RAM)</p>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-white">{metrics.memory.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.memory}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 mb-2">زمن الاستجابة (Latency)</p>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-white">{metrics.latency.toFixed(0)} ms</p>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3">
            <div className={`h-1.5 rounded-full ${metrics.latency > 150 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, metrics.latency / 3)}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 mb-2">مدة التشغيل (Uptime)</p>
          <div className="flex justify-between items-end">
            <p className="text-xl font-bold text-white">{metrics.uptime}</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 border-t border-slate-700 pt-1">منذ آخر إعادة تشغيل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-4">سجل الأحداث (Logs)</h3>
          <div className="space-y-2 text-xs text-slate-400 max-h-48 overflow-y-auto">
            <p>[{new Date().toISOString()}] INFO: API route /api/cases accessed</p>
            <p>[{new Date(Date.now() - 5000).toISOString()}] INFO: PostgreSQL connection pool active</p>
            <p>[{new Date(Date.now() - 15000).toISOString()}] WARN: Gemini API response time 850ms</p>
            <p>[{new Date(Date.now() - 60000).toISOString()}] INFO: Authentication token refreshed for admin</p>
            <p>[{new Date(Date.now() - 120000).toISOString()}] INFO: New transaction verified via Drizzle</p>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-4">حالة الخدمات المصغرة</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span>PostgreSQL Database</span>
              <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-400/10 rounded-full">Active</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span>Gemini AI Engine</span>
              <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-400/10 rounded-full">Active</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span>Vite Frontend HMR</span>
              <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-400/10 rounded-full">Active</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Node.js API Server</span>
              <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-400/10 rounded-full">Active</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
