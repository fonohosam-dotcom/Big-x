import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { useNotificationStore } from '../../stores/notificationStore.ts';

export default function CharityPortal() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  const { data: fund } = useQuery({
    queryKey: ['charity-fund'],
    queryFn: () => api.get('/charity/fund')
  });

  const { data: cases, isLoading } = useQuery({
    queryKey: ['approved-cases'],
    queryFn: () => api.get('/cases') // In real app, filter for approved
  });

  const disburseMutation = useMutation({
    mutationFn: (data: { caseId: string, amount: number }) => 
      api.post('/charity/disburse', data),
    onSuccess: () => {
      addNotification('تم صرف المبلغ بنجاح', 'success');
      queryClient.invalidateQueries({ queryKey: ['charity-fund'] });
      queryClient.invalidateQueries({ queryKey: ['approved-cases'] });
    },
    onError: (error: any) => {
      addNotification(error.message || 'فشل عملية الصرف', 'error');
    }
  });

  const INITIAL_FUND_CAPACITY = 5000;
  const balance = parseFloat(fund?.balance || '0');
  const isLowBalance = balance <= (INITIAL_FUND_CAPACITY * 0.10);

  return (
    <div className="space-y-6">
      {/* Fund Status Card */}
      <div className={`rounded-2xl border shadow-sm p-6 relative overflow-hidden ${isLowBalance ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
        <h2 className="text-xl font-bold text-slate-800 mb-2">رصيد صندوق الجمعية</h2>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-black text-emerald-600">{balance} <span className="text-xl text-emerald-500 font-normal">د.ل</span></div>
          {isLowBalance && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
              إنذار: الرصيد انخفض لأقل من 10%
            </div>
          )}
        </div>
      </div>

      {/* Cases needing funding */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-6">تبني الحالات المعتمدة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <p className="text-slate-400">جاري التحميل...</p>
          ) : cases?.filter((c:any) => c.status === 'approved').map((c: any) => {
            const required = parseFloat(c.requiredAmount || '0');
            const collected = parseFloat(c.collectedAmount || '0');
            const remaining = required > 0 ? required - collected : 0;
            
            return (
              <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">
                    حالة #{c.id.slice(0,6)}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">المتبقي: {remaining} د.ل</span>
                </div>
                <p className="text-sm text-slate-700 mb-4 flex-1">{c.description}</p>
                
                <button
                  onClick={() => {
                    const amount = prompt(`كم تريد الصرف لهذه الحالة؟ (المتبقي: ${remaining})`);
                    if (amount && !isNaN(Number(amount))) {
                      disburseMutation.mutate({ caseId: c.id, amount: Number(amount) });
                    }
                  }}
                  disabled={disburseMutation.isPending || isLowBalance || remaining === 0}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  صرف من الصندوق
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
