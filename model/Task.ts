export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type DifficultyEmoji = '😴' | '🙂' | '😤' | '😰' | '🤯';
export type CompletionMoodEmoji = '🔥' | '😎' | '😵' | '😩' | '🎉';

export interface DifficultyOption {
  emoji: DifficultyEmoji;
  label: string;
  description: string;
}

export interface MoodOption {
  emoji: CompletionMoodEmoji;
  label: string;
  description: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { emoji: '😴', label: 'Trivial',   description: '5 mins or less' },
  { emoji: '🙂', label: 'Easy',      description: 'Simple, no blockers' },
  { emoji: '😤', label: 'Medium',    description: 'Needs focus' },
  { emoji: '😰', label: 'Hard',      description: 'Complex, takes time' },
  { emoji: '🤯', label: 'Nightmare', description: 'Very challenging' },
];

export const MOOD_OPTIONS: MoodOption[] = [
  { emoji: '🔥', label: 'On Fire',   description: 'Was in the zone' },
  { emoji: '😎', label: 'Smooth',    description: 'No issues at all' },
  { emoji: '😵', label: 'Survived',  description: 'Hard but done' },
  { emoji: '😩', label: 'Drained',   description: 'Energy-consuming' },
  { emoji: '🎉', label: 'Exciting',  description: 'Loved every bit' },
];

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export interface Task {
  id?: string;
  task_name: string;
  description?: string;
  parent_id?: string | null;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4;
  due_date?: Date;
  attachments?: Attachment[];

  difficulty_emoji?: DifficultyEmoji | null;   // Set anytime — how hard is this task?
  completion_mood?: CompletionMoodEmoji | null; // Set anytime — how did it feel?

  created_at?: Date;
  updated_at?: Date;
  completed_at?: Date | null;
  owner_uid?: string;
}