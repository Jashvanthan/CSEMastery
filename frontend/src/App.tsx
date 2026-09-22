import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { PlanPage } from './pages/PlanPage';
import { WeekDetailPage } from './pages/WeekDetailPage';
import { DayDetailPage } from './pages/DayDetailPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { LeetcodePage } from './pages/LeetcodePage';
import { TracksPage } from './pages/TracksPage';
import { RevisionPage } from './pages/RevisionPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NotesPage } from './pages/NotesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { CommunityPage } from './pages/CommunityPage';
import { api } from './services/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, token } = useAuth();
  const [currentDay, setCurrentDay] = useState(11);
  const [streakCount, setStreakCount] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Refresh lightweight dashboard stats for header/sidebar whenever user context updates
    api
      .getDashboard()
      .then((res) => {
        if (res.currentDay) setCurrentDay(res.currentDay);
        if (res.streak?.current) setStreakCount(res.streak.current);
      })
      .catch(() => {});
  }, [user, token]);

  // If unauthenticated, show clean full-page auth layout
  if (!token && !user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        currentDay={currentDay}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentDay={currentDay}
          streakCount={streakCount}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
            <Route path="/weeks" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
            <Route path="/week/:weekId" element={<ProtectedRoute><WeekDetailPage /></ProtectedRoute>} />
            <Route path="/day/:dayNumber" element={<ProtectedRoute><DayDetailPage /></ProtectedRoute>} />
            <Route path="/task/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
            <Route path="/tracks" element={<ProtectedRoute><TracksPage /></ProtectedRoute>} />
            <Route path="/tracks/:trackId" element={<ProtectedRoute><TracksPage /></ProtectedRoute>} />
            <Route path="/leetcode" element={<ProtectedRoute><LeetcodePage /></ProtectedRoute>} />
            <Route path="/revision" element={<ProtectedRoute><RevisionPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
