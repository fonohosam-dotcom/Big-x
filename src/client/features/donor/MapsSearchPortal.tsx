import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { Link } from 'react-router';

export default function MapsSearchPortal() {
  const [municipality, setMunicipality] = useState('');
  
  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases-map', municipality],
    queryFn: () => api.get('/cases').then(res => {
       if (municipality) {
         return res.filter((c: any) => c.municipality === municipality && c.status === 'approved');
       }
       return res.filter((c: any) => c.status === 'approved');
    })
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           البحث المكاني الذكي
         </h2>
         <Link to="/donor" className="text-sm text-emerald-600 font-bold hover:underline">العودة للبوابة</Link>
      </div>

      <div className="flex gap-2 mb-8">
        <select 
          value={municipality} 
          onChange={(e) => setMunicipality(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-bold"
        >
          <option value="">جميع البلديات (ليبيا)</option>
          <option value="طرابلس">طرابلس</option>
          <option value="بنغازي">بنغازي</option>
          <option value="مصراتة">مصراتة</option>
          <option value="سبها">سبها</option>
          <option value="الزاوية">الزاوية</option>
          <option value="درنة">درنة</option>
        </select>
        <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">بحث</button>
      </div>

      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 h-96 relative flex items-center justify-center">
         {/* Simple Mock Map Visual */}
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         {isLoading ? (
           <p className="text-slate-500 font-bold relative z-10">جاري جلب المواقع...</p>
         ) : cases?.length === 0 ? (
           <p className="text-slate-500 font-bold relative z-10">لا توجد حالات معتمدة في هذه المنطقة.</p>
         ) : (
           <div className="w-full h-full relative z-10 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
             {cases?.map((c: any, index: number) => (
               <div key={c.id} className="bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg h-max hover:border-emerald-300 hover:-translate-y-1 transition-all cursor-pointer">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-slate-500">{c.municipality}</span>
                   <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">محتاج</span>
                 </div>
                 <p className="text-sm font-bold text-slate-800 mb-1">{c.needsType}</p>
                 <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                 <Link to="/donor" className="block mt-3 text-center text-xs font-bold text-white bg-emerald-600 py-1.5 rounded-lg hover:bg-emerald-500">
                   تبرع الآن
                 </Link>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
