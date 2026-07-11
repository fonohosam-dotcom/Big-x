import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { RequireAuthAction } from '../../components/RequireAuthAction.tsx';
import { Link } from 'react-router';
import { useNotificationStore } from '../../stores/notificationStore.ts';

export default function DonorPortal() {
  const queryClient = useQueryClient();
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const { addNotification } = useNotificationStore();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['approved-cases'],
    queryFn: () => api.get('/cases/public')
  });

  const donateMutation = useMutation({
    mutationFn: (data: any) => api.post('/donations', data),
    onSuccess: () => {
      addNotification('تم تسجيل تبرعك بنجاح، جزاك الله خيراً', 'success');
      setSelectedCase(null);
      queryClient.invalidateQueries({ queryKey: ['approved-cases'] });
    },
    onError: (error: any) => {
      addNotification(error.message || 'فشل التبرع', 'error');
    }
  });

  const voteMutation = useMutation({
    mutationFn: (caseId: string) => api.post(`/cases/${caseId}/vote`, {}),
    onSuccess: () => {
      addNotification('تم التصويت بنجاح', 'success');
      queryClient.invalidateQueries({ queryKey: ['approved-cases'] });
    },
    onError: (error: any) => {
      addNotification(error.message || 'فشل التصويت', 'error');
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Focus Mode */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">بوابة العطاء</h2>
          <p className="text-emerald-100 text-sm mb-6 relative z-10 leading-relaxed">تصفح الحالات الموثقة التي تحتاج إلى دعمك المباشر. كل تبرع يصنع فارقاً حقيقياً.</p>
          <Link to="/donor/maps" className="w-full py-3 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-colors mt-auto border border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            البحث عبر الخرائط
          </Link>
        </div>
      </div>

      {/* Cases needing funding */}
      <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">حالات معتمدة بحاجة لدعمك</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <p className="text-slate-400">جاري التحميل...</p>
          ) : cases?.filter((c:any) => c.status === 'approved').sort((a: any, b: any) => (b.votesCount || 0) - (a.votesCount || 0)).map((c: any) => (
            <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">{c.needsType}</span>
                <div className="flex items-center gap-3">
                  <RequireAuthAction onAction={() => voteMutation.mutate(c.id)}>
                    <button 
                      disabled={voteMutation.isPending}
                      className="flex items-center gap-1 text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      title="تصويت مجتمعي لرفع الأولوية"
                    >
                      <svg className={`w-4 h-4 ${voteMutation.isPending ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                      <span className="text-xs font-bold">{c.votesCount || 0}</span>
                    </button>
                  </RequireAuthAction>
                  <span className="text-sm font-bold text-emerald-700">{c.requiredAmount ? `${c.requiredAmount} د.ل` : 'مبلغ مفتوح'}</span>
                </div>
              </div>
              
              <p className="text-sm text-slate-700 mb-4 flex-1">{c.description}</p>
              
              {selectedCase?.id === c.id ? (
                <PaymentForm caseData={c} onCancel={() => setSelectedCase(null)} onSubmit={(data: any) => donateMutation.mutate(data)} isPending={donateMutation.isPending} />
              ) : (
                <RequireAuthAction onAction={() => setSelectedCase(c)}>
                  <button 
                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors mt-auto"
                  >
                    تبرع الآن
                  </button>
                </RequireAuthAction>
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

function PaymentForm({ caseData, onCancel, onSubmit, isPending }: any) {
  const [method, setMethod] = useState('mobicash');
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      targetId: caseData.id,
      amount: Number(formData.get('amount')),
      paymentMethod: method
    };
    if (method === 'crypto') {
      data.cryptoCurrency = formData.get('cryptoCurrency');
      data.cryptoTxHash = formData.get('cryptoTxHash');
    }
    onSubmit(data);
  };

  return (
    <form className="mt-4 pt-4 border-t border-slate-200 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (د.ل)</label>
        <input type="number" name="amount" min="1" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left" defaultValue={caseData.requiredAmount || 100} dir="ltr" />
      </div>
      
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">طريقة الدفع</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" onClick={() => setMethod('stripe')} className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors ${method === 'stripe' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>💳 بطاقة ائتمان (Stripe)</button>
          <button type="button" onClick={() => setMethod('mobicash')} className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors ${method === 'mobicash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>📱 موبي كاش</button>
          <button type="button" onClick={() => setMethod('paypal')} className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors ${method === 'paypal' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>🅿️ PayPal</button>
          <button type="button" onClick={() => setMethod('crypto')} className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors ${method === 'crypto' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>₿ عملات رقمية (Web3)</button>
        </div>
      </div>
      
      {method === 'stripe' && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700">بيانات البطاقة (Gateway)</label>
          <input type="text" placeholder="رقم البطاقة (0000 0000 0000 0000)" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono text-left" dir="ltr" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="MM/YY" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono text-left" dir="ltr" />
            <input type="text" placeholder="CVC" required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono text-left" dir="ltr" />
          </div>
        </div>
      )}

      {method === 'crypto' && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العملة الرقمية</label>
            <select name="cryptoCurrency" value={cryptoCurrency} onChange={(e) => setCryptoCurrency(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none">
              <option value="USDT">USDT (Tether)</option>
              <option value="USDC">USDC (USD Coin)</option>
              <option value="BTC">Bitcoin (BTC)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم المحفظة المُرسل إليها</label>
            <div className="w-full px-3 py-2 bg-slate-200 text-slate-500 rounded-lg text-xs font-mono truncate" dir="ltr">0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم العملية (Tx Hash) للتحقق</label>
            <input type="text" name="cryptoTxHash" placeholder="0x..." required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono text-left" dir="ltr" />
          </div>
        </div>
      )}

      {method === 'paypal' && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <p className="text-xs text-slate-600 font-bold mb-2">سيتم تحويلك إلى PayPal لإتمام الدفع</p>
          <div className="w-full py-2 bg-[#0070ba] text-white rounded-lg text-sm font-bold opacity-80 cursor-not-allowed">PayPal Checkout</div>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-100 mt-4">
        <button type="submit" disabled={isPending} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
          {isPending ? 'جاري المعالجة...' : 'تأكيد الدفع والتبرع'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300">
          إلغاء
        </button>
      </div>
    </form>
  );
}
