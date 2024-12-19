export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
    id: string;
    name: string;
    frequency: Frequency;
    goal: number;
    completedDates: string[];
    createdAt: string;
}

export interface HabitFormData {
    name: string;
    frequency: Frequency;
    goal: number;
} 