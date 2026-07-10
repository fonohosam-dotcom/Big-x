import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';

export default function MedicalPortal() {
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['medical-inventory'],
    queryFn: () => api.get('/medical/inventory')
  });

  const seedMutation = useMutation({
    mutationFn: () => api.post('/medical/seed', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medical-inventory'] })
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">المخزون الطبي والاحتياجات</h2>
        <button 
          onClick={() => seedMutation.mutate()} 
          disabled={seedMutation.isPending}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition-colors"
        >
          {seedMutation.isPending ? 'جاري الإضافة...' : 'إضافة بيانات تجريبية (Seed)'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr className="border-b border-slate-200">
              <th className="py-3 px-4">الصنف الطبي</th>
              <th className="py-3 px-4">المستشفى/المركز</th>
              <th className="py-3 px-4">الكمية المتوفرة</th>
              <th className="py-3 px-4">الحد الحرج</th>
              <th className="py-3 px-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">جاري التحميل...</td></tr>
            ) : inventory?.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">لا توجد بيانات، قم بإضافة بيانات تجريبية</td></tr>
            ) : inventory?.map((item: any) => {
              const isCritical = item.quantity <= item.criticalThreshold;
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold">{item.itemName}</td>
                  <td className="py-4 px-4">{item.facilityName}</td>
                  <td className="py-4 px-4 font-mono">{item.quantity}</td>
                  <td className="py-4 px-4 font-mono text-slate-400">{item.criticalThreshold}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${!isCritical ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {!isCritical ? 'متوفر' : 'نقص حاد'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
