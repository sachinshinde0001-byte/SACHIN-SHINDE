export interface LeaderboardUser {
    rank: number;
    name: string;
    points: number;
    avatar: string;
}

export const leaderboardData: LeaderboardUser[] = [
    { rank: 1, name: 'CreativeCat', points: 1250, avatar: '😺' },
    { rank: 2, name: 'StoryMaster', points: 1100, avatar: '📚' },
    { rank: 3, name: 'ArtisticAnt', points: 980, avatar: '🐜' },
    { rank: 4, name: 'DirectorDuck', points: 850, avatar: '🦆' },
    { rank: 5, name: 'You', points: 720, avatar: '👤' },
];
