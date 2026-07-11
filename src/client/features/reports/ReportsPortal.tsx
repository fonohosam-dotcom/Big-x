import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

export default function ReportsPortal() {
  const { data: trends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['reports-trends'],
    queryFn: () => api.get('/reports/donations-trends')
  });

  const { data: distribution, isLoading: isDistLoading } = useQuery({
    queryKey: ['reports-distribution'],
    queryFn: () => api.get('/reports/cases-distribution')
  });

  const handleExportCSV = () => {
    if (!trends || !Array.isArray(trends)) return;
    
    // Create CSV content
    const headers = ['Month', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...trends.map((row: any) => `${row.month},${row.amount}`)
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'donations_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">بوابة التقارير والإحصائيات</h2>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors"
        >
          <Download size={18} />
          تصدير إلى CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-700 mb-6">نمو التبرعات شهرياً</h3>
          <div className="h-[300px]" dir="ltr">
            {isTrendsLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400">جاري التحميل...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="amount" name="التبرعات (د.ل)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-700 mb-6">توزيع الحالات حسب النوع</h3>
          <div className="h-[300px]" dir="ltr">
            {isDistLoading ? (
               <div className="h-full flex items-center justify-center text-slate-400">جاري التحميل...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(distribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-700 mb-4">جدول العمليات التجميعي</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">الشهر</th>
                <th className="p-4 font-bold">إجمالي التبرعات (د.ل)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(trends || []).map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-700">{row.month}</td>
                  <td className="p-4 font-bold text-emerald-600">{row.amount}</td>
                </tr>
              ))}
              {(!trends || trends.length === 0) && !isTrendsLoading && (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-slate-400">لا توجد بيانات متاحة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
