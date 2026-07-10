import { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore.ts';
import { useNavigate, Link, useLocation } from 'react-router';
import { LogOut, LayoutDashboard, FileText, Heart, ShieldCheck, Database, FilePlus } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;

  const navLinks = [
    ...(role === 'citizen' ? [
      { path: '/citizen', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
      { path: '/citizen/intake', label: 'تقديم طلب جديد', icon: <FilePlus size={20} /> }
    ] : []),
    ...(role === 'donor' ? [
      { path: '/donor', label: 'لوحة التأثير', icon: <Heart size={20} /> }
    ] : []),
    ...(role === 'researcher' ? [
      { path: '/researcher', label: 'المراجعة الميدانية', icon: <FileText size={20} /> }
    ] : []),
    ...(role === 'admin' ? [
      { path: '/admin', label: 'الاعتمادات', icon: <ShieldCheck size={20} /> }
    ] : []),
    ...(role === 'medical' ? [
      { path: '/medical', label: 'المخزون الطبي', icon: <Database size={20} /> }
    ] : []),
    { path: '/ledger', label: 'الدفتر العام', icon: <Database size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-slate-900 text-white flex-col shrink-0 ${location.pathname === '/' ? 'hidden md:flex' : 'hidden md:flex'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-800 shrink-0" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div>
            </div>
            منصة تكافل V2
          </h1>
        </div>
        
        <div className="p-4 border-b border-slate-800">
           {user ? (
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold uppercase shrink-0">
                   {user.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                   <p className="font-bold text-sm text-slate-200 truncate">{user.name}</p>
                   <p className="text-xs text-emerald-500 font-mono truncate">{user.role}</p>
                 </div>
              </div>
           ) : (
             <div className="text-center py-2">
                <p className="text-slate-400 text-sm">غير مسجل دخول</p>
             </div>
           )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          {user ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-300 rounded-xl text-sm font-bold transition-colors"
            >
              <LogOut size={18} />
              تسجيل خروج
            </button>
          ) : (
             <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              تسجيل دخول
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="md:hidden flex items-center gap-2" onClick={() => navigate('/')}>
               <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                 <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div>
               </div>
               <span className="font-bold text-slate-800">تكافل V2</span>
             </div>
             <div className="text-sm font-bold text-slate-500 hidden md:block">
               {new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hidden lg:flex">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Drizzle Sync Active
             </div>
             <div className="md:hidden">
               {user ? (
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500">
                    <LogOut size={20} />
                  </button>
               ) : (
                  <button onClick={() => navigate('/login')} className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                    دخول
                  </button>
               )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
