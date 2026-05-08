-- Seeded Accounts
-- Password for all accounts: password123
-- Hash: $2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y

-- 1. USERS
INSERT INTO users (user_name, email, password_hash, age, gender, institution, education_level, profile_url, credibility_score)
VALUES 
('john_carlo', 'john.carlo@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 20, 'male', 'University of the Philippines', 'bachelor', 'https://i.pravatar.cc/150?img=33', 91),
('isabella_nicole', 'isabella@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 21, 'female', 'Ateneo de Manila', 'bachelor', 'https://i.pravatar.cc/150?img=12', 75),
('max_lennon', 'max@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 19, 'male', 'De La SALLE University', 'bachelor', 'https://i.pravatar.cc/150?img=25', 80),
('selena_malig', 'selena@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 22, 'female', 'UST', 'master', 'https://i.pravatar.cc/150?img=44', 63),
('ishah_bautista', 'ishah@example.com', '$2b$10$0D8jY/64AvKiUut6CD/sLehZSJAEJL1f1mP.YMymlaPGhM5MW8x0y', 23, 'other', 'Mapua University', 'doctorate', 'https://i.pravatar.cc/150?img=55', 28)
ON CONFLICT (user_name) DO NOTHING;

-- 2. QUESTIONS (Computer Science - DBMS & Web Development focus)
INSERT INTO questions (user_id, title, content, category, demand_score)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), 'NoSQL vs Relational', 'What are the advantages of using a NoSQL database over a relational one for real-time applications?', 'DBMS', 15),
((SELECT user_id FROM users WHERE user_name = 'isabella_nicole'), 'REST vs GraphQL', 'Can someone explain the difference between REST and GraphQL in terms of performance?', 'Web Development', 25),
((SELECT user_id FROM users WHERE user_name = 'max_lennon'), 'B-tree Indexes', 'How do B-tree indexes improve query performance in PostgreSQL?', 'DBMS', 10),
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), 'Node.js Event Loop', 'What is the Node.js event loop and how does it handle asynchronous I/O?', 'Web Development', 30),
((SELECT user_id FROM users WHERE user_name = 'ishah_bautista'), 'React State Management', 'What is the most efficient way to manage global state in a large-scale React application?', 'Web Development', 50),
-- Mock Data from QuestionsPage
((SELECT user_id FROM users WHERE user_name = 'isabella_nicole'), 'How do I properly structure reusable React card components in Next.js with TypeScript?', 'I''m currently building reusable QuestionCard, AnswerCard, and CommentCard components. I want them to support nesting, voting, credibility badges, and expandable answers while keeping the code clean and maintainable.', 'React, Next.js, TypeScript', 88),
((SELECT user_id FROM users WHERE user_name = 'max_lennon'), 'What is the best way to manage deeply nested comments in React?', 'I want Reddit-style nested comments but I''m worried about performance and recursive rendering issues.', 'Frontend, Architecture, UI', 54),
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), 'Should all reusable component props be stored in one shared types folder?', 'I''m unsure whether I should centralize all interfaces or keep types close to their components.', 'TypeScript, Project Structure', 23);

-- 3. ANSWERS
INSERT INTO answers (user_id, question_id, content, media_urls, is_accepted)
VALUES 
((SELECT user_id FROM users WHERE user_name = 'ishah_bautista'), (SELECT question_id FROM questions WHERE content LIKE 'How do B-tree indexes%'), 'B-tree indexes allow the database to find rows in logarithmic time by keeping a balanced tree structure of sorted keys.', '[]'::jsonb, true),
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), (SELECT question_id FROM questions WHERE content LIKE 'Can someone explain the difference%'), 'REST uses fixed endpoints, while GraphQL allows the client to specify the schema of the response, reducing over-fetching.', '[]'::jsonb, false),
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), (SELECT question_id FROM questions WHERE content LIKE 'Can someone explain the difference%'), 'GraphQL is often better for mobile apps where bandwidth is limited, but REST is simpler for basic CRUD APIs.', '[]'::jsonb, true),
-- Answers for the first mock question
((SELECT user_id FROM users WHERE user_name = 'john_carlo'), (SELECT question_id FROM questions WHERE title = 'How do I properly structure reusable React card components in Next.js with TypeScript?'), 'TypeScript becomes easier when you start defining reusable interfaces for your components. You should also separate UI components from business logic whenever possible.', '[{"type": "image", "url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop"}]'::jsonb, true),
((SELECT user_id FROM users WHERE user_name = 'selena_malig'), (SELECT question_id FROM questions WHERE title = 'How do I properly structure reusable React card components in Next.js with TypeScript?'), 'You can improve maintainability by creating a shared type file for all cards. That way, QuestionCard, AnswerCard, and CommentCard all share consistent structures.', '[{"type": "video", "url": "https://www.w3schools.com/html/mov_bbb.mp4"}]'::jsonb, false),
((SELECT user_id FROM users WHERE user_name = 'ishah_bautista'), (SELECT question_id FROM questions WHERE title = 'How do I properly structure reusable React card components in Next.js with TypeScript?'), 'I think you should just put everything in one component file so it''s easier to manage.', '[]'::jsonb, false);

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
