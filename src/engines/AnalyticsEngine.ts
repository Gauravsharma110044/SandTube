/**
 * SandTube Analytics Engine
 * Real-time analytics, metrics tracking, and insights
 */

interface VideoAnalytics {
    videoId: string;
    views: number;
    uniqueViews: number;
    watchTime: number; // in seconds
    averageViewDuration: number;
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
    clickThroughRate: number;
    retentionRate: number[];
    trafficSources: {
        [key: string]: number;
    };
    demographics: {
        age: { [key: string]: number };
        gender: { [key: string]: number };
        geography: { [key: string]: number };
    };
}

interface ChannelAnalytics {
    channelId: string;
    totalViews: number;
    totalWatchTime: number;
    subscriberCount: number;
    subscriberGrowth: number[];
    revenue: number;
    revenueBySource: {
        ads: number;
        memberships: number;
        superChat: number;
        merchandise: number;
    };
    topVideos: string[];
    engagementRate: number;
}

interface RealtimeMetrics {
    currentViewers: number;
    viewsLast24h: number;
    viewsLast7d: number;
    viewsLast30d: number;
    recentActivity: {
        timestamp: number;
        type: 'view' | 'like' | 'comment' | 'subscribe';
        videoId?: string;
    }[];
}

export class AnalyticsEngine {
    private videoMetrics: Map<string, VideoAnalytics> = new Map();
    private channelMetrics: Map<string, ChannelAnalytics> = new Map();
    private realtimeData: Map<string, RealtimeMetrics> = new Map();

    constructor() {
        this.loadAnalytics();
        this.startRealtimeTracking();
    }

    /**
     * Load analytics from localStorage
     */
    private loadAnalytics(): void {
        const stored = localStorage.getItem('sandtube_analytics');
        if (stored) {
            const data = JSON.parse(stored);
            this.videoMetrics = new Map(data.videoMetrics || []);
            this.channelMetrics = new Map(data.channelMetrics || []);
        }
    }

    /**
     * Save analytics to localStorage
     */
    private saveAnalytics(): void {
        const data = {
            videoMetrics: Array.from(this.videoMetrics.entries()),
            channelMetrics: Array.from(this.channelMetrics.entries())
        };
        localStorage.setItem('sandtube_analytics', JSON.stringify(data));
    }

    /**
     * Track video view
     */
    public trackView(videoId: string, watchDuration: number, userId?: string): void {
        let metrics = this.videoMetrics.get(videoId) || this.createDefaultVideoMetrics(videoId);

        metrics.views++;
        metrics.watchTime += watchDuration;
        metrics.averageViewDuration = metrics.watchTime / metrics.views;

        // Update retention curve (simplified)
        const retentionPoint = Math.floor((watchDuration / 300) * 10); // Assuming 5min videos
        if (!metrics.retentionRate[retentionPoint]) {
            metrics.retentionRate[retentionPoint] = 0;
        }
        metrics.retentionRate[retentionPoint]++;

        this.videoMetrics.set(videoId, metrics);
        this.updateRealtimeMetrics(videoId, 'view');
        this.saveAnalytics();
    }

    /**
     * Track engagement (like, comment, share)
     */
    public trackEngagement(
        videoId: string,
        type: 'like' | 'dislike' | 'comment' | 'share'
    ): void {
        let metrics = this.videoMetrics.get(videoId) || this.createDefaultVideoMetrics(videoId);

        switch (type) {
            case 'like':
                metrics.likes++;
                break;
            case 'dislike':
                metrics.dislikes++;
                break;
            case 'comment':
                metrics.comments++;
                break;
            case 'share':
                metrics.shares++;
                break;
        }

        this.videoMetrics.set(videoId, metrics);
        this.updateRealtimeMetrics(videoId, type);
        this.saveAnalytics();
    }

    /**
     * Track traffic source
     */
    public trackTrafficSource(videoId: string, source: string): void {
        let metrics = this.videoMetrics.get(videoId) || this.createDefaultVideoMetrics(videoId);

        if (!metrics.trafficSources[source]) {
            metrics.trafficSources[source] = 0;
        }
        metrics.trafficSources[source]++;

        this.videoMetrics.set(videoId, metrics);
        this.saveAnalytics();
    }

    /**
     * Calculate CTR (Click-Through Rate)
     */
    public calculateCTR(impressions: number, clicks: number): number {
        if (impressions === 0) return 0;
        return (clicks / impressions) * 100;
    }

    /**
     * Calculate engagement rate
     */
    public calculateEngagementRate(videoId: string): number {
        const metrics = this.videoMetrics.get(videoId);
        if (!metrics || metrics.views === 0) return 0;

        const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
        return (totalEngagements / metrics.views) * 100;
    }

    /**
     * Get video analytics
     */
    public getVideoAnalytics(videoId: string): VideoAnalytics | null {
        return this.videoMetrics.get(videoId) || null;
    }

    /**
     * Get channel analytics
     */
    public getChannelAnalytics(channelId: string): ChannelAnalytics {
        let metrics = this.channelMetrics.get(channelId);

        if (!metrics) {
            metrics = this.createDefaultChannelMetrics(channelId);
            this.channelMetrics.set(channelId, metrics);
        }

        return metrics;
    }

    /**
     * Get realtime metrics
     */
    public getRealtimeMetrics(videoId: string): RealtimeMetrics {
        let metrics = this.realtimeData.get(videoId);

        if (!metrics) {
            metrics = {
                currentViewers: 0,
                viewsLast24h: 0,
                viewsLast7d: 0,
                viewsLast30d: 0,
                recentActivity: []
            };
            this.realtimeData.set(videoId, metrics);
        }

        return metrics;
    }

    /**
     * Update realtime metrics
     */
    private updateRealtimeMetrics(
        videoId: string,
        type: 'view' | 'like' | 'comment' | 'subscribe'
    ): void {
        let metrics = this.realtimeData.get(videoId) || {
            currentViewers: 0,
            viewsLast24h: 0,
            viewsLast7d: 0,
            viewsLast30d: 0,
            recentActivity: []
        };

        // Add to recent activity
        metrics.recentActivity.unshift({
            timestamp: Date.now(),
            type,
            videoId
        });

        // Keep only last 100 activities
        metrics.recentActivity = metrics.recentActivity.slice(0, 100);

        // Update view counts
        if (type === 'view') {
            metrics.viewsLast24h++;
            metrics.viewsLast7d++;
            metrics.viewsLast30d++;
        }

        this.realtimeData.set(videoId, metrics);
    }

    /**
     * Start realtime tracking (simulated)
     */
    private startRealtimeTracking(): void {
        setInterval(() => {
            // Decay current viewers count
            this.realtimeData.forEach((metrics, videoId) => {
                metrics.currentViewers = Math.max(0, metrics.currentViewers - Math.floor(Math.random() * 3));
                this.realtimeData.set(videoId, metrics);
            });
        }, 10000); // Every 10 seconds
    }

    /**
     * Generate revenue report
     */
    public generateRevenueReport(channelId: string, period: 'day' | 'week' | 'month'): number {
        const metrics = this.getChannelAnalytics(channelId);
        const cpm = 2.5; // Cost per thousand views
        const revenue = (metrics.totalViews / 1000) * cpm;

        return revenue;
    }

    /**
     * Get top performing videos
     */
    public getTopVideos(channelId: string, limit: number = 10): string[] {
        const channelMetrics = this.getChannelAnalytics(channelId);
        return channelMetrics.topVideos.slice(0, limit);
    }

    /**
     * Calculate retention curve
     */
    public getRetentionCurve(videoId: string): number[] {
        const metrics = this.videoMetrics.get(videoId);
        if (!metrics) return [];

        // Normalize retention data to percentages
        const total = metrics.retentionRate.reduce((sum, val) => sum + val, 0);
        return metrics.retentionRate.map(val => (val / total) * 100);
    }

    /**
     * Export analytics data
     */
    public exportAnalytics(videoId: string, format: 'json' | 'csv'): string {
        const metrics = this.getVideoAnalytics(videoId);
        if (!metrics) return '';

        if (format === 'json') {
            return JSON.stringify(metrics, null, 2);
        } else {
            // CSV format
            const headers = 'Metric,Value\n';
            const rows = [
                `Views,${metrics.views}`,
                `Watch Time,${metrics.watchTime}`,
                `Likes,${metrics.likes}`,
                `Comments,${metrics.comments}`,
                `Shares,${metrics.shares}`,
                `Engagement Rate,${this.calculateEngagementRate(videoId).toFixed(2)}%`
            ].join('\n');
            return headers + rows;
        }
    }

    /**
     * Create default video metrics
     */
    private createDefaultVideoMetrics(videoId: string): VideoAnalytics {
        return {
            videoId,
            views: 0,
            uniqueViews: 0,
            watchTime: 0,
            averageViewDuration: 0,
            likes: 0,
            dislikes: 0,
            comments: 0,
            shares: 0,
            clickThroughRate: 0,
            retentionRate: new Array(10).fill(0),
            trafficSources: {},
            demographics: {
                age: {},
                gender: {},
                geography: {}
            }
        };
    }

    /**
     * Create default channel metrics
     */
    private createDefaultChannelMetrics(channelId: string): ChannelAnalytics {
        return {
            channelId,
            totalViews: 0,
            totalWatchTime: 0,
            subscriberCount: 0,
            subscriberGrowth: new Array(30).fill(0),
            revenue: 0,
            revenueBySource: {
                ads: 0,
                memberships: 0,
                superChat: 0,
                merchandise: 0
            },
            topVideos: [],
            engagementRate: 0
        };
    }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine();
