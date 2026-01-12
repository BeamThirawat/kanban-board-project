import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Placeholder pages - to be implemented in future phases
function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2">Your boards will appear here.</p>
    </div>
  );
}

function BoardPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-8">
      <h1 className="text-3xl font-bold">Board</h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2">Kanban board view coming soon.</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="kanban-theme">
      <BrowserRouter>
        <Routes>
          {/* Auth Routes with AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/board/:id" element={<BoardPage />} />
          </Route>

          {/* Fallback - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
