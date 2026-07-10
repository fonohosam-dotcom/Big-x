import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { useState } from 'react';

export default function ResearcherPortal() {
  const queryClient = useQueryClient();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['all-cases'],
    queryFn: () => api.get('/cases')
  });

  const analyzeMutation = useMutation({
    mutationFn: (caseId: string) => api.post(`/cases/${caseId}/analyze`, {}),
    onSuccess: (data) => setAiAnalysis(data)
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, score, notes }: { id: string, score: number, notes: string }) => 
      api.put(`/cases/${id}/verify`, { evaluationScore: score, researcherNotes: notes, status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-cases'] });
      setSelectedCaseId(null);
      setAiAnalysis(null);
    }
  });

  const selectedCase = cases?.find((c: any) => c.id === selectedCaseId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cases List */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-[80vh]">
        <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          قائمة الحالات (للباحث)
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            <p className="text-center text-slate-400 text-sm mt-10">جاري التحميل...</p>
          ) : cases?.filter((c:any) => c.status === 'pending' || c.status === 'under_review').map((c: any) => (
            <div 
              key={c.id} 
              onClick={() => { setSelectedCaseId(c.id); setAiAnalysis(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedCaseId === c.id ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500 ring-offset-1' : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-800">طلب #{c.id.slice(0,6)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {c.status === 'pending' ? 'بانتظار المراجعة' : 'قيد المراجعة'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
            </div>
          ))}
          {cases?.filter((c:any) => c.status === 'pending' || c.status === 'under_review').length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-10">لا توجد طلبات جديدة.</p>
          )}
        </div>
      </div>

      {/* Case Details & AI Analysis */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        
        {!selectedCase ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <p className="font-bold">اختر حالة من القائمة لعرض التفاصيل</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">تفاصيل الطلب #{selectedCase.id.slice(0,8)}</h3>
              <button 
                onClick={() => analyzeMutation.mutate(selectedCase.id)}
                disabled={analyzeMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                {analyzeMutation.isPending ? 'جاري التحليل...' : 'تحليل الذكاء الاصطناعي'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-1 font-bold">الاحتياج</p>
                <p className="text-sm font-medium">{selectedCase.needsType}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 font-bold">المبلغ المطلوب</p>
                <p className="text-sm font-medium">{selectedCase.requiredAmount ? `${selectedCase.requiredAmount} د.ل` : 'غير محدد'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1 font-bold">الوصف</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedCase.description}</p>
              </div>
            </div>

            {aiAnalysis && (
              <div className="mb-6 p-5 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-white font-bold px-2 py-1 bg-blue-600 rounded">Gemini AI</span>
                  <span className="text-xs font-bold text-blue-800">نتيجة التحليل الآلي</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-serif">"{aiAnalysis.summary}"</p>
                <div className="mt-4 flex gap-4">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100 text-center flex-1">
                     <p className="text-[10px] text-emerald-600 font-bold uppercase">درجة المصداقية</p>
                     <p className="text-xl font-black text-emerald-700">{aiAnalysis.confidence}%</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100 text-center flex-1">
                     <p className="text-[10px] text-amber-600 font-bold uppercase">التوصية</p>
                     <p className="text-sm font-black text-amber-700 mt-1">{aiAnalysis.recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto border-t border-slate-100 pt-6">
              <h4 className="text-sm font-bold text-slate-800 mb-4">قرار الباحث النهائي</h4>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  verifyMutation.mutate({ 
                    id: selectedCase.id, 
                    score: Number(formData.get('score')), 
                    notes: formData.get('notes') as string 
                  });
                }}
                className="space-y-4"
              >
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-2">درجة التقييم (1-10)</label>
                   <input type="number" name="score" min="1" max="10" required className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-2">ملاحظات الباحث</label>
                   <textarea name="notes" required rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="اكتب مبررات القرار هنا..."></textarea>
                </div>
                <div className="flex justify-end gap-3">
                   <button type="submit" disabled={verifyMutation.isPending} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors">
                     {verifyMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد الحالة (توجيه للإدارة)'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
