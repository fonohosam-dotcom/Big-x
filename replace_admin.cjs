const fs = require('fs');
const code = fs.readFileSync('src/client/features/admin/AdminPortal.tsx', 'utf8');

// I want to add a new section in the sidebar for "بيانات التجربة والعرض"
// The sidebar is in `<div className="lg:col-span-3 bg-slate-900...`
// I'll append a new link and button there.

const appendTarget = '<button className="w-full py-3 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors mt-auto">\n          إصدار التقارير النهائية\n        </button>';
const replacement = `        <button className="w-full py-3 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors mt-auto">
          إصدار التقارير النهائية
        </button>

        <div className="mt-8 border-t border-slate-700 pt-6">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">بيانات التجربة والعرض</p>
          <button 
            onClick={async () => {
              if (window.confirm('هل أنت متأكد من حذف جميع البيانات التجريبية؟ لا يمكن التراجع عن هذا الإجراء.')) {
                try {
                  await api.post('/admin/purge-demo', {});
                  addNotification('تم حذف البيانات التجريبية بنجاح.', 'success');
                  queryClient.invalidateQueries();
                } catch (e) {
                  addNotification('فشل حذف البيانات التجريبية.', 'error');
                }
              }
            }}
            className="w-full py-3 bg-red-600 rounded-xl text-sm font-bold hover:bg-red-500 transition-colors text-white"
          >
            حذف البيانات التجريبية
          </button>
        </div>`;

const newCode = code.replace(appendTarget, replacement);
fs.writeFileSync('src/client/features/admin/AdminPortal.tsx', newCode);
