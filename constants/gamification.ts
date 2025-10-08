export enum ActionType {
    GENERATE_IDEA = 'GENERATE_IDEA',
    GENERATE_SCRIPT = 'GENERATE_SCRIPT',
    GENERATE_CHARACTER_IMAGE = 'GENERATE_CHARACTER_IMAGE',
    GENERATE_VIDEO = 'GENERATE_VIDEO',
    ANIMATE_IMAGE = 'ANIMATE_IMAGE',
}

export const actionPoints: Record<ActionType, number> = {
    [ActionType.GENERATE_IDEA]: 10,
    [ActionType.GENERATE_SCRIPT]: 20,
    [ActionType.GENERATE_CHARACTER_IMAGE]: 15,
    [ActionType.GENERATE_VIDEO]: 50,
    [ActionType.ANIMATE_IMAGE]: 25,
};

export interface Achievement {
    id: string;
    title: string;
    description: string;
    points: number;
    icon: string;
    isSecret?: boolean;
}

export const achievements: Achievement[] = [
    { id: 'first_idea', title: 'Idea Spark', description: 'Create your very first cartoon concept.', points: 25, icon: '💡' },
    { id: 'first_script', title: 'Scriptwriter', description: 'Generate your first script.', points: 50, icon: '📜' },
    { id: 'first_character', title: 'Character Artist', description: 'Generate your first character image.', points: 30, icon: '🎨' },
    { id: 'first_video', title: 'Director', description: 'Create your first animated video.', points: 100, icon: '🎬' },
    { id: 'first_animation', title: 'Animator', description: 'Animate an image for the first time.', points: 40, icon: '✨' },
    { id: 'prolific_creator', title: 'Prolific Creator', description: 'Create 5 cartoon ideas.', points: 75, icon: '🌟' },
];
