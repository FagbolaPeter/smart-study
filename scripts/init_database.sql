-- SmartStudy Database Schema
-- This script creates the necessary tables for the SmartStudy application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    preferred_study_hours INTEGER DEFAULT 4,
    difficulty_preference DECIMAL(3,2) DEFAULT 0.7,
    time_of_day_preference INTEGER DEFAULT 1, -- 0=morning, 1=afternoon, 2=evening
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    duration DECIMAL(4,2) NOT NULL, -- in hours
    difficulty DECIMAL(3,2) NOT NULL,
    performance DECIMAL(3,2),
    completed BOOLEAN DEFAULT FALSE,
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    break_frequency DECIMAL(3,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Study goals table
CREATE TABLE IF NOT EXISTS study_goals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    target_hours INTEGER NOT NULL,
    current_hours DECIMAL(4,2) DEFAULT 0,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ML recommendations table
CREATE TABLE IF NOT EXISTS ml_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    session_duration DECIMAL(4,2) NOT NULL,
    subject_difficulty DECIMAL(3,2) NOT NULL,
    predicted_performance DECIMAL(3,2) NOT NULL,
    optimal_time VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    google_event_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    event_type VARCHAR(20) DEFAULT 'study', -- study, break, exam
    synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (id, email, display_name, preferred_study_hours, difficulty_preference, time_of_day_preference) 
VALUES ('user1', 'student@example.com', 'John Doe', 5, 0.8, 1);

INSERT INTO study_sessions (id, user_id, subject, duration, difficulty, performance, completed, session_date) VALUES
('session1', 'user1', 'Mathematics', 2.0, 0.8, 0.85, TRUE, '2024-01-20'),
('session2', 'user1', 'Physics', 1.5, 0.7, 0.92, TRUE, '2024-01-20'),
('session3', 'user1', 'Chemistry', 2.5, 0.9, NULL, FALSE, '2024-01-21');

INSERT INTO study_goals (id, user_id, subject, target_hours, current_hours, deadline) VALUES
('goal1', 'user1', 'Mathematics', 20, 15, '2024-02-01'),
('goal2', 'user1', 'Physics', 15, 12, '2024-01-30');

PRINT 'SmartStudy database initialized successfully!';
