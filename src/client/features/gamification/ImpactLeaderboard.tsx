import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { Award, Crown } from 'lucide-react';

export default function ImpactLeaderboard() {
  const queryClient = useQueryClient();

  const { data: leaders, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/leaderboard')
  });

  const seedMutation = useMutation({
    mutationFn: () => api.post('/leaderboard/seed', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
  });

  const getLevelInfo = (level: number) => {
    if (level >= 99) return { name: 'أسطورة الإنسانية', colorClass: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse', bgClass: 'bg-gradient-to-r from-fuchsia-100 to-purple-100 border-fuchsia-300' };
    if (level >= 61) return { name: 'ركن العطاء', colorClass: 'text-yellow-600 drop-shadow-sm', bgClass: 'bg-yellow-50 border-yellow-200' };
    if (level >= 31) return { name: 'صانع الأمل', colorClass: 'text-slate-700 drop-shadow-sm', bgClass: 'bg-slate-100 border-slate-300' };
    if (level >= 11) return { name: 'مبادر الخير', colorClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200' };
    return { name: 'عابر سبيل', colorClass: 'text-gray-500', bgClass: 'bg-gray-50 border-gray-100' };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">لوحة التأثير المجتمعي</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => seedMutation.mutate()} 
            disabled={seedMutation.isPending}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            {seedMutation.isPending ? 'جاري الإضافة...' : 'إضافة بيانات تجريبية'}
          </button>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-6 font-medium">نقاط أثر متراكمة تعكس حجم مساهمتك الإنسانية ومستواك المجتمعي.</p>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
        ) : leaders?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">لا توجد بيانات للأثر بعد.</div>
        ) : (
          leaders?.map((leader: any, index: number) => {
            const levelInfo = getLevelInfo(leader.currentLevel || 1);
            const isLegendary = (leader.currentLevel || 1) >= 99;

            return (
              <div key={leader.id} className={`flex items-center justify-between p-4 rounded-xl border ${levelInfo.bgClass}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-white shadow-sm border border-black/5`}>
                    {isLegendary ? <Crown className="w-5 h-5 text-fuchsia-500" /> : index + 1}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isLegendary ? levelInfo.colorClass : 'text-slate-800'}`}>
                      {leader.userName || 'فاعل خير'}
                    </h3>
                    <p className={`text-xs font-bold ${isLegendary ? '' : levelInfo.colorClass}`}>
                      {levelInfo.name} (مستوى {leader.currentLevel || 1})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-600">{leader.points || 0}</div>
                  <div className="text-xs text-slate-500 font-bold">نقطة أثر</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
