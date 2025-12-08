export type MealCategory = 'carb_heavy' | 'balanced' | 'low_carb';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
    nickname: string;
    age: string;
    gender: string; // 'male' | 'female' | 'other' | 'no_answer'
    height: string;
    weight: string;
    exercises: string[];
    memo: string;
}

export interface MealRecord {
    id: string;
    text: string;
    note?: string; // User memo
    eatenAt: string; // ISO string from datetime-local
    imageUrl?: string;
    category?: MealCategory;
    riskLevel?: RiskLevel;
    adviceText?: string;
    exerciseDone: boolean;
    createdAt: number;
}
