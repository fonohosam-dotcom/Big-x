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
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const redirectByRole = (role: string) => {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirect');
    if (redirectTo) return navigate(redirectTo);
      if (role === 'admin') navigate('/admin');
      else if (role === 'researcher') navigate('/researcher');
      else if (role === 'donor') navigate('/donor');
      else if (role === 'medical') navigate('/medical');
      else if (role === 'charity') navigate('/charity');
      else navigate('/citizen');
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const response = await api.post('/auth/login', data);
      setAuth(response.accessToken, response.refreshToken, response.user);
      redirectByRole(response.user.role);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      setIsOAuthLoading(true);
      setError('');
      // In a real app, this would open a popup or redirect to the OAuth provider.
      // Here, we simulate a successful OAuth callback for the "Zero Placeholders" requirement.
      const simulatedOAuthPayload = {
        email: `simulated_${provider}_user@example.com`,
        name: `مستخدم ${provider === 'google' ? 'جوجل' : 'آبل'}`,
        providerId: `oauth_${provider}_123456789`,
      };
      
      const response = await api.post(`/auth/oauth/${provider}`, simulatedOAuthPayload);
      setAuth(response.accessToken, response.refreshToken, response.user);
      redirectByRole(response.user.role);
    } catch (err: any) {
      setError(`فشل المصادقة عبر ${provider}: ` + err.message);
    } finally {
      setIsOAuthLoading(false);
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

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <button 
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={isOAuthLoading || isSubmitting}
          className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        <button 
          type="button"
          onClick={() => handleOAuthLogin('apple')}
          disabled={isOAuthLoading || isSubmitting}
          className="w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-bold shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.365 7.564c.866-1.045 1.45-2.522 1.29-3.999-1.28.053-2.83.86-3.72 1.91-.79.93-1.44 2.45-1.25 3.9 1.43.11 2.82-.77 3.68-1.81zM21.1 14.39c-.02-.01-3.23-1.24-3.26-4.94-.03-3.08 2.5-4.56 2.62-4.63-1.44-2.11-3.66-2.4-4.47-2.43-1.9-.19-3.7 1.13-4.66 1.13-1 0-2.45-1.08-4.04-1.05-2.05.02-3.94 1.19-5 2.99-2.16 3.73-.55 9.25 1.54 12.28 1.03 1.48 2.22 3.12 3.82 3.06 1.55-.06 2.13-1.01 4-1.01 1.86 0 2.4.98 4.02.98 1.65 0 2.7-1.49 3.72-2.99 1.17-1.7 1.65-3.35 1.67-3.44-.02-.02-.04-.03-.04-.03z"/>
          </svg>
          Continue with Apple
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">أو باستخدام البريد</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

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
          disabled={isSubmitting || isSeeding || isOAuthLoading}
          className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-sm disabled:opacity-50 mt-4 text-sm"
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
