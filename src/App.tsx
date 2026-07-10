import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import DashboardLayout from './client/components/DashboardLayout.tsx';
import { ProtectedRoute } from './client/routes/ProtectedRoute.tsx';

// Portals
import LandingView from './client/app/LandingView.tsx';
import LoginView from './client/app/LoginView.tsx';
import CitizenPortal from './client/features/citizen/CitizenPortal.tsx';
import IntakePortal from './client/features/citizen/IntakePortal.tsx';
import DonorPortal from './client/features/donor/DonorPortal.tsx';
import ResearcherPortal from './client/features/researcher/ResearcherPortal.tsx';
import AdminPortal from './client/features/admin/AdminPortal.tsx';
import MedicalPortal from './client/features/medical/MedicalPortal.tsx';
import LedgerPortal from './client/features/ledger/LedgerPortal.tsx';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><LandingView /></DashboardLayout>} />
          <Route path="/login" element={<DashboardLayout><LoginView /></DashboardLayout>} />
          <Route path="/ledger" element={<DashboardLayout><LedgerPortal /></DashboardLayout>} />
          
          <Route element={<DashboardLayout><ProtectedRoute /></DashboardLayout>}>
            <Route path="/citizen" element={<CitizenPortal />} />
            <Route path="/citizen/intake" element={<IntakePortal />} />
            <Route path="/medical" element={<MedicalPortal />} />
          </Route>
          
          <Route element={<DashboardLayout><ProtectedRoute allowedRoles={['donor']} /></DashboardLayout>}>
            <Route path="/donor" element={<DonorPortal />} />
          </Route>

          <Route element={<DashboardLayout><ProtectedRoute allowedRoles={['researcher', 'admin']} /></DashboardLayout>}>
            <Route path="/researcher" element={<ResearcherPortal />} />
          </Route>
          
          <Route element={<DashboardLayout><ProtectedRoute allowedRoles={['admin']} /></DashboardLayout>}>
            <Route path="/admin" element={<AdminPortal />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

