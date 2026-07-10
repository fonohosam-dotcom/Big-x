import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { useState } from 'react';

export default function DonorPortal() {
  const queryClient = useQueryClient();
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { data: cases, isLoading } = useQuery({
    queryKey: ['approved-cases'],
    queryFn: () => api.get('/cases') // In real app, filter for approved only
  });

  const donateMutation = useMutation({
    mutationFn: (data: { targetId: string, amount: number, paymentMethod: string }) => 
      api.post('/donations/process', { ...data, targetType: 'case' }),
    onSuccess: (data) => {
      setSuccessMsg(`تم إتمام التبرع بنجاح عبر ${data.donation.paymentMethod}. رقم المعاملة: ${data.paymentResult.transactionId}`);
      setSelectedCase(null);
      queryClient.invalidateQueries({ queryKey: ['approved-cases'] });
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Gamification / Stats Sidebar */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <h3 className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          لوحة التأثير الإنساني
        </h3>
        <div className="flex-1 flex flex-col justify-start items-center text-center space-y-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle cx="64" cy="64" r="56" stroke="#f59e0b" strokeWidth="8" fill="transparent" strokeDasharray="351" strokeDashoffset="105" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 tracking-tighter">12</span>
              <span className="text-[10px] text-amber-600 font-bold uppercase">متبرع ماسي</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl w-full border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">إجمالي تبرعاتك</p>
            <p className="text-xl font-bold text-emerald-600">8,500 د.ل</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl w-full border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">حالات قمت بمساعدتها</p>
            <p className="text-xl font-bold text-blue-600">4 عائلات</p>
          </div>
        </div>
      </div>

      {/* Cases needing funding */}
      <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">حالات معتمدة بحاجة لدعمك</h2>
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold text-sm">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <p className="text-slate-400">جاري التحميل...</p>
          ) : cases?.filter((c:any) => c.status === 'approved').map((c: any) => (
            <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">{c.needsType}</span>
                <span className="text-sm font-bold text-emerald-700">{c.requiredAmount ? `${c.requiredAmount} د.ل` : 'مبلغ مفتوح'}</span>
              </div>
              <p className="text-sm text-slate-700 mb-4 flex-1">{c.description}</p>
              
              {selectedCase?.id === c.id ? (
                <form 
                  className="mt-4 pt-4 border-t border-slate-200 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    donateMutation.mutate({
                      targetId: c.id,
                      amount: Number(formData.get('amount')),
                      paymentMethod: formData.get('paymentMethod') as string
                    });
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (د.ل)</label>
                    <input type="number" name="amount" min="1" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" defaultValue={c.requiredAmount || 100} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                    <select name="paymentMethod" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="mobicash">موبي كاش</option>
                      <option value="sadad">سداد</option>
                      <option value="lypay">LyPay</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={donateMutation.isPending} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
                      {donateMutation.isPending ? 'جاري المعالجة...' : 'تأكيد التبرع'}
                    </button>
                    <button type="button" onClick={() => setSelectedCase(null)} className="px-4 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300">
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setSelectedCase(c)}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors mt-auto"
                >
                  تبرع الآن
                </button>
              )}
            </div>
          ))}
          {cases?.filter((c:any) => c.status === 'approved').length === 0 && (
            <p className="text-slate-400 text-sm col-span-2">لا توجد حالات معتمدة بانتظار التمويل حالياً.</p>
          )}
        </div>
      </div>
    </div>
  );
}
