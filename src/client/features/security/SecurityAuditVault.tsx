import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';

export default function SecurityAuditVault() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['audit-transactions'],
    queryFn: () => api.get('/ledger') // Re-using ledger for demo
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Alert Panel */}
      <div className="lg:col-span-4 bg-slate-900 rounded-2xl p-6 flex flex-col text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -top-10 text-red-500/10">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>
        
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          رصد الاحتيال الآلي
        </h2>

        <div className="flex-1 space-y-4 relative z-10">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <p className="text-xs font-bold text-red-400">مراقبة النشطة</p>
            </div>
            <p className="text-sm text-slate-300">يتم تحليل كافة العمليات فوق 5000 د.ل والمحافظ ذات النشاط المرتفع.</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <p className="text-xs text-slate-400 mb-1">عمليات مشبوهة (آخر 24 ساعة)</p>
             <p className="text-3xl font-black text-white">0</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <p className="text-xs text-slate-400 mb-1">إجمالي الحركات المفحوصة</p>
             <p className="text-xl font-bold text-slate-200">{transactions?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Audit Ledger */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 to-slate-900"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">سجل التدقيق الأمني (Vault)</h2>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold font-mono">Drizzle Secure Ledger</span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4">المرجع</th>
                <th className="py-3 px-4">نوع العملية</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">الحالة الأمنية</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">جاري فحص السجلات...</td></tr>
              ) : transactions?.map((tx: any) => {
                const amountNum = parseFloat(tx.amount || '0');
                const isLarge = amountNum > 5000;
                
                return (
                  <tr key={tx.id} className={`transition-colors ${isLarge ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                      {tx.id.slice(0, 12)}...
                    </td>
                    <td className="py-4 px-4">
                      {tx.type === 'credit' ? 'إيداع / تبرع' : 'صرف'}
                      <span className="block text-[10px] text-slate-400 font-mono mt-1">{tx.entityType}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {tx.amount} د.ل
                    </td>
                    <td className="py-4 px-4">
                      {isLarge ? (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                          تتطلب مراجعة (High Value)
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold border border-emerald-100 flex items-center gap-1 w-max">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          مفحوص
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {transactions?.length === 0 && (
            <p className="text-center text-slate-400 py-8">لا توجد حركات في السجل الأمني.</p>
          )}
        </div>
      </div>
    </div>
  );
}
