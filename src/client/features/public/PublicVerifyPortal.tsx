import { useState } from 'react';
import { api } from '../../lib/api.ts';
import { useMutation } from '@tanstack/react-query';

export default function PublicVerifyPortal() {
  const [caseId, setCaseId] = useState('');
  const [result, setResult] = useState<any>(null);

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.get(`/cases/${id}/public-verify`),
    onSuccess: (data) => setResult(data),
    onError: () => setResult({ notFound: true })
  });

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-4">بوابة التحقق العام</h1>
        <p className="text-slate-500">تحقق من مصداقية أي حالة خيرية معتمدة على منصة تكافل بلمحة بصر وبشفافية تامة.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (caseId.trim()) verifyMutation.mutate(caseId.trim());
          }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <input 
            type="text" 
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="أدخل الرمز التعريفي للحالة (مثل: 93a8d...)"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-colors"
          />
          <button 
            type="submit" 
            disabled={verifyMutation.isPending}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {verifyMutation.isPending ? 'جاري التحقق...' : 'تحقق الآن'}
          </button>
        </form>

        {result && !result.notFound && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-6 rounded-2xl border ${result.status === 'approved' || result.status === 'funded' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-4 border-b border-slate-200/50 pb-4">
                {result.status === 'approved' || result.status === 'funded' ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800">حالة مُسجلة في النظام</h3>
                  <p className="text-xs text-slate-500 font-mono">{result.id}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                  <span className="text-sm font-bold text-slate-500">نوع الاحتياج</span>
                  <span className="text-sm font-bold text-slate-800">{result.needsType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                  <span className="text-sm font-bold text-slate-500">حالة الاعتماد</span>
                  <span className="text-sm font-bold text-slate-800">
                    {result.status === 'approved' ? 'معتمدة و موثقة' : result.status === 'funded' ? 'اكتمل التمويل' : 'قيد المراجعة / غير معتمدة للنشر العام'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold text-slate-500">المبلغ المُجمع</span>
                  <span className="text-sm font-bold text-emerald-600">{result.collectedAmount || '0'} / {result.requiredAmount || 'غير محدد'} د.ل</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {result?.notFound && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <h3 className="font-bold text-red-800 mb-1">لم يتم العثور على الحالة</h3>
              <p className="text-sm text-red-600">تأكد من إدخال الرمز التعريفي الصحيح. لا توجد حالة مسجلة بهذا الرقم في نظام تكافل الموحد.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
