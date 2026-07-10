import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { useNavigate } from 'react-router';

export default function CitizenPortal() {
  const navigate = useNavigate();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['my-cases'],
    queryFn: () => api.get('/cases')
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">قيد الانتظار</span>;
      case 'under_review': return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold">قيد المراجعة</span>;
      case 'approved': return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-bold">معتمد - بانتظار التمويل</span>;
      case 'funded': return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold">تم التمويل</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">{status}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="col-span-1 md:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">طلبات المساعدة الخاصة بك</h2>
          <button onClick={() => navigate('/citizen/intake')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
            تقديم طلب جديد
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">جاري تحميل الطلبات...</div>
        ) : cases && cases.length > 0 ? (
          <div className="space-y-4">
            {cases.map((c: any) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-800 text-sm">طلب #{c.id.slice(0,8)}</span>
                    {getStatusBadge(c.status)}
                  </div>
                  <p className="text-sm text-slate-600">{c.description.length > 60 ? c.description.slice(0, 60) + '...' : c.description}</p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">{new Date(c.createdAt).toLocaleDateString('ar-LY')}</p>
                </div>
                {c.status === 'funded' && (
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                    تم تحويل الدعم
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <p className="text-slate-500 mb-4">لم تقم بتقديم أي طلبات مساعدة حتى الآن.</p>
            <button onClick={() => navigate('/citizen/intake')} className="text-emerald-600 font-bold hover:text-emerald-700 underline">
              اضغط هنا للبدء
            </button>
          </div>
        )}
      </div>

      <div className="col-span-1 md:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 text-white relative overflow-hidden">
        <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">إرشادات هامة</h3>
        <ul className="space-y-4 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">1</div>
            <p>بعد التقديم، سيتم مراجعة طلبك آلياً باستخدام الذكاء الاصطناعي لتسريع المعالجة.</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">2</div>
            <p>قد يتواصل معك باحث ميداني لترتيب زيارة والتحقق من المستندات.</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">3</div>
            <p>تأكد من صحة رقم هاتفك في ملفك الشخصي لتسهيل التواصل.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
