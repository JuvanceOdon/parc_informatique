import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/PageLoader';

const AppLayout = lazy(() => import('./layout/AppLayout').then((m) => ({ default: m.AppLayout })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const UtilisateursPage = lazy(() => import('./pages/UtilisateursPage').then((m) => ({ default: m.UtilisateursPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const MaterielsPage = lazy(() => import('./pages/MaterielsPage').then((m) => ({ default: m.MaterielsPage })));
const MaterielDetailPage = lazy(() => import('./pages/MaterielDetailPage').then((m) => ({ default: m.MaterielDetailPage })));
const AffectationsPage = lazy(() => import('./pages/AffectationsPage').then((m) => ({ default: m.AffectationsPage })));
const TicketsPage = lazy(() => import('./pages/TicketsPage').then((m) => ({ default: m.TicketsPage })));
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })));
const MaintenancesPage = lazy(() => import('./pages/MaintenancesPage').then((m) => ({ default: m.MaintenancesPage })));
const RapportsPage = lazy(() => import('./pages/RapportsPage').then((m) => ({ default: m.RapportsPage })));
const JournalAuditPage = lazy(() => import('./pages/JournalAuditPage').then((m) => ({ default: m.JournalAuditPage })));
const ParametresPage = lazy(() => import('./pages/ParametresPage').then((m) => ({ default: m.ParametresPage })));

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <Lazy>
          <LoginPage />
        </Lazy>
      }
    />

    <Route element={<ProtectedRoute />}>
      <Route
        element={
          <Lazy>
            <AppLayout />
          </Lazy>
        }
      >
        <Route
          index
          element={
            <Lazy>
              <DashboardPage />
            </Lazy>
          }
        />
        <Route path="materiels" element={<Lazy><MaterielsPage /></Lazy>} />
        <Route path="materiels/:id" element={<Lazy><MaterielDetailPage /></Lazy>} />
        <Route path="affectations" element={<Lazy><AffectationsPage /></Lazy>} />
        <Route path="tickets" element={<Lazy><TicketsPage /></Lazy>} />
        <Route path="tickets/:id" element={<Lazy><TicketDetailPage /></Lazy>} />
        <Route path="categories" element={<Lazy><CategoriesPage /></Lazy>} />
        <Route path="parametres" element={<Lazy><ParametresPage /></Lazy>} />

        <Route element={<ProtectedRoute roles={['ADMIN', 'CHEF_SERVICE', 'TECHNICIEN']} />}>
          <Route path="maintenances" element={<Lazy><MaintenancesPage /></Lazy>} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'CHEF_SERVICE', 'TECHNICIEN']} />}>
          <Route path="rapports" element={<Lazy><RapportsPage /></Lazy>} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'CHEF_SERVICE']} />}>
          <Route path="services" element={<Lazy><ServicesPage /></Lazy>} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="utilisateurs" element={<Lazy><UtilisateursPage /></Lazy>} />
          <Route path="journal-audit" element={<Lazy><JournalAuditPage /></Lazy>} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
