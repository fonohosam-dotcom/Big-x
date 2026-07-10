import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { useNavigate } from 'react-router';

export default function LandingView() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/stats/public').catch(() => ({ totalDonations: 150000, casesFunded: 342 })),
    refetchInterval: 30000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-4 min-h-[80vh]">
      
      {/* Hero / Welcome Section - spans 8 cols, 4 rows */}
      <div className="col-span-1 md:col-span-8 md:row-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        
        <div className="w-full bg-red-50 text-red-600 border border-red-100 rounded-xl py-3 px-4 text-sm font-bold flex items-center justify-between mb-8">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            تنبيه طوارئ نشط: دعم المتضررين من السيول
          </span>
          <button onClick={() => navigate('/donor?project=sos')} className="text-red-700 underline hover:text-red-800">تبرع الآن</button>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-800">
          منصة تكافل الوطنية
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mt-4">
          نربط المحتاج بالمتبرع عبر نظام ذكي، شفاف، وآمن.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <button
            onClick={() => navigate('/citizen/intake')}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-lg font-bold transition-all shadow-sm"
          >
            تقديم طلب دعم
          </button>
          <button
            onClick={() => navigate('/donor')}
            className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-xl text-lg font-bold transition-all shadow-sm hover:bg-emerald-50"
          >
            تبرع الآن
          </button>
        </div>
      </div>

      {/* Stats section - spans 4 cols, 2 rows each */}
      <div className="col-span-1 md:col-span-4 md:row-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 flex flex-col justify-center text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
           <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.33-.89-2.46-1.83H7.66c.14 1.73 1.41 2.91 3.26 3.25V19h2.36v-1.64c1.81-.32 2.83-1.45 2.83-2.92 0-2.35-1.99-3.04-3.8-3.54z"/></svg>
         </div>
         <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2 relative z-10">إجمالي التبرعات</p>
         <div className="text-4xl font-black tracking-tighter text-white relative z-10">
           {isLoading ? '...' : stats?.totalDonations.toLocaleString()} <span className="text-xl text-slate-400 font-normal">د.ل</span>
         </div>
      </div>

      <div className="col-span-1 md:col-span-4 md:row-span-2 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-6 flex flex-col justify-center">
         <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-2">حالة تمت مساعدتها</p>
         <div className="text-4xl font-black tracking-tighter text-emerald-700">
           {isLoading ? '...' : stats?.casesFunded.toLocaleString()} <span className="text-xl text-emerald-500 font-normal">عائلة</span>
         </div>
      </div>

      {/* Info card spans 4 cols, 2 rows */}
      <div className="col-span-1 md:col-span-4 md:row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
         <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-2">
           <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
           تقييم آلي للطلبات
         </h3>
         <p className="text-sm text-slate-600 font-medium">نظام التكافل يستخدم الذكاء الاصطناعي لتقييم الحالات وتحديد الأولويات بشكل فوري.</p>
      </div>

       {/* Footer banner spans 8 cols, 2 rows */}
       <div className="col-span-1 md:col-span-8 md:row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">الشفافية والمصداقية (Ledger & Verify)</h3>
            <p className="text-sm text-slate-500">جميع العمليات مسجلة بشفافية في قاعدة البيانات. ويمكن لأي شخص التحقق من الحالات.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/ledger')} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200">
              سجل الشفافية
            </button>
            <button onClick={() => navigate('/verify')} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 border border-blue-200">
              تحقق من حالة
            </button>
          </div>
       </div>

    </div>
  );
}
