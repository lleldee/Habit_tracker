import { Habit, HabitFormData } from './types';

export function createHabit(formData: HabitFormData): Habit {
    return {
        id: crypto.randomUUID(),
        name: formData.name,
        frequency: formData.frequency,
        goal: formData.goal,
        completedDates: [],
        createdAt: new Date().toISOString()
    };
}

export function calculateProgress(habit: Habit): number {
    const completed = habit.completedDates.length;
    return Math.round((completed / habit.goal) * 100);
}

export function isCompletedToday(habit: Habit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
}

export function toggleHabitCompletion(habit: Habit): Habit {
    const today = new Date().toISOString().split('T')[0];
    
    if (isCompletedToday(habit)) {
        return {
            ...habit,
            completedDates: habit.completedDates.filter(date => date !== today)
        };
    }
    
    return {
        ...habit,
        completedDates: [...habit.completedDates, today]
    };
} 