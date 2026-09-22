import {
  DashboardStats,
  Track,
  Week,
  StudyDay,
  StudyTask,
  LeetCodeProblem,
  LeetCodeStats,
  Project,
  StudyNote,
  User,
  DemoUser,
  LeaderboardEntry,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mastery_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; name: string; startDate?: string }) {
    const res = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('mastery_token', res.token);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('mastery_token', res.token);
    return res;
  },

  async getDemoUsers(): Promise<DemoUser[]> {
    return request<DemoUser[]>('/auth/demo-users');
  },

  async demoLogin(userId: number) {
    const res = await request<{ token: string; user: User }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    localStorage.setItem('mastery_token', res.token);
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async updateProfile(data: { name?: string; start_date?: string }): Promise<User> {
    return request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  logout() {
    localStorage.removeItem('mastery_token');
  },

  // Community & Leaderboard
  async getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[]; totalScholars: number; topScholar: LeaderboardEntry | null }> {
    return request<{ leaderboard: LeaderboardEntry[]; totalScholars: number; topScholar: LeaderboardEntry | null }>('/community/leaderboard');
  },

  // Dashboard
  async getDashboard(): Promise<DashboardStats> {
    return request<DashboardStats>('/dashboard');
  },

  // Plan, Tracks & Weeks
  async getTracks(): Promise<Track[]> {
    return request<Track[]>('/tracks');
  },

  async getWeeks(trackId?: string): Promise<Week[]> {
    const q = trackId ? `?trackId=${encodeURIComponent(trackId)}` : '';
    return request<Week[]>(`/weeks${q}`);
  },

  async getWeekDetail(weekId: number): Promise<{ week: Week; days: StudyDay[] }> {
    return request<{ week: Week; days: StudyDay[] }>(`/weeks/${weekId}`);
  },

  async toggleWeekStatus(weekId: number, status: 'COMPLETED' | 'PENDING'): Promise<any> {
    return request(`/weeks/${weekId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Days
  async getDays(params: {
    trackId?: string;
    weekId?: number;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; page: number; limit: number; totalPages: number; days: StudyDay[] }> {
    const searchParams = new URLSearchParams();
    if (params.trackId) searchParams.set('trackId', params.trackId);
    if (params.weekId) searchParams.set('weekId', params.weekId.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    return request(`/days?${searchParams.toString()}`);
  },

  async getDayDetail(dayNumber: number): Promise<{
    day: StudyDay;
    tasks: StudyTask[];
    relatedLeetCode: LeetCodeProblem[];
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }> {
    return request(`/days/${dayNumber}`);
  },

  async toggleDayStatus(dayId: number, status: 'COMPLETED' | 'PENDING'): Promise<any> {
    return request(`/days/${dayId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async saveDayReflection(
    dayId: number,
    reflection: { whatLearned: string; difficult: string; toRevise: string; completedPractical: boolean }
  ): Promise<any> {
    return request(`/days/${dayId}/reflection`, {
      method: 'POST',
      body: JSON.stringify({ reflection }),
    });
  },

  async getRevisionItems(status?: string): Promise<any[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<any[]>(`/revision${q}`);
  },

  // Dedicated Tasks

  async getTaskDetail(taskId: number): Promise<{
    task: StudyTask;
    navigation: {
      prevTask?: { id: number; task_number: number; title: string };
      nextTask?: { id: number; task_number: number; title: string };
      dayId: number;
      dayNumber: number;
    };
    dayProgress: {
      totalTasks: number;
      completedTasks: number;
      progress: number;
      tasks: { id: number; task_number: number; title: string; status: string }[];
    };
    relatedLeetCode: LeetCodeProblem[];
  }> {
    return request(`/tasks/${taskId}`);
  },

  async updateTaskStatus(
    taskId: number,
    status: 'COMPLETED' | 'PENDING',
    revisionStatus?: string,
    notes?: string
  ): Promise<any> {
    return request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, revisionStatus, notes }),
    });
  },

  async updateTaskRevision(taskId: number, revisionStatus: 'NOT_REVIEWED' | 'NEEDS_REVISION' | 'MASTERED'): Promise<any> {
    return request(`/tasks/${taskId}/revision`, {
      method: 'PATCH',
      body: JSON.stringify({ revisionStatus }),
    });
  },

  // LeetCode
  async getLeetcode(params: {
    topic?: string;
    week?: number | string;
    difficulty?: string;
    status?: string;
    search?: string;
  }): Promise<LeetCodeProblem[]> {
    const searchParams = new URLSearchParams();
    if (params.topic && params.topic !== 'All') searchParams.set('topic', params.topic);
    if (params.week && params.week !== 'All') searchParams.set('week', params.week.toString());
    if (params.difficulty && params.difficulty !== 'All') searchParams.set('difficulty', params.difficulty);
    if (params.status && params.status !== 'All') searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);

    return request<LeetCodeProblem[]>(`/leetcode?${searchParams.toString()}`);
  },

  async getLeetcodeStats(): Promise<LeetCodeStats> {
    return request<LeetCodeStats>('/leetcode/stats');
  },

  async addLeetcodeProblem(data: Partial<LeetCodeProblem>): Promise<LeetCodeProblem> {
    return request<LeetCodeProblem>('/leetcode', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleLeetcodeStatus(problemId: number, status: 'COMPLETED' | 'PENDING', notes?: string): Promise<any> {
    return request(`/leetcode/${problemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // Notes
  async getNotes(params?: { taskId?: number; dayId?: number }): Promise<StudyNote[]> {
    const searchParams = new URLSearchParams();
    if (params?.taskId) searchParams.set('taskId', params.taskId.toString());
    if (params?.dayId) searchParams.set('dayId', params.dayId.toString());
    return request<StudyNote[]>(`/notes?${searchParams.toString()}`);
  },

  async saveNote(data: { taskId?: number; dayId?: number; content: string }): Promise<StudyNote> {
    return request<StudyNote>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNote(id: number, content: string): Promise<StudyNote> {
    return request<StudyNote>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  },

  async deleteNote(id: number): Promise<any> {
    return request(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return request<Project[]>('/projects');
  },

  async updateProject(id: number, data: { status: string; repoUrl?: string; demoUrl?: string; notes?: string }): Promise<any> {
    return request(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
