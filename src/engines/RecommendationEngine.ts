/**
 * SandTube Recommendation Engine
 * Provides personalized video recommendations based on user behavior
 */

interface Video {
    id: string;
    title: string;
    channelId: string;
    categoryId: string;
    tags: string[];
    viewCount: number;
    likeCount: number;
    publishedAt: string;
}

interface UserProfile {
    watchHistory: string[];
    likedVideos: string[];
    subscribedChannels: string[];
    searchHistory: string[];
    preferences: {
        categories: string[];
        tags: string[];
    };
}

export class RecommendationEngine {
    private userProfile: UserProfile;
    private videoDatabase: Video[];

    constructor() {
        this.userProfile = this.loadUserProfile();
        this.videoDatabase = [];
    }

    /**
     * Load user profile from localStorage
     */
    private loadUserProfile(): UserProfile {
        const watchHistory = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
        const likedVideos = JSON.parse(localStorage.getItem('sandtube_liked_videos') || '[]');
        const searchHistory = JSON.parse(localStorage.getItem('sandtube_search_history') || '[]');
        
        return {
            watchHistory: watchHistory.map((v: any) => v.id?.videoId || v.id),
            likedVideos: likedVideos.map((v: any) => v.id?.videoId || v.id),
            subscribedChannels: [],
            searchHistory,
            preferences: {
                categories: [],
                tags: []
            }
        };
    }

    /**
     * Calculate similarity score between two videos
     */
    private calculateSimilarity(video1: Video, video2: Video): number {
        let score = 0;

        // Channel match (highest weight)
        if (video1.channelId === video2.channelId) score += 50;

        // Category match
        if (video1.categoryId === video2.categoryId) score += 30;

        // Tag overlap
        const commonTags = video1.tags.filter(tag => video2.tags.includes(tag));
        score += commonTags.length * 5;

        // Recency boost
        const daysDiff = Math.abs(
            new Date(video1.publishedAt).getTime() - new Date(video2.publishedAt).getTime()
        ) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) score += 10;

        return score;
    }

    /**
     * Get personalized recommendations
     */
    public getRecommendations(currentVideoId?: string, limit: number = 20): string[] {
        const scores = new Map<string, number>();

        // Collaborative filtering based on watch history
        this.userProfile.watchHistory.forEach(videoId => {
            const video = this.videoDatabase.find(v => v.id === videoId);
            if (!video) return;

            this.videoDatabase.forEach(candidate => {
                if (candidate.id === currentVideoId || candidate.id === videoId) return;
                
                const similarity = this.calculateSimilarity(video, candidate);
                scores.set(candidate.id, (scores.get(candidate.id) || 0) + similarity);
            });
        });

        // Boost subscribed channels
        this.userProfile.subscribedChannels.forEach(channelId => {
            this.videoDatabase
                .filter(v => v.channelId === channelId)
                .forEach(v => {
                    scores.set(v.id, (scores.get(v.id) || 0) + 40);
                });
        });

        // Sort by score and return top recommendations
        return Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);
    }

    /**
     * Get trending videos based on engagement velocity
     */
    public getTrending(timeWindow: number = 24): Video[] {
        const now = Date.now();
        const windowMs = timeWindow * 60 * 60 * 1000;

        return this.videoDatabase
            .filter(video => {
                const publishTime = new Date(video.publishedAt).getTime();
                return now - publishTime <= windowMs;
            })
            .map(video => {
                const hoursSincePublish = (now - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60);
                const velocity = video.viewCount / Math.max(hoursSincePublish, 1);
                return { ...video, velocity };
            })
            .sort((a: any, b: any) => b.velocity - a.velocity)
            .slice(0, 50);
    }

    /**
     * Get related videos for a specific video
     */
    public getRelatedVideos(videoId: string, limit: number = 20): string[] {
        const sourceVideo = this.videoDatabase.find(v => v.id === videoId);
        if (!sourceVideo) return [];

        const scores = this.videoDatabase
            .filter(v => v.id !== videoId)
            .map(video => ({
                id: video.id,
                score: this.calculateSimilarity(sourceVideo, video)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return scores.map(s => s.id);
    }

    /**
     * Update video database
     */
    public updateVideoDatabase(videos: Video[]): void {
        this.videoDatabase = videos;
    }

    /**
     * Track user interaction
     */
    public trackInteraction(videoId: string, interactionType: 'view' | 'like' | 'share'): void {
        switch (interactionType) {
            case 'view':
                const history = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
                if (!history.find((v: any) => (v.id?.videoId || v.id) === videoId)) {
                    this.userProfile.watchHistory.push(videoId);
                }
                break;
            case 'like':
                if (!this.userProfile.likedVideos.includes(videoId)) {
                    this.userProfile.likedVideos.push(videoId);
                }
                break;
        }
    }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();
