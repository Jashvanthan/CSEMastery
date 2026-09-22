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

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(11);
  const [streakCount, setStreakCount] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Refresh lightweight dashboard stats for header/sidebar whenever user context updates
    api
      .getDashboard()
      .then((res) => {
        if (res.currentDay) setCurrentDay(res.currentDay);
        if (res.streak?.current) setStreakCount(res.streak.current);
      })
      .catch(() => {});
  }, [user]);

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
            <Route path="/" element={<DashboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/weeks" element={<PlanPage />} />
            <Route path="/week/:weekId" element={<WeekDetailPage />} />
            <Route path="/day/:dayNumber" element={<DayDetailPage />} />
            <Route path="/task/:taskId" element={<TaskDetailPage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/tracks/:trackId" element={<TracksPage />} />
            <Route path="/leetcode" element={<LeetcodePage />} />
            <Route path="/revision" element={<RevisionPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
