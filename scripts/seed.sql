-- Seeded Accounts
-- Password for all accounts: password123
-- Hash: $2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y

-- 1. USERS
INSERT INTO users (user_name, email, password_hash, age, gender, institution, education_level)
VALUES 
('john_carlo', 'john.carlo@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 20, 'male', 'University of the Philippines', 'bachelor'),
('isabella_nicole', 'isabella@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 21, 'female', 'Ateneo de Manila', 'bachelor'),
('max_lennon', 'max@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 19, 'male', 'De La Salle University', 'bachelor'),
('selena_malig', 'selena@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 22, 'female', 'UST', 'master'),
('ishah_bautista', 'ishah@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 23, 'other', 'Mapua University', 'doctorate')
ON CONFLICT (user_name) DO NOTHING;

-- 2. QUESTIONS (Computer Science - DBMS & Web Development focus)
INSERT INTO questions (user_id, content, category, demand_score)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), 'What are the advantages of using a NoSQL database over a relational one for real-time applications?', 'DBMS', 15),
((SELECT user_id FROM users WHERE user_name = 'isabella_nicole'), 'Can someone explain the difference between REST and GraphQL in terms of performance?', 'Web Development', 25),
((SELECT user_id FROM users WHERE user_name = 'max_lennon'), 'How do B-tree indexes improve query performance in PostgreSQL?', 'DBMS', 10),
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), 'What is the Node.js event loop and how does it handle asynchronous I/O?', 'Web Development', 30),
((SELECT user_id FROM users WHERE user_name = 'ishah_bautista'), 'What is the most efficient way to manage global state in a large-scale React application?', 'Web Development', 50);

-- 3. ANSWERS
INSERT INTO answers (user_id, question_id, content, is_accepted)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'ishah_bautista'), (SELECT question_id FROM questions WHERE content LIKE 'How do B-tree indexes%'), 'B-tree indexes allow the database to find rows in logarithmic time by keeping a balanced tree structure of sorted keys.', true),
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), (SELECT question_id FROM questions WHERE content LIKE 'Can someone explain the difference%'), 'REST uses fixed endpoints, while GraphQL allows the client to specify the schema of the response, reducing over-fetching.', false),
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), (SELECT question_id FROM questions WHERE content LIKE 'Can someone explain the difference%'), 'GraphQL is often better for mobile apps where bandwidth is limited, but REST is simpler for basic CRUD APIs.', true);

-- 4. TUTORIALS
INSERT INTO tutorials (user_id, title, content, embedded_video_url)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'ishah_bautista'), 'Mastering React State Management', 'An exploration of Redux Toolkit, Zustand, and React Context for enterprise apps.', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), 'Database Normalization vs Denormalization', 'Understanding when to normalize your schema and when to duplicate data for performance.', NULL);

-- 5. QUESTIONS_TUTORIALS (Junction)
INSERT INTO questions_tutorials (question_id, tutorial_id)
VALUES 
((SELECT question_id FROM questions WHERE content LIKE 'What is the most efficient way%'), (SELECT tutorial_id FROM tutorials WHERE title = 'Mastering React State Management')),
((SELECT question_id FROM questions WHERE content LIKE 'What are the advantages of using a NoSQL%'), (SELECT tutorial_id FROM tutorials WHERE title = 'Database Normalization vs Denormalization'));

-- 6. COMMENTS
INSERT INTO comments (user_id, content, question_id)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'max_lennon'), 'I found that NoSQL is great for horizontal scaling.', (SELECT question_id FROM questions WHERE content LIKE 'What are the advantages of using a NoSQL%'));

INSERT INTO comments (user_id, content, answer_id)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'isabella_nicole'), 'O I I A O O I I I A I', (SELECT answer_id FROM answers WHERE content LIKE 'B-tree indexes allow%'));

INSERT INTO comments (user_id, content, tutorial_id)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), 'The normalization guide was very helpful for my school project.', (SELECT tutorial_id FROM tutorials WHERE title = 'Database Normalization vs Denormalization'));

-- 7. INTERACTIONS
INSERT INTO interactions (user_id, interaction_type, value, question_id)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'max_lennon'), 'react', 1, (SELECT question_id FROM questions WHERE content LIKE 'What is the most efficient way%'));

INSERT INTO interactions (user_id, interaction_type, value, answer_id)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), 'rating', 5, (SELECT answer_id FROM answers WHERE content LIKE 'B-tree indexes allow%'));

INSERT INTO interactions (user_id, interaction_type, value, tutorial_id)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'isabella_nicole'), 'rating', 4, (SELECT tutorial_id FROM tutorials WHERE title = 'Mastering React State Management'));
