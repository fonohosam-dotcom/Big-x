import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';

export default function AdminPortal() {
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['all-cases-admin'],
    queryFn: () => api.get('/cases')
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/cases/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-cases-admin'] });
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Central Admin Hub */}
      <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-5 flex flex-col text-white shadow-xl">
        <div className="space-y-1 mb-8">
          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">المركز المركزي</p>
          <p className="text-xl font-bold">لوحة الإدارة النهائية</p>
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-24 bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">بانتظار الاعتماد</p>
            <p className="text-2xl font-bold text-amber-400">
              {cases?.filter((c:any) => c.status === 'under_review').length || 0}
            </p>
          </div>
          <div className="flex-1 h-24 bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">معتمد</p>
            <p className="text-2xl font-bold text-emerald-400">
              {cases?.filter((c:any) => c.status === 'approved' || c.status === 'funded').length || 0}
            </p>
          </div>
        </div>
        
        <button className="w-full py-3 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors mt-auto">
          إصدار التقارير النهائية
        </button>
      </div>

      {/* Main Approval Queue */}
      <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            دفتر الأستاذ & الاعتماد النهائي
          </h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">Drizzle Sync Active</span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">الاحتياج</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">جاري التحميل...</td></tr>
              ) : cases?.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-800">#{c.id.slice(0,8)}</td>
                  <td className="py-4 px-4">{c.needsType}</td>
                  <td className="py-4 px-4 font-bold">{c.requiredAmount ? `${c.requiredAmount} د.ل` : '-'}</td>
                  <td className="py-4 px-4">
                    {c.status === 'under_review' && <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">مُقيّم (بانتظار الاعتماد)</span>}
                    {c.status === 'approved' && <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">معتمد</span>}
                    {c.status === 'funded' && <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded">مُموّل</span>}
                    {c.status === 'pending' && <span className="text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded">غير مُقيّم</span>}
                  </td>
                  <td className="py-4 px-4 text-left">
                    {c.status === 'under_review' && (
                      <button 
                        onClick={() => approveMutation.mutate(c.id)}
                        disabled={approveMutation.isPending}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
                      >
                        {approveMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد نهائي'}
                      </button>
                    )}
                    {(c.status === 'approved' || c.status === 'funded') && (
                      <span className="text-emerald-600 font-mono text-xs">0x{c.id.slice(0,6)}...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
