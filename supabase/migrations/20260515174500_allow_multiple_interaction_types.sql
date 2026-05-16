-- Allow users to have both a 'react' and a 'rating' interaction for the same target
-- This fixes the issue where rating a tutorial would overwrite the upvote/downvote.

-- 1. Drop existing unique partial indexes
DROP INDEX IF EXISTS unique_user_question_interaction;
DROP INDEX IF EXISTS unique_user_answer_interaction;
DROP INDEX IF EXISTS unique_user_comment_interaction;
DROP INDEX IF EXISTS unique_user_tutorial_interaction;

-- 2. Create new unique partial indexes including interaction_type
CREATE UNIQUE INDEX unique_user_question_interaction_type ON interactions(user_id, question_id, interaction_type) WHERE question_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_answer_interaction_type ON interactions(user_id, answer_id, interaction_type) WHERE answer_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_comment_interaction_type ON interactions(user_id, comment_id, interaction_type) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX unique_user_tutorial_interaction_type ON interactions(user_id, tutorial_id, interaction_type) WHERE tutorial_id IS NOT NULL;
