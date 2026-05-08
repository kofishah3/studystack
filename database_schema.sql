-- Enable UUID extension (older pg versions)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (no dependencies)
-- ============================================
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  institution VARCHAR(255),
  education_level VARCHAR(20) CHECK (education_level IN ('high_school', 'bachelor', 'master', 'doctorate', 'other')),
  profile_url VARCHAR(1000),
  credibility_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. QUESTIONS TABLE (depends on users)
-- ============================================
CREATE TABLE questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  demand_score INTEGER DEFAULT 0,
  popped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 3. TUTORIALS TABLE (depends on users, questions)
-- ============================================
CREATE TABLE tutorials (
  tutorial_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(question_id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  embedded_video_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ============================================
-- 4. ANSWERS TABLE (depends on users, questions)
-- ============================================
CREATE TABLE answers (
  answer_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. COMMENTS TABLE (depends on users, questions, answers, tutorials)
-- ============================================
CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(question_id) ON DELETE CASCADE,
  answer_id INTEGER REFERENCES answers(answer_id) ON DELETE CASCADE,
  tutorial_id UUID REFERENCES tutorials(tutorial_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL AND tutorial_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL AND tutorial_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NULL AND tutorial_id IS NOT NULL)
  )
);

-- ============================================
-- 6. QUESTIONS_TUTORIALS JUNCTION TABLE
-- ============================================
CREATE TABLE questions_tutorials (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES tutorials(tutorial_id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tutorial_id)
);

-- ============================================
-- 7. INTERACTIONS TABLE (depends on all content tables)
-- ============================================
CREATE TABLE interactions (
  interaction_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  interaction_type VARCHAR(10) CHECK (interaction_type IN ('react', 'rating')),
  value INTEGER,
  question_id UUID REFERENCES questions(question_id) ON DELETE CASCADE,
  answer_id INTEGER REFERENCES answers(answer_id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
  tutorial_id UUID REFERENCES tutorials(tutorial_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL AND comment_id IS NULL AND tutorial_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NOT NULL AND comment_id IS NULL AND tutorial_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NULL AND comment_id IS NOT NULL AND tutorial_id IS NULL) OR
    (question_id IS NULL AND answer_id IS NULL AND comment_id IS NULL AND tutorial_id IS NOT NULL)
  )
);

-- ============================================
-- INDEXES (create after all tables exist)
-- ============================================

-- Questions indexes
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_popped ON questions(popped);
CREATE INDEX idx_questions_demand_score ON questions(demand_score DESC);

-- Answers indexes
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_is_accepted ON answers(is_accepted);

-- Unique partial index for accepted answers
CREATE UNIQUE INDEX unique_accepted_answer ON answers(question_id) WHERE is_accepted = true;

-- Tutorials indexes
CREATE INDEX idx_tutorials_user_id ON tutorials(user_id);
CREATE INDEX idx_tutorials_question_id ON tutorials(question_id);
CREATE INDEX idx_tutorials_created_at ON tutorials(created_at DESC);

-- Comments indexes
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_question_id ON comments(question_id);
CREATE INDEX idx_comments_answer_id ON comments(answer_id);
CREATE INDEX idx_comments_tutorial_id ON comments(tutorial_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Questions_Tutorials indexes
CREATE INDEX idx_questions_tutorials_tutorial_id ON questions_tutorials(tutorial_id);

-- Interactions indexes
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_question_id ON interactions(question_id);
CREATE INDEX idx_interactions_answer_id ON interactions(answer_id);
CREATE INDEX idx_interactions_comment_id ON interactions(comment_id);
CREATE INDEX idx_interactions_tutorial_id ON interactions(tutorial_id);
CREATE INDEX idx_interactions_type ON interactions(interaction_type);

-- Unique partial indexes for interactions
CREATE UNIQUE INDEX unique_user_question_interaction ON interactions(user_id, question_id) WHERE question_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_answer_interaction ON interactions(user_id, answer_id) WHERE answer_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_comment_interaction ON interactions(user_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_tutorial_interaction ON interactions(user_id, tutorial_id) WHERE tutorial_id IS NOT NULL;

-- ============================================
-- VIEWS
-- ============================================

-- Questions with author info and statistics
CREATE VIEW question_details AS
SELECT
  q.question_id,
  q.user_id,
  q.title,
  q.content,
  q.category,
  q.demand_score,
  q.popped,
  q.created_at,
  q.resolved_at,
  u.user_name,
  u.institution,
  u.profile_url,
  u.credibility_score,
  COUNT(DISTINCT a.answer_id) as answer_count,
  COUNT(DISTINCT c.comment_id) as comment_count,
  COUNT(DISTINCT CASE WHEN a.is_accepted = true THEN a.answer_id END) as has_accepted_answer
FROM questions q
JOIN users u ON q.user_id = u.user_id
LEFT JOIN answers a ON q.question_id = a.question_id
LEFT JOIN comments c ON q.question_id = c.question_id
GROUP BY q.question_id, q.user_id, q.title, q.content, q.category, q.demand_score, q.popped, q.created_at, q.resolved_at, u.user_name, u.institution, u.profile_url, u.credibility_score;

-- Tutorials with popularity
CREATE VIEW tutorial_stats AS
SELECT
  t.tutorial_id,
  t.user_id,
  t.question_id,
  t.title,
  t.content,
  t.embedded_video_url,
  t.created_at,
  u.user_name,
  COUNT(DISTINCT i.interaction_id) as total_interactions,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'rating' THEN i.interaction_id END) as rating_count,
  AVG(CASE WHEN i.interaction_type = 'rating' THEN i.value END) as avg_rating
FROM tutorials t
JOIN users u ON t.user_id = u.user_id
LEFT JOIN interactions i ON t.tutorial_id = i.tutorial_id
WHERE t.deleted_at IS NULL
GROUP BY t.tutorial_id, t.user_id, t.question_id, t.title, t.content, t.embedded_video_url, t.created_at, u.user_name;

-- ============================================
-- MIGRATIONS
-- ============================================

-- Soft delete support for tutorials
CREATE INDEX IF NOT EXISTS idx_tutorials_deleted_at ON tutorials(deleted_at) WHERE deleted_at IS NOT NULL;

-- Tutorial materials (uploaded files) table
CREATE TABLE IF NOT EXISTS tutorial_materials (
  material_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id  UUID NOT NULL REFERENCES tutorials(tutorial_id) ON DELETE CASCADE,
  file_name    VARCHAR(255) NOT NULL,
  storage_key  VARCHAR(1000) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  size_bytes   BIGINT NOT NULL,
  uploaded_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tutorial_materials_tutorial_id ON tutorial_materials(tutorial_id);

-- Drop legacy single-question FK on tutorials; questions_tutorials is the only link.
DROP VIEW IF EXISTS tutorial_stats;
DROP INDEX IF EXISTS idx_tutorials_question_id;
ALTER TABLE tutorials DROP COLUMN IF EXISTS question_id;

CREATE VIEW tutorial_stats AS
SELECT
  t.tutorial_id,
  t.user_id,
  t.title,
  t.content,
  t.embedded_video_url,
  t.created_at,
  u.user_name,
  COUNT(DISTINCT i.interaction_id) as total_interactions,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'rating' THEN i.interaction_id END) as rating_count,
  AVG(CASE WHEN i.interaction_type = 'rating' THEN i.value END) as avg_rating
FROM tutorials t
JOIN users u ON t.user_id = u.user_id
LEFT JOIN interactions i ON t.tutorial_id = i.tutorial_id
WHERE t.deleted_at IS NULL
GROUP BY t.tutorial_id, t.user_id, t.title, t.content, t.embedded_video_url, t.created_at, u.user_name;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
