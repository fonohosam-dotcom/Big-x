import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intakeCaseSchema } from '../../../shared/schemas/index.ts';
import { api } from '../../lib/api.ts';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

type IntakeForm = z.infer<typeof intakeCaseSchema>;

export default function IntakePortal() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<IntakeForm>({
    resolver: zodResolver(intakeCaseSchema),
    defaultValues: {
      needsType: 'living',
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data: IntakeForm) => api.post('/cases', data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/citizen'), 3000);
    }
  });

  const onSubmit = (data: IntakeForm) => {
    submitMutation.mutate(data);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 text-center bg-white rounded-2xl shadow-sm border border-emerald-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">تم تسجيل الطلب بنجاح!</h2>
        <p className="text-slate-600">سيتم مراجعة طلبك من قبل الباحث الميداني والذكاء الاصطناعي قريباً.</p>
        <div className="mt-8 pt-6 border-t border-slate-100">
           <p className="text-sm text-slate-500 font-mono bg-slate-50 p-3 rounded-lg inline-block">جاري تحويلك للوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">تسجيل طلب مساعدة جديد</h2>
        <p className="text-sm text-slate-500">الرجاء تعبئة التفاصيل بدقة لضمان سرعة المعالجة والتقييم الآلي.</p>
      </div>
      
      {submitMutation.isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl font-medium text-sm">
          حدث خطأ أثناء إرسال الطلب: {submitMutation.error?.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">نوع الاحتياج</label>
          <select 
            {...register('needsType')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-medium"
          >
            <option value="living">معيشية (مواد غذائية، ملابس)</option>
            <option value="medical">طبية (أدوية، عمليات جراحية)</option>
            <option value="housing">سكنية (إيجار، ترميم)</option>
            <option value="education">تعليمية (رسوم، حقيبة مدرسية)</option>
          </select>
          {errors.needsType && <span className="text-red-500 text-xs mt-1 font-bold">{errors.needsType.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">وصف الحالة بالتفصيل</label>
          <textarea
            {...register('description')}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
            placeholder="اشرح وضعك الحالي وسبب طلب المساعدة بشكل واضح ومفصل..."
          />
          {errors.description && <span className="text-red-500 text-xs mt-1 font-bold">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ المطلوب (د.ل) - اختياري</label>
            <input
              type="number"
              {...register('requiredAmount', { valueAsNumber: true })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-mono text-left"
              placeholder="0.00"
              dir="ltr"
            />
            {errors.requiredAmount && <span className="text-red-500 text-xs mt-1 font-bold">{errors.requiredAmount.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البلدية الحالية</label>
            <input
              {...register('municipality')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="مثال: بلدية طرابلس المركز"
            />
            {errors.municipality && <span className="text-red-500 text-xs mt-1 font-bold">{errors.municipality.message}</span>}
          </div>
        </div>

        <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/citizen')}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {submitMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإرسال...
              </>
            ) : 'تقديم الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
}
