-- Update question_details view to include upvotes and downvotes
DROP VIEW IF EXISTS question_details;
CREATE VIEW question_details AS
SELECT
  q.question_id,
  q.user_id,
  q.title,
  q.body,
  q.content,
  q.category,
  q.demand_score,
  q.popped,
  q.created_at,
  q.resolved_at,
  u.user_name,
  u.institution,
  u.degree_program,
  u.profile_url,
  u.credibility_score,
  COUNT(DISTINCT a.answer_id) as answer_count,
  COUNT(DISTINCT c.comment_id) as comment_count,
  COUNT(DISTINCT CASE WHEN a.is_accepted = true THEN a.answer_id END) as has_accepted_answer,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'react' AND i.value > 0 THEN i.interaction_id END) as upvotes,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'react' AND i.value < 0 THEN i.interaction_id END) as downvotes
FROM questions q
JOIN users u ON q.user_id = u.user_id
LEFT JOIN answers a ON q.question_id = a.question_id
LEFT JOIN comments c ON q.question_id = c.question_id
LEFT JOIN interactions i ON q.question_id = i.question_id
GROUP BY q.question_id, q.user_id, q.title, q.body, q.content, q.category, q.demand_score, q.popped, q.created_at, q.resolved_at, u.user_name, u.institution, u.degree_program, u.profile_url, u.credibility_score;

-- Update tutorial_stats view to include upvotes and downvotes
DROP VIEW IF EXISTS tutorial_stats;
CREATE VIEW tutorial_stats AS
SELECT
  t.tutorial_id,
  t.user_id,
  t.title,
  t.content,
  t.embedded_video_url,
  t.created_at,
  u.user_name,
  u.profile_url,
  u.institution,
  u.degree_program,
  COUNT(DISTINCT i.interaction_id) as total_interactions,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'rating' THEN i.interaction_id END) as rating_count,
  AVG(CASE WHEN i.interaction_type = 'rating' THEN i.value END) as avg_rating,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'react' AND i.value > 0 THEN i.interaction_id END) as upvotes,
  COUNT(DISTINCT CASE WHEN i.interaction_type = 'react' AND i.value < 0 THEN i.interaction_id END) as downvotes
FROM tutorials t
JOIN users u ON t.user_id = u.user_id
LEFT JOIN interactions i ON t.tutorial_id = i.tutorial_id
WHERE t.deleted_at IS NULL
GROUP BY t.tutorial_id, t.user_id, t.title, t.content, t.embedded_video_url, t.created_at, u.user_name, u.profile_url, u.institution, u.degree_program;
