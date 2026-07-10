import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../shared/schemas/index.ts';
import { api } from '../lib/api.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { useState } from 'react';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginView() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const response = await api.post('/auth/login', data);
      setAuth(response.accessToken, response.user);
      
      const role = response.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'researcher') navigate('/researcher');
      else if (role === 'donor') navigate('/donor');
      else if (role === 'medical') navigate('/medical');
      else if (role === 'charity') navigate('/charity');
      else navigate('/citizen');
      
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    }
  };

  const handleTestLogin = async (role: string) => {
    try {
      setIsSeeding(true);
      setError('');
      // Ensure seed users exist
      await api.post('/auth/seed', {});
      
      // Auto-fill and submit
      const email = `test_${role}@example.com`;
      const password = 'password123';
      
      setValue('email', email);
      setValue('password', password);
      
      await onSubmit({ email, password });
    } catch (err: any) {
      setError('فشل الدخول التجريبي: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">تسجيل الدخول</h2>
        <p className="text-sm text-slate-500 mt-2">يرجى إدخال بيانات الاعتماد للمتابعة</p>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
          <input
            {...register('email')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
            dir="ltr"
            placeholder="name@example.com"
          />
          {errors.email && <span className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
            dir="ltr"
            placeholder="••••••••"
          />
          {errors.password && <span className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isSeeding}
          className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-sm disabled:opacity-50 mt-4"
        >
          {isSubmitting ? 'جاري التحقق...' : 'دخول إلى النظام'}
        </button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs text-center text-slate-500 mb-4 font-bold">دخول تجريبي سريع (لأغراض العرض)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button type="button" onClick={() => handleTestLogin('citizen')} disabled={isSeeding} className="py-2 px-3 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">مواطن (Citizen)</button>
          <button type="button" onClick={() => handleTestLogin('donor')} disabled={isSeeding} className="py-2 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">متبرع (Donor)</button>
          <button type="button" onClick={() => handleTestLogin('researcher')} disabled={isSeeding} className="py-2 px-3 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">باحث (Researcher)</button>
          <button type="button" onClick={() => handleTestLogin('admin')} disabled={isSeeding} className="py-2 px-3 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">إدارة (Admin)</button>
          <button type="button" onClick={() => handleTestLogin('medical')} disabled={isSeeding} className="py-2 px-3 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">طبي (Medical)</button>
          <button type="button" onClick={() => handleTestLogin('charity')} disabled={isSeeding} className="py-2 px-3 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-lg text-xs font-bold transition-colors">جمعية (Charity)</button>
        </div>
      </div>
    </div>
  );
}
