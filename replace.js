const fs = require('fs');
const code = fs.readFileSync('src/client/features/donor/DonorPortal.tsx', 'utf8');
const start = code.indexOf('<form');
const end = code.indexOf('</form>', start) + 7;
const newCode = code.slice(0, start) + '<PaymentForm caseData={c} onCancel={() => setSelectedCase(null)} onSubmit={(data) => donateMutation.mutate(data)} isPending={donateMutation.isPending} />' + code.slice(end);
fs.writeFileSync('src/client/features/donor/DonorPortal.tsx', newCode);
