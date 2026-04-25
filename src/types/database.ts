// types/database.ts
type UserID        = string & { readonly _brand: 'UserID' };
type QuestionID    = string & { readonly _brand: 'QuestionID' };
type TutorialID    = string & { readonly _brand: 'TutorialID' };
type AnswerID      = number & { readonly _brand: 'AnswerID' };
type CommentID     = number & { readonly _brand: 'CommentID' };
type InteractionID = number & { readonly _brand: 'InteractionID' };

export interface User {
  user_id: UserID;
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
  question_id: QuestionID;
  user_id: UserID;
  content: string;
  category: string;
  demand_score: number;
  popped: boolean;
  created_at: Date;
  resolved_at: Date | null;
}

export interface Answers {
  answer_id: AnswerID;
  user_id: UserID;
  question_id: QuestionID;
  content: string;
  is_accepted: boolean;
  created_at: Date;
}

export interface Comments {
  comment_id: CommentID;
  user_id: UserID;
  content: string;
  parent_comment_id: CommentID | null;
  question_id: QuestionID;
  answer_id: AnswerID | null;
  tutorial_id: TutorialID | null;
  created_at: Date;
}

type InteractionBase = {
  interaction_id: InteractionID;
  user_id: UserID;
  interaction_type: 'react' | 'rating';
  value: number | null;
  created_at: Date;
};

type QuestionInteraction = InteractionBase & { question_id: QuestionID; answer_id?: never; comment_id?: never; tutorial_id?: never };
type AnswerInteraction   = InteractionBase & { question_id?: never; answer_id: AnswerID;   comment_id?: never; tutorial_id?: never };
type CommentInteraction  = InteractionBase & { question_id?: never; answer_id?: never; comment_id: CommentID;  tutorial_id?: never };
type TutorialInteraction = InteractionBase & { question_id?: never; answer_id?: never; comment_id?: never; tutorial_id: TutorialID };

export type Interaction = QuestionInteraction | AnswerInteraction | CommentInteraction | TutorialInteraction;

export interface QuestionsTutorials {
  question_id: QuestionID;
  tutorial_id: TutorialID;
}

export interface Tutorials {
  tutorial_id: TutorialID;
  user_id: UserID;
  question_id: QuestionID | null;
  title: string;
  content: string;
  embedded_video_url: string | null;
  created_at: Date;
}