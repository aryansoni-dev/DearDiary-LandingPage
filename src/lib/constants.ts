import { MoodType, MoodConfig } from '../types';

export const MOODS: Record<MoodType, MoodConfig> = {
  happy: {
    label: 'Happy',
    emoji: '😊',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    cardImage: '/assets/images/mood-card-heart.png',
    lottieName: 'happy'
  },
  calm: {
    label: 'Calm',
    emoji: '😌',
    color: 'text-teal-600',
    bgColor: 'bg-teal-600',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-200',
    cardImage: '/assets/images/mood-card-heart.png',
    lottieName: 'calm'
  },
  grateful: {
    label: 'Grateful',
    emoji: '🙏',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-200',
    cardImage: '/assets/images/mood-card-heart.png',
    lottieName: 'grateful'
  },
  anxious: {
    label: 'Anxious',
    emoji: '🥺',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    cardImage: '/assets/images/mood-card-heart.png',
    lottieName: 'anxious'
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    cardImage: '/assets/images/mood-card-heart.png',
    lottieName: 'sad'
  },
  motivated: {
    label: 'Motivated',
    emoji: '✨',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-200',
    cardImage: '/assets/images/mood-card-heart.png',
    lottieName: 'motivated'
  }
};

export interface PromptTemplate {
  id: string;
  category: 'morning' | 'noon' | 'evening';
  title: string;
  prompt: string;
  cardImage: string;
}

export const PROMPTS: PromptTemplate[] = [
  {
    id: 'm1',
    category: 'morning',
    title: 'Morning Reflection',
    prompt: 'What challenged you today, and how did you overcome it?',
    cardImage: '/assets/images/morning-card.png'
  },
  {
    id: 'n1',
    category: 'noon',
    title: 'Noon Check-in',
    prompt: 'What made you smile unexpectedly today?',
    cardImage: '/assets/images/noon.png'
  },
  {
    id: 'e1',
    category: 'evening',
    title: 'Evening Reflection',
    prompt: 'What are you grateful for today?',
    cardImage: '/assets/images/evening-card.png'
  }
];

export const INITIAL_REFLECTIONS = [
  {
    id: 'init-1',
    date: '2026-07-06T23:17:00.000Z',
    mood: 'calm' as MoodType,
    prompt: 'What did you notice about your feelings today?',
    text: 'I felt motivated during the day and worked a lot on my app. Spoke with Vinayak, felt nice to catch up after a long time.',
    tags: ['Reconnection', 'Calm']
  },
  {
    id: 'init-2',
    date: '2026-07-06T23:15:00.000Z',
    mood: 'happy' as MoodType,
    prompt: 'What would you like to let go of?',
    text: 'Jo bhi galtiyan hui ho unhe bhool jao or aage badho.',
    tags: ['Letting Go', 'Joy']
  }
];
