export type MoodType = 'happy' | 'calm' | 'grateful' | 'anxious' | 'sad' | 'motivated';

export interface MoodConfig {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  bgLight: string;
  borderColor: string;
  cardImage: string;
  lottieName: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  mood: MoodType;
  prompt: string;
  text: string;
  tags: string[];
  aiReflection?: string;
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mood: MoodType;
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // HH:MM
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  streakCount: number;
  lastActiveDate?: string; // YYYY-MM-DD
}
