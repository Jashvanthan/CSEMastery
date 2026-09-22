export interface User {
  id: number;
  email: string;
  name: string;
  start_date: string;
  created_at?: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalDays?: number;
  completedDays?: number;
  pendingDays?: number;
  progress?: number;
  totalWeeks?: number;
  completedWeeks?: number;
  pendingWeeks?: number;
}

export interface Week {
  id: number;
  week_number: number;
  title: string;
  description: string;
  track_id: string;
  track_name?: string;
  track_color?: string;
  total?: number;
  totalDays?: number;
  completed?: number;
  completedDays?: number;
  percentage?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  formattedDateRange?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface StudyDay {
  id: number;
  day_number: number;
  week_id: number;
  week_number?: number;
  track_id: string;
  track_name?: string;
  track_color?: string;
  title: string;
  topic: string;
  overview: string;
  learning_objectives: string[] | string;
  estimated_minutes: number;
  practical_task: string;
  checklist: string[] | string;
  status: 'PENDING' | 'COMPLETED';
  completed_at?: string;
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
  tasks?: StudyTask[];
  scheduledDate?: string;
  formattedDate?: string;
  reflection?: {

    whatLearned?: string;
    difficult?: string;
    toRevise?: string;
    completedPractical?: boolean;
  };
}

export interface StudyTask {
  id: number;
  day_id: number;
  task_number: number;
  title: string;
  slug: string;
  subtopic: string;
  track: string;
  topic: string;
  description: string;
  content: string;
  examples?: string;
  code_examples?: string;
  interview_questions?: string;
  common_mistakes?: string;
  practical_exercise?: string;
  checklist: string[] | string;
  estimated_minutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  is_mandatory: boolean;
  sort_order: number;
  status: 'PENDING' | 'COMPLETED';
  revision_status: 'NOT_REVIEWED' | 'NEEDS_REVISION' | 'MASTERED';
  completed_at?: string;
  user_notes?: string;
  scheduledDate?: string;
  formattedDate?: string;
}

export interface LeetCodeProblem {
  id: number;
  leetcode_number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  subtopic: string;
  week_id: number;
  related_day_id?: number;
  related_task_id?: number;
  url: string;
  solution_approach?: string;
  time_complexity?: string;
  space_complexity?: string;
  status: 'PENDING' | 'COMPLETED';
  user_notes?: string;
  completed_at?: string;
}

export interface LeetCodeStats {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
  difficulty: {
    easy: { completed: number; total: number };
    medium: { completed: number; total: number };
    hard: { completed: number; total: number };
  };
  topicBreakdown: {
    topic: string;
    total: number;
    completed: number;
    percentage: number;
  }[];
}

export interface DashboardStats {
  startDate?: string;
  formattedStartDate?: string;
  targetEndDate?: string;
  formattedTargetEndDate?: string;
  todayCalendarDate?: string;
  daysSinceStart?: number;
  isStarted?: boolean;
  scheduleStatus?: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'UPCOMING';
  scheduleDifference?: number;
  paceMessage?: string;
  nextIncompleteDay?: number;
  nextDay?: StudyDay;
  totalDays: number;
  completedDays: number;
  pendingDays: number;
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  currentDay: number;
  currentWeek: number;
  pendingUntilToday: number;
  overallPendingDays: number;
  totalTopicsCount: number;
  completedTopicsCount: number;
  pendingTopicsCount: number;
  totalWeeks: number;
  completedWeeksCount: number;
  pendingWeeksCount: number;
  today: StudyDay;

  trackProgress: {
    id: string;
    name: string;
    color: string;
    icon: string;
    total: number;
    completed: number;
    pending: number;
    progress: number;
  }[];
  weekProgress: Week[];
  streak: {
    current: number;
    longest: number;
  };
  leetcode: {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
    easyCompleted: number;
    mediumCompleted: number;
    hardCompleted: number;
  };
  revision: {
    needsRevision: number;
    mastered: number;
  };
}

export interface Project {
  id: number;
  title: string;
  description: string;
  phase: string;
  track_id: string;
  tech_stack: string;
  requirements: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  repo_url?: string;
  demo_url?: string;
  user_notes?: string;
}

export interface StudyNote {
  id: number;
  task_id?: number;
  day_id?: number;
  task_title?: string;
  day_number?: number;
  day_title?: string;
  content: string;
  updated_at: string;
}

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  start_date: string;
  completedDays: number;
  completedTasks: number;
  solvedLeetCode: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  email: string;
  start_date: string;
  completedDays: number;
  completedTasks: number;
  masteredTasks: number;
  solvedLeetCode: number;
  notesCount: number;
  progressPercentage: number;
  streak: number;
  badge: string;
  isCurrentUser: boolean;
}

