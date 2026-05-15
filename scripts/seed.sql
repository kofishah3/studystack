-- Seeded Accounts
-- Password for all accounts: password123
-- Hash: $2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y

-- =========================
-- 1. USERS
-- =========================
INSERT INTO users (user_name, email, password_hash, age, gender, institution, education_level, profile_url, credibility_score)
VALUES
('john_carlo', 'john.carlo@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 20, 'male', 'University of the Philippines', 'bachelor', 'https://i.pravatar.cc/150?img=33', 91),
('isabella_nicole', 'isabella@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 21, 'female', 'Ateneo de Manila', 'bachelor', 'https://i.pravatar.cc/150?img=12', 75),
('max_lennon', 'max@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 19, 'male', 'De La Salle University', 'bachelor', 'https://i.pravatar.cc/150?img=25', 80),
('selena_malig', 'selena@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 22, 'female', 'UST', 'master', 'https://i.pravatar.cc/150?img=44', 63),
('ishah_bautista', 'ishah@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 23, 'other', 'Mapua University', 'doctorate', 'https://i.pravatar.cc/150?img=55', 28)
ON CONFLICT (user_name) DO NOTHING;

-- =========================
-- 2. QUESTIONS
-- =========================
INSERT INTO questions (user_id, title, content, category, demand_score)
VALUES
((SELECT user_id FROM users WHERE user_name='john_carlo'),
 'NoSQL vs Relational',
 'What are the advantages of using NoSQL vs relational DB?',
 'DBMS', 15),

((SELECT user_id FROM users WHERE user_name='isabella_nicole'),
 'REST vs GraphQL',
 'Difference between REST and GraphQL performance?',
 'Web Development', 25),

((SELECT user_id FROM users WHERE user_name='max_lennon'),
 'B-tree Indexes',
 'How do B-tree indexes improve performance?',
 'DBMS', 10),

((SELECT user_id FROM users WHERE user_name='selena_malig'),
 'Node.js Event Loop',
 'How does Node.js handle async I/O?',
 'Web Development', 30),

((SELECT user_id FROM users WHERE user_name='ishah_bautista'),
 'React State Management',
 'Best way to manage global state in React?',
 'Web Development', 50),

((SELECT user_id FROM users WHERE user_name='isabella_nicole'),
 'React Components Structure',
 'Reusable QuestionCard, AnswerCard, CommentCard design?',
 'React', 88),

((SELECT user_id FROM users WHERE user_name='max_lennon'),
 'Nested Comments in React',
 'How to handle recursive comments efficiently?',
 'Frontend', 54),

((SELECT user_id FROM users WHERE user_name='john_carlo'),
 'Shared Types in TypeScript',
 'Should types be centralized or per-component?',
 'TypeScript', 23);

-- =========================
-- 3. ANSWERS
-- =========================
INSERT INTO answers (user_id, question_id, content, media_urls, is_accepted)
VALUES
(
(SELECT user_id FROM users WHERE user_name='ishah_bautista'),
(SELECT question_id FROM questions WHERE title='B-tree Indexes'),
'B-tree indexes allow fast lookup via balanced tree traversal.',
'[]'::jsonb,
true
),

(
(SELECT user_id FROM users WHERE user_name='john_carlo'),
(SELECT question_id FROM questions WHERE title='REST vs GraphQL'),
'REST uses fixed endpoints GraphQL lets clients query flexible data.',
'[]'::jsonb,
false
),

(
(SELECT user_id FROM users WHERE user_name='selena_malig'),
(SELECT question_id FROM questions WHERE title='REST vs GraphQL'),
'GraphQL reduces over-fetching in mobile apps.',
'[]'::jsonb,
true
),

(
(SELECT user_id FROM users WHERE user_name='john_carlo'),
(SELECT question_id FROM questions WHERE title='React Components Structure'),
'Use reusable interfaces and separate UI from logic.',
'[{"type":"image","url":"https://images.unsplash.com/photo-1515879218367-8466d910aaa4"}]'::jsonb,
true
),

(
(SELECT user_id FROM users WHERE user_name='selena_malig'),
(SELECT question_id FROM questions WHERE title='React Components Structure'),
'Shared types improve maintainability.',
'[{"type":"video","url":"https://www.w3schools.com/html/mov_bbb.mp4"}]'::jsonb,
false
),

(
(SELECT user_id FROM users WHERE user_name='ishah_bautista'),
(SELECT question_id FROM questions WHERE title='React Components Structure'),
'Put everything in one file for simplicity.',
'[]'::jsonb,
false
);

-- =========================
-- 4. TUTORIALS
-- =========================
INSERT INTO tutorials (user_id, title, content, embedded_video_url)
VALUES
((SELECT user_id FROM users WHERE user_name='ishah_bautista'),
'Mastering React State Management',
'Redux, Zustand, and Context patterns',
'https://www.youtube.com/embed/dQw4w9WgXcQ'),

((SELECT user_id FROM users WHERE user_name='selena_malig'),
'Database Normalization',
'When to normalize vs denormalize',
NULL);

-- =========================
-- 5. QUESTIONS_TUTORIALS
-- =========================
INSERT INTO questions_tutorials (question_id, tutorial_id)
VALUES
(
(SELECT question_id FROM questions WHERE title='React State Management'),
(SELECT tutorial_id FROM tutorials WHERE title='Mastering React State Management')
),

(
(SELECT question_id FROM questions WHERE title='NoSQL vs Relational'),
(SELECT tutorial_id FROM tutorials WHERE title='Database Normalization')
);

-- =========================
-- 6. COMMENTS
-- =========================
INSERT INTO comments (user_id, content, question_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='max_lennon'),
'I like NoSQL for scaling.',
(SELECT question_id FROM questions WHERE title='NoSQL vs Relational')
);

INSERT INTO comments (user_id, content, answer_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='isabella_nicole'),
'Great explanation!',
(SELECT answer_id FROM answers WHERE content LIKE 'B-tree%')
);

INSERT INTO comments (user_id, content, tutorial_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='john_carlo'),
'Very helpful tutorial.',
(SELECT tutorial_id FROM tutorials WHERE title='Database Normalization')
);

-- =========================
-- 7. INTERACTIONS
-- =========================
INSERT INTO interactions (user_id, interaction_type, value, question_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='max_lennon'),
'react',
1,
(SELECT question_id FROM questions WHERE title='React State Management')
);

INSERT INTO interactions (user_id, interaction_type, value, answer_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='selena_malig'),
'rating',
5,
(SELECT answer_id FROM answers WHERE content LIKE 'B-tree%')
);

INSERT INTO interactions (user_id, interaction_type, value, tutorial_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='isabella_nicole'),
'rating',
4,
(SELECT tutorial_id FROM tutorials WHERE title='Mastering React State Management')
);