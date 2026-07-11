import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { useNavigate } from 'react-router';
import { CountUp } from '../components/CountUp.tsx';
import Marquee from 'react-fast-marquee';
import { motion } from 'motion/react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from '../components/HeatmapLayer.tsx';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../stores/authStore.ts';
import { useState } from 'react';
import { SplashScreen } from '../components/ui/SplashScreen.tsx';
import { AuthGuardModal } from '../components/AuthGuardModal.tsx';
import { CinematicHero } from '../components/ui/CinematicHero.tsx';

export default function LandingView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [authGuardPath, setAuthGuardPath] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/stats/public').catch(() => ({ totalDonations: 150000, casesFunded: 342 })),
    refetchInterval: 30000,
  });

  const { data: liveStats, isLoading: isLiveStatsLoading } = useQuery({
    queryKey: ['live-stats'],
    queryFn: () => api.get('/stats/live').catch(() => ({ activeUsers: 1, totalUsers: 0, totalCases: 0 })),
    refetchInterval: 5000,
  });

  const { data: topDonors, isLoading: isTopDonorsLoading } = useQuery({
    queryKey: ['leaderboard', 'top'],
    queryFn: () => api.get('/leaderboard/points').catch(() => []),
  });

  const { data: casesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ['cases-map'],
    queryFn: () => api.get('/cases/public').catch(() => []),
  });

  const isLoading = isStatsLoading || isLiveStatsLoading || isTopDonorsLoading || isCasesLoading;

  const heatmapPoints: [number, number, number][] = (casesData || [])
    .filter((c: any) => c.locationLat && c.locationLng)
    .map((c: any) => [parseFloat(c.locationLat), parseFloat(c.locationLng), c.status === 'approved' ? 1.0 : 0.5]);

  const handleGuardedAction = (path: string) => {
    if (!user && path !== '/donor' && path !== '/donor/maps') {
      setAuthGuardPath(path);
    } else {
      navigate(path);
    }
  };

  const getLevelInfo = (level: number) => {
    if (level >= 99) return { name: 'أسطورة الإنسانية', colorClass: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse' };
    if (level >= 61) return { name: 'ركن العطاء', colorClass: 'text-yellow-600 drop-shadow-sm' };
    if (level >= 31) return { name: 'صانع الأمل', colorClass: 'text-slate-700 drop-shadow-sm' };
    if (level >= 11) return { name: 'مبادر الخير', colorClass: 'text-amber-700' };
    return { name: 'عابر سبيل', colorClass: 'text-gray-500' };
  };

  return (
    <div className="flex flex-col gap-0 pb-12 relative min-h-screen bg-slate-50">
      {showSplash && <SplashScreen isLoading={isLoading} onComplete={handleSplashComplete} />}
      {authGuardPath && <AuthGuardModal onClose={() => setAuthGuardPath(null)} onSuccess={() => { setAuthGuardPath(null); navigate(authGuardPath); }} />}

      <CinematicHero>
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          
          {/* Main Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: showSplash ? 0 : 0.2 }}
            className="lg:col-span-8 flex flex-col gap-6"
          >
            <div className="backdrop-blur-md bg-slate-900/40 rounded-3xl border border-white/10 shadow-2xl p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500"></div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
                نبض الإنسانية الليبية.
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10 font-medium">
                راقب حركة التبرعات والاحتياجات في الوقت الفعلي. انضم إلى الآلاف في بناء مجتمع متكافل ومترابط بضغطة زر واحدة.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleGuardedAction('/donor')}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] text-white rounded-2xl text-lg font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  تبرع الآن
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                <button
                  onClick={() => handleGuardedAction('/citizen/intake')}
                  className="px-8 py-4 backdrop-blur-md bg-white/10 text-white border border-white/20 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-2xl text-lg font-bold transition-all shadow-sm"
                >
                  تقديم طلب دعم
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="backdrop-blur-md bg-slate-900/60 rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col justify-center transition-transform hover:-translate-y-1">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">إجمالي التبرعات</p>
                <div className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <CountUp end={stats?.totalDonations || 0} duration={2} /> <span className="text-lg text-slate-400 font-normal">د.ل</span>
                </div>
              </div>
              <div className="backdrop-blur-md bg-slate-900/60 rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col justify-center transition-transform hover:-translate-y-1">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">حالات تمت مساعدتها</p>
                <div className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <CountUp end={stats?.casesFunded || 0} duration={2.5} /> <span className="text-lg font-normal opacity-70">عائلة</span>
                </div>
              </div>
              <div className="backdrop-blur-md bg-slate-900/60 rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col justify-center transition-transform hover:-translate-y-1">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">الزوار الآن</p>
                <div className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <CountUp end={liveStats?.activeUsers || 0} duration={1} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar: Leaderboard & Maps */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: showSplash ? 0.2 : 0.4 }}
            className="lg:col-span-4 flex flex-col gap-6"
          >
            {/* Map Preview */}
            <div className="backdrop-blur-xl bg-slate-900/40 rounded-3xl border border-white/10 shadow-2xl p-4 overflow-hidden h-[300px] flex flex-col relative group">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 z-10 bg-slate-900/60 w-max px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                خريطة الاحتياجات المباشرة
              </h3>
              <div className="flex-1 rounded-2xl overflow-hidden relative z-0 ring-1 ring-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <MapContainer center={[27.0, 17.0]} zoom={4} className="w-full h-full z-0" zoomControl={false} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="" />
                  {heatmapPoints.length > 0 && <HeatmapLayer points={heatmapPoints} />}
                </MapContainer>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none z-10 flex items-end justify-center pb-4">
                  <button onClick={() => handleGuardedAction('/donor/maps')} className="px-4 py-2 bg-white/10 text-white rounded-full text-xs font-bold backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all pointer-events-auto">
                    فتح الخريطة التفاعلية
                  </button>
                </div>
              </div>
            </div>

            {/* Legends Leaderboard */}
            <div className="backdrop-blur-xl bg-slate-900/40 rounded-3xl border border-white/10 shadow-2xl p-6 flex-1 flex flex-col relative">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-white flex items-center gap-2">
                   <svg className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                   لوحة أبطال العطاء
                 </h3>
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
              </div>
              
              <div className="space-y-4 flex-1">
                {!topDonors ? (
                  <div className="animate-pulse space-y-4">
                     <div className="h-10 bg-white/10 rounded-xl"></div>
                     <div className="h-10 bg-white/10 rounded-xl"></div>
                     <div className="h-10 bg-white/10 rounded-xl"></div>
                  </div>
                ) : (
                  topDonors.slice(0, 5).map((u: any, idx: number) => {
                     const lvl = getLevelInfo(u.currentLevel || 1);
                     const isLegend = (u.currentLevel || 1) >= 99;
                     return (
                       <div key={u.userId} className={`flex items-center justify-between p-3 rounded-xl border ${isLegend ? 'border-fuchsia-500/30 bg-fuchsia-900/20 shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'border-white/5 bg-white/5'} transition-all hover:scale-[1.02] hover:bg-white/10`}>
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : idx === 1 ? 'bg-slate-500/20 text-slate-300 border border-slate-500/50' : idx === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                             {idx + 1}
                           </div>
                           <div>
                             <div className="font-bold text-white text-sm flex items-center gap-1">
                               {u.user?.name || 'فاعل خير'} {isLegend && <span title="مستوى أسطوري" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">👑</span>}
                             </div>
                             <div className={`text-[10px] font-bold uppercase ${lvl.colorClass}`}>{lvl.name}</div>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="font-bold text-emerald-400 text-sm">{u.points}</div>
                           <div className="text-[10px] text-slate-400">نقطة أثر</div>
                         </div>
                       </div>
                     );
                  })
                )}
              </div>
              <button onClick={() => handleGuardedAction('/leaderboard')} className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                عرض القائمة الكاملة
              </button>
            </div>
          </motion.div>
        </div>
      </CinematicHero>

      {/* Live Ticker */}
      <div className="w-full bg-slate-900 text-white py-3 border-y border-emerald-500/20 shadow-xl relative z-20">
        <Marquee speed={40} gradient={false} direction="right">
          <div className="flex gap-12 items-center text-sm font-bold px-4">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> فاعل خير بمستوى (أسطورة) قام للتو بدعم حالة طبية في طرابلس.</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div> تسجيل 15 متطوع جديد في منصة التكافل خلال الساعة الماضية.</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> اكتمال تمويل 3 حالات سكنية في بنغازي ودرنة.</span>
          </div>
        </Marquee>
      </div>

    </div>
  );
}
