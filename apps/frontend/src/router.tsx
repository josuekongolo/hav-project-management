import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { KanbanPage } from './pages/KanbanPage';
import { TeamPage } from './pages/TeamPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { LabelsPage } from './pages/LabelsPage';
import { UsersPage } from './pages/UsersPage';
import { CalendarPage } from './pages/CalendarPage';
import { ContactsPage } from './pages/crm/ContactsPage';
import { ContactDetailPage } from './pages/crm/ContactDetailPage';
import { EmailTemplatesPage } from './pages/crm/EmailTemplatesPage';
import { EmailsPage } from './pages/crm/EmailsPage';
import { DealsPage } from './pages/crm/DealsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'kanban',
        element: <KanbanPage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'team',
        element: <TeamPage />,
      },
      {
        path: 'milestones',
        element: <MilestonesPage />,
      },
      {
        path: 'labels',
        element: <LabelsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'crm/contacts',
        element: <ContactsPage />,
      },
      {
        path: 'crm/contacts/:id',
        element: <ContactDetailPage />,
      },
      {
        path: 'crm/deals',
        element: <DealsPage />,
      },
      {
        path: 'crm/templates',
        element: <EmailTemplatesPage />,
      },
      {
        path: 'crm/emails',
        element: <EmailsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
