-- PostgreSQL Schema for 200 Days CSE Mastery Hub

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS weeks (
    id INTEGER PRIMARY KEY,
    week_number INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    track_id VARCHAR(50) REFERENCES tracks(id)
);

CREATE TABLE IF NOT EXISTS study_days (
    id INTEGER PRIMARY KEY,
    day_number INTEGER UNIQUE NOT NULL,
    week_id INTEGER REFERENCES weeks(id) ON DELETE CASCADE,
    track_id VARCHAR(50) REFERENCES tracks(id),
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    overview TEXT NOT NULL,
    learning_objectives TEXT,
    estimated_minutes INTEGER DEFAULT 90,
    practical_task TEXT,
    checklist TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_tasks (
    id INTEGER PRIMARY KEY,
    day_id INTEGER REFERENCES study_days(id) ON DELETE CASCADE,
    task_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255),
    track VARCHAR(50),
    topic VARCHAR(255),
    description TEXT,
    content TEXT NOT NULL,
    examples TEXT,
    code_examples TEXT,
    interview_questions TEXT,
    common_mistakes TEXT,
    practical_exercise TEXT,
    checklist TEXT,
    estimated_minutes INTEGER DEFAULT 25,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    is_mandatory BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES study_tasks(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING',
    revision_status VARCHAR(50) DEFAULT 'NOT_REVIEWED',
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, task_id)
);

CREATE TABLE IF NOT EXISTS day_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_id INTEGER REFERENCES study_days(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING',
    reflection TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day_id)
);

CREATE TABLE IF NOT EXISTS week_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    week_id INTEGER REFERENCES weeks(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_id)
);

CREATE TABLE IF NOT EXISTS topic_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic_name VARCHAR(255) NOT NULL,
    track_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_name, track_id)
);

CREATE TABLE IF NOT EXISTS leetcode_problems (
    id SERIAL PRIMARY KEY,
    leetcode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255),
    week_id INTEGER,
    related_day_id INTEGER,
    related_task_id INTEGER,
    url VARCHAR(500),
    solution_approach TEXT,
    time_complexity VARCHAR(100),
    space_complexity VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leetcode_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES leetcode_problems(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS study_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_id INTEGER REFERENCES study_days(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES study_tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(100),
    track_id VARCHAR(50),
    tech_stack TEXT,
    requirements TEXT
);

CREATE TABLE IF NOT EXISTS project_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING',
    repo_url VARCHAR(500),
    demo_url VARCHAR(500),
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_study_days_day_num ON study_days(day_number);
CREATE INDEX IF NOT EXISTS idx_study_days_week_id ON study_days(week_id);
CREATE INDEX IF NOT EXISTS idx_study_days_track_id ON study_days(track_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_day_id ON study_tasks(day_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_task ON study_progress(user_id, task_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_status ON study_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_revision ON study_progress(user_id, revision_status);
CREATE INDEX IF NOT EXISTS idx_day_progress_user_day ON day_progress(user_id, day_id);
CREATE INDEX IF NOT EXISTS idx_day_progress_user_status ON day_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leetcode_num ON leetcode_problems(leetcode_number);
CREATE INDEX IF NOT EXISTS idx_leetcode_progress_user ON leetcode_progress(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_leetcode_progress_user_status ON leetcode_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_notes_user ON study_notes(user_id);

