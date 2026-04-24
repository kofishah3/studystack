export interface User {
  user_id: string;
  user_name: string;
  email: string;
  password_hash: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  institution: string;
  education_level: 'high_school' | 'bachelor' | 'master' | 'doctorate' | 'other';
  created_at: Date;
}

export interface Questions {
  question_id: string;
  user_id: string; // Foreign key to User
  content: string;
  category: string; // e.g., 'math', 'science', 'literature', etc.
  demand_score: number;
  popped: boolean;
  created_at: Date;
  resolved_at: Date | null;
}


export interface Answers {
  answer_id: number;
  user_id: string; // Foreign key to User
  question_id: string; // Foreign key to Questions
  content: string;
  is_accepted: boolean;
  created_at: Date;
}


export interface Comments {
  comment_id: number;
  user_id: string; // Foreign key to User
  content: string;
  parent_comment_id: number | null; // For nested comments, null if top-level
  question_id: string; // Foreign key to Questions
  answer_id: number | null; // Foreign key to Answers, null if comment is on question
  tutorial_id: string | null; // Foreign key to Tutorials, null if comment is on question or answer
  created_at: Date;
}


export interface Interactions {
  interaction_id: number;
  user_id: string; // Foreign key to User

  question_id: string | null; // Foreign key to Questions, null if interaction is on answer
  answer_id: number | null; // Foreign key to Answers, null if interaction is on question
  comment_id: number | null; // Foreign key to Comments, null if interaction is on question or answer
  tutorial_id: string | null; // Foreign key to Tutorials, null if interaction is on question or answer

  interaction_type: 'react' | 'rating';
  value: number | null; // For ratings, a value from 1 to 5; for reactions, null
  created_at: Date;
}


export interface QuestionsTutorials {
    question_id: string; // Foreign key to Questions
    tutorial_id: string; // Foreign key to Tutorials
}


export interface Tutorials {
  tutorial_id: string;
  user_id: string; // Foreign key to User
  question_id: string | null; // Foreign key to Questions
  title: string;
  content: string;
  embedded_video_url: string | null; // URL or embed code for video, null if no video
  created_at: Date;
}
