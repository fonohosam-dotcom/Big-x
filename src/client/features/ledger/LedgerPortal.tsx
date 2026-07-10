import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';

export default function LedgerPortal() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['ledger-transactions'],
    queryFn: () => api.get('/ledger/transactions')
  });

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-600"></div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          دفتر الأستاذ غير القابل للتعديل (Immutable Ledger)
        </h2>
        <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-emerald-400 border border-slate-700">Network: TakafulNet</span>
      </div>
      
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-900 text-slate-400 font-mono text-xs uppercase tracking-wider">
            <tr className="border-b border-slate-700">
              <th className="py-3 px-4">رقم المعاملة (Hash)</th>
              <th className="py-3 px-4">التاريخ والوقت</th>
              <th className="py-3 px-4">القيمة</th>
              <th className="py-3 px-4">المرسل</th>
              <th className="py-3 px-4">المستفيد</th>
              <th className="py-3 px-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 font-mono text-xs">
            {isLoading ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">جاري مزامنة السجلات...</td></tr>
            ) : transactions?.length === 0 ? (
               <tr><td colSpan={6} className="py-8 text-center text-slate-500">لا توجد معاملات مسجلة بعد</td></tr>
            ) : transactions?.map((t: any) => (
              <tr key={t.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-4 text-emerald-400">{t.id.slice(0,10)}...</td>
                <td className="py-4 px-4 text-slate-300">{t.date}</td>
                <td className="py-4 px-4 font-bold text-white">{t.amount} د.ل</td>
                <td className="py-4 px-4 text-slate-300">{t.from}</td>
                <td className="py-4 px-4 text-slate-300">{t.to}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
