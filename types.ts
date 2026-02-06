
export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  content: string;
  contentBn: string;
  examples: { en: string; bn: string }[];
  quiz?: QuizQuestion[];
  videoUrl?: string;
  type: 'grammar' | 'vocabulary' | 'speaking' | 'writing';
}

export interface Course {
  id: string;
  name: string;
  nameBn: string;
  difficulty: Difficulty;
  description: string;
  descriptionBn: string;
  lessons: Lesson[];
  thumbnail: string;
  published: boolean;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  facebookUrl: string;
  youtubeUrl: string;
  adminPin: string;
}

export interface UserProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  level: Difficulty;
}
