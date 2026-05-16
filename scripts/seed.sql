-- Seeded Accounts
-- Password for all accounts: password123
-- Hash: $2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y

-- =========================
-- 1. USERS
-- =========================
INSERT INTO users (user_name, email, password_hash, age, gender, institution, education_level, degree_program, profile_url, credibility_score)
VALUES
('john_carlo', 'john.carlo@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 20, 'male', 'University of the Philippines Cebu', 'bachelor', 'BS Computer Science', 'https://i.pravatar.cc/150?img=33', 91),
('isabella_nicole', 'isabella@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 21, 'female', 'University of the Philippines Cebu', 'bachelor', 'BS Computer Science', 'https://i.pravatar.cc/150?img=12', 75),
('max_lennon', 'max@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 19, 'male', 'University of the Philippines Cebu', 'bachelor', 'BS Computer Science', 'https://i.pravatar.cc/150?img=25', 80),
('selena_malig', 'selena@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 22, 'female', 'University of the Philippines Cebu', 'master', 'BS Computer Science', 'https://i.pravatar.cc/150?img=44', 63),
('ishah_bautista', 'ishah@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 23, 'other', 'University of San Carlos', 'doctorate', 'BS Information Technology', 'https://i.pravatar.cc/150?img=55', 28)
ON CONFLICT (user_name) DO NOTHING;

-- =========================
-- 2. QUESTIONS
-- =========================
INSERT INTO questions (user_id, title, content, category, demand_score)
VALUES
((SELECT user_id FROM users WHERE user_name='john_carlo'),
 'sql or nosql???',
 'genuine question: when is nosql actually better than standard sql? feels like postgres does everything now lol',
 'DBMS', 45),

((SELECT user_id FROM users WHERE user_name='isabella_nicole'),
 'is graphql actually better than rest or am i trippin',
 'everyone says graphql is the future but it feels like so much setup... is the performance gain even worth it for mid-sized apps?',
 'Web Development', 65),

((SELECT user_id FROM users WHERE user_name='max_lennon'),
 'b-tree indexes simplified pls',
 'i keep seeing this in my exams. how do they actually make queries faster without all the math jargon?',
 'DBMS', 30),

((SELECT user_id FROM users WHERE user_name='selena_malig'),
 'how does the node event loop even work',
 'tried watching 5 vids on this and im still lost. can someone explain it like im 5? how does it handle async stuff if its single threaded?',
 'Web Development', 80),

((SELECT user_id FROM users WHERE user_name='ishah_bautista'),
 'best way to handle global state in 2026',
 'redux feels too heavy now. should i just stick to zustand or is there something even better out now?',
 'Web Development', 95),

((SELECT user_id FROM users WHERE user_name='isabella_nicole'),
 'reusable card designs for feed apps',
 'trying to build a clean feed. how do u guys structure your question and answer cards so they dont look messy?',
 'React', 88),

((SELECT user_id FROM users WHERE user_name='max_lennon'),
 'help w nested comments',
 'doing a threaded comment system... recursive components are breaking my brain. any tips on keeping it efficient?',
 'Frontend', 54),

((SELECT user_id FROM users WHERE user_name='john_carlo'),
 'centralized types vs per-component types',
 'in typescript do u guys prefer one big types.ts file or keeping types next to the components? which is better for scaling?',
 'TypeScript', 43);

-- =========================
-- 3. ANSWERS
-- =========================
INSERT INTO answers (user_id, question_id, content, media_urls, is_accepted)
VALUES
(
(SELECT user_id FROM users WHERE user_name='ishah_bautista'),
(SELECT question_id FROM questions WHERE title='b-tree indexes simplified pls'),
'think of it like a library index. instead of checking every book, u just go to the right shelf then the right row. saves way more time.',
'[]'::jsonb,
true
),

(
(SELECT user_id FROM users WHERE user_name='john_carlo'),
(SELECT question_id FROM questions WHERE title='is graphql actually better than rest or am i trippin'),
'it depends but honestly for mid-sized stuff rest is usually fine. graphql only shines when u have super complex nested data.',
'[]'::jsonb,
false
),

(
(SELECT user_id FROM users WHERE user_name='selena_malig'),
(SELECT question_id FROM questions WHERE title='is graphql actually better than rest or am i trippin'),
'mostly worth it for avoiding overfetching. mobile apps love it bc u only get exactly what u need.',
'[]'::jsonb,
true
),

(
(SELECT user_id FROM users WHERE user_name='john_carlo'),
(SELECT question_id FROM questions WHERE title='reusable card designs for feed apps'),
'keep your logic separate. just pass the data as props and keep the card "dumb" for easier testing.',
'[{"type":"image","url":"https://images.unsplash.com/photo-1515879218367-8466d910aaa4"}]'::jsonb,
true
),

(
(SELECT user_id FROM users WHERE user_name='selena_malig'),
(SELECT question_id FROM questions WHERE title='reusable card designs for feed apps'),
'def use shared types. makes everything so much cleaner when u know exactly what the card expects.',
'[{"type":"video","url":"https://www.w3schools.com/html/mov_bbb.mp4"}]'::jsonb,
false
);

-- =========================
-- 4. TUTORIALS
-- =========================
INSERT INTO tutorials (user_id, title, content, embedded_video_url)
VALUES
((SELECT user_id FROM users WHERE user_name='ishah_bautista'),
'Modern State Management w/ Zustand',
'quick guide on ditching redux for zustand. its way faster n cleaner. no more boilerplate hell.',
'https://www.youtube.com/embed/dQw4w9WgXcQ'),

((SELECT user_id FROM users WHERE user_name='selena_malig'),
'Database Normalization: The Real Way',
'stop over-normalizing everything. here is when to keep things together vs when to split them up.',
NULL);

-- =========================
-- 5. QUESTIONS_TUTORIALS
-- =========================
INSERT INTO questions_tutorials (question_id, tutorial_id)
VALUES
(
(SELECT question_id FROM questions WHERE title='best way to handle global state in 2026'),
(SELECT tutorial_id FROM tutorials WHERE title='Modern State Management w/ Zustand')
),

(
(SELECT question_id FROM questions WHERE title='sql or nosql???'),
(SELECT tutorial_id FROM tutorials WHERE title='Database Normalization: The Real Way')
);

-- =========================
-- 6. COMMENTS
-- =========================
INSERT INTO comments (user_id, content, question_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='max_lennon'),
'i like nosql for scaling tbh',
(SELECT question_id FROM questions WHERE title='sql or nosql???')
);

INSERT INTO comments (user_id, content, answer_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='isabella_nicole'),
'actually helpful, thanks',
(SELECT answer_id FROM answers WHERE content LIKE 'think of it like%')
);

INSERT INTO comments (user_id, content, tutorial_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='john_carlo'),
'needed this for my midterms',
(SELECT tutorial_id FROM tutorials WHERE title='Database Normalization: The Real Way')
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
(SELECT question_id FROM questions WHERE title='best way to handle global state in 2026')
);

INSERT INTO interactions (user_id, interaction_type, value, answer_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='selena_malig'),
'rating',
5,
(SELECT answer_id FROM answers WHERE content LIKE 'think of it like%')
);

INSERT INTO interactions (user_id, interaction_type, value, tutorial_id)
VALUES
(
(SELECT user_id FROM users WHERE user_name='isabella_nicole'),
'rating',
4,
(SELECT tutorial_id FROM tutorials WHERE title='Modern State Management w/ Zustand')
);