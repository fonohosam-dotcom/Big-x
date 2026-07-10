import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">لوحة التأثير الأسبوعي</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => seedMutation.mutate()} 
            disabled={seedMutation.isPending}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            {seedMutation.isPending ? 'جاري الإضافة...' : 'إضافة بيانات تجريبية (Seed)'}
          </button>
          <div className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-bold border border-amber-100">
            تُحدث كل خميس
          </div>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-6 font-medium">نقاط أثر لا مكافأة. مستويات تصاعدية (فاعل خير مبتدئ ← داعم مستدام ← سفير العطاء ← محسن ذهبي ← شريك الخير المؤسسي).</p>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
        ) : leaders?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">لا توجد بيانات للأثر بعد.</div>
        ) : (
          leaders?.map((leader: any, index: number) => (
            <div key={leader.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                  ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{leader.userName || 'فاعل خير'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{
                    leader.points > 1000 ? 'شريك الخير المؤسسي' : 
                    leader.points > 500 ? 'محسن ذهبي' : 
                    leader.points > 100 ? 'سفير العطاء' : 'فاعل خير مبتدئ'
                  }</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-emerald-600">{leader.points}</div>
                <div className="text-xs text-slate-400 font-bold">نقطة أثر</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
