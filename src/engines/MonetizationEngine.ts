/**
 * SandTube Monetization Engine
 * Ad placement, revenue tracking, and monetization features
 */

interface AdPlacement {
    id: string;
    type: 'pre-roll' | 'mid-roll' | 'post-roll' | 'display' | 'overlay';
    duration: number; // in seconds
    position?: number; // for mid-roll ads
    revenue: number;
    impressions: number;
    clicks: number;
}

interface RevenueStream {
    ads: number;
    memberships: number;
    superChat: number;
    merchandise: number;
    sponsorships: number;
}

interface MonetizationSettings {
    adsEnabled: boolean;
    adTypes: {
        preRoll: boolean;
        midRoll: boolean;
        postRoll: boolean;
        display: boolean;
        overlay: boolean;
    };
    membershipsEnabled: boolean;
    superChatEnabled: boolean;
    merchandiseEnabled: boolean;
}

export class MonetizationEngine {
    private settings: MonetizationSettings;
    private revenue: Map<string, RevenueStream> = new Map();
    private adPlacements: Map<string, AdPlacement[]> = new Map();

    // Revenue rates (in USD)
    private readonly CPM = 2.5; // Cost per thousand impressions
    private readonly CPC = 0.25; // Cost per click
    private readonly PLATFORM_CUT = 0.30; // 30% platform fee

    constructor() {
        this.settings = this.loadSettings();
        this.loadRevenue();
    }

    /**
     * Load monetization settings
     */
    private loadSettings(): MonetizationSettings {
        const stored = localStorage.getItem('sandtube_monetization_settings');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            adsEnabled: true,
            adTypes: {
                preRoll: true,
                midRoll: true,
                postRoll: false,
                display: true,
                overlay: false
            },
            membershipsEnabled: false,
            superChatEnabled: false,
            merchandiseEnabled: false
        };
    }

    /**
     * Save settings
     */
    public saveSettings(settings: Partial<MonetizationSettings>): void {
        this.settings = { ...this.settings, ...settings };
        localStorage.setItem('sandtube_monetization_settings', JSON.stringify(this.settings));
    }

    /**
     * Load revenue data
     */
    private loadRevenue(): void {
        const stored = localStorage.getItem('sandtube_revenue');
        if (stored) {
            this.revenue = new Map(JSON.parse(stored));
        }
    }

    /**
     * Save revenue data
     */
    private saveRevenue(): void {
        localStorage.setItem('sandtube_revenue', JSON.stringify(Array.from(this.revenue.entries())));
    }

    /**
     * Generate ad placements for a video
     */
    public generateAdPlacements(videoId: string, videoDuration: number): AdPlacement[] {
        const placements: AdPlacement[] = [];

        if (!this.settings.adsEnabled) return placements;

        // Pre-roll ad
        if (this.settings.adTypes.preRoll) {
            placements.push({
                id: `ad_${videoId}_preroll`,
                type: 'pre-roll',
                duration: 15,
                revenue: 0,
                impressions: 0,
                clicks: 0
            });
        }

        // Mid-roll ads (every 5 minutes for videos longer than 8 minutes)
        if (this.settings.adTypes.midRoll && videoDuration > 480) {
            const midRollInterval = 300; // 5 minutes
            let position = midRollInterval;

            while (position < videoDuration - 60) {
                placements.push({
                    id: `ad_${videoId}_midroll_${position}`,
                    type: 'mid-roll',
                    duration: 15,
                    position,
                    revenue: 0,
                    impressions: 0,
                    clicks: 0
                });
                position += midRollInterval;
            }
        }

        // Post-roll ad
        if (this.settings.adTypes.postRoll) {
            placements.push({
                id: `ad_${videoId}_postroll`,
                type: 'post-roll',
                duration: 15,
                revenue: 0,
                impressions: 0,
                clicks: 0
            });
        }

        // Display ads
        if (this.settings.adTypes.display) {
            placements.push({
                id: `ad_${videoId}_display`,
                type: 'display',
                duration: 0,
                revenue: 0,
                impressions: 0,
                clicks: 0
            });
        }

        // Overlay ads
        if (this.settings.adTypes.overlay) {
            placements.push({
                id: `ad_${videoId}_overlay`,
                type: 'overlay',
                duration: 0,
                revenue: 0,
                impressions: 0,
                clicks: 0
            });
        }

        this.adPlacements.set(videoId, placements);
        return placements;
    }

    /**
     * Track ad impression
     */
    public trackAdImpression(videoId: string, adId: string): void {
        const placements = this.adPlacements.get(videoId);
        if (!placements) return;

        const ad = placements.find(p => p.id === adId);
        if (ad) {
            ad.impressions++;
            ad.revenue += this.CPM / 1000; // Add CPM revenue
            this.updateVideoRevenue(videoId, 'ads', this.CPM / 1000);
        }
    }

    /**
     * Track ad click
     */
    public trackAdClick(videoId: string, adId: string): void {
        const placements = this.adPlacements.get(videoId);
        if (!placements) return;

        const ad = placements.find(p => p.id === adId);
        if (ad) {
            ad.clicks++;
            ad.revenue += this.CPC; // Add CPC revenue
            this.updateVideoRevenue(videoId, 'ads', this.CPC);
        }
    }

    /**
     * Process Super Chat donation
     */
    public processSuperChat(
        videoId: string,
        amount: number,
        _message: string,
        _userId: string
    ): { success: boolean; netAmount: number } {
        if (!this.settings.superChatEnabled) {
            return { success: false, netAmount: 0 };
        }

        const netAmount = amount * (1 - this.PLATFORM_CUT);
        this.updateVideoRevenue(videoId, 'superChat', netAmount);

        return { success: true, netAmount };
    }

    /**
     * Process membership subscription
     */
    public processMembership(
        channelId: string,
        _userId: string,
        tier: 'basic' | 'premium' | 'elite' = 'basic'
    ): { success: boolean; monthlyRevenue: number } {
        if (!this.settings.membershipsEnabled) {
            return { success: false, monthlyRevenue: 0 };
        }

        const prices = {
            basic: 4.99,
            premium: 9.99,
            elite: 24.99
        };

        const monthlyRevenue = prices[tier] * (1 - this.PLATFORM_CUT);
        this.updateChannelRevenue(channelId, 'memberships', monthlyRevenue);

        return { success: true, monthlyRevenue };
    }

    /**
     * Process merchandise sale
     */
    public processMerchandiseSale(
        channelId: string,
        amount: number,
        _productId: string
    ): { success: boolean; netAmount: number } {
        if (!this.settings.merchandiseEnabled) {
            return { success: false, netAmount: 0 };
        }

        const netAmount = amount * (1 - this.PLATFORM_CUT);
        this.updateChannelRevenue(channelId, 'merchandise', netAmount);

        return { success: true, netAmount };
    }

    /**
     * Process sponsorship deal
     */
    public processSponsorshipDeal(
        videoId: string,
        amount: number,
        _sponsorName: string
    ): void {
        this.updateVideoRevenue(videoId, 'sponsorships', amount);
    }

    /**
     * Update video revenue
     */
    private updateVideoRevenue(
        videoId: string,
        stream: keyof RevenueStream,
        amount: number
    ): void {
        let revenue = this.revenue.get(videoId) || {
            ads: 0,
            memberships: 0,
            superChat: 0,
            merchandise: 0,
            sponsorships: 0
        };

        revenue[stream] += amount;
        this.revenue.set(videoId, revenue);
        this.saveRevenue();
    }

    /**
     * Update channel revenue
     */
    private updateChannelRevenue(
        channelId: string,
        stream: keyof RevenueStream,
        amount: number
    ): void {
        let revenue = this.revenue.get(channelId) || {
            ads: 0,
            memberships: 0,
            superChat: 0,
            merchandise: 0,
            sponsorships: 0
        };

        revenue[stream] += amount;
        this.revenue.set(channelId, revenue);
        this.saveRevenue();
    }

    /**
     * Get total revenue for a video
     */
    public getVideoRevenue(videoId: string): RevenueStream {
        return this.revenue.get(videoId) || {
            ads: 0,
            memberships: 0,
            superChat: 0,
            merchandise: 0,
            sponsorships: 0
        };
    }

    /**
     * Get total revenue for a channel
     */
    public getChannelRevenue(channelId: string): RevenueStream {
        return this.revenue.get(channelId) || {
            ads: 0,
            memberships: 0,
            superChat: 0,
            merchandise: 0,
            sponsorships: 0
        };
    }

    /**
     * Calculate estimated earnings for views
     */
    public estimateEarnings(views: number, engagementRate: number = 0.05): number {
        const adImpressions = views * 0.8; // 80% of viewers see ads
        const adClicks = adImpressions * engagementRate;

        const impressionRevenue = (adImpressions / 1000) * this.CPM;
        const clickRevenue = adClicks * this.CPC;

        return impressionRevenue + clickRevenue;
    }

    /**
     * Generate revenue report
     */
    public generateRevenueReport(
        entityId: string,
        _period: 'day' | 'week' | 'month' | 'year'
    ): {
        total: number;
        byStream: RevenueStream;
        growth: number;
    } {
        const revenue = this.revenue.get(entityId) || {
            ads: 0,
            memberships: 0,
            superChat: 0,
            merchandise: 0,
            sponsorships: 0
        };

        const total = Object.values(revenue).reduce((sum, val) => sum + val, 0);

        return {
            total,
            byStream: revenue,
            growth: 0 // Would calculate based on historical data
        };
    }

    /**
     * Check monetization eligibility
     */
    public checkEligibility(channelStats: {
        subscribers: number;
        watchTimeHours: number;
        videosCount: number;
    }): {
        eligible: boolean;
        requirements: {
            subscribers: boolean;
            watchTime: boolean;
            videos: boolean;
        };
    } {
        const requirements = {
            subscribers: channelStats.subscribers >= 1000,
            watchTime: channelStats.watchTimeHours >= 4000,
            videos: channelStats.videosCount >= 3
        };

        return {
            eligible: Object.values(requirements).every(r => r),
            requirements
        };
    }

    /**
     * Get ad placement for current playback time
     */
    public getAdAtTime(videoId: string, currentTime: number): AdPlacement | null {
        const placements = this.adPlacements.get(videoId);
        if (!placements) return null;

        return placements.find(p =>
            p.type === 'mid-roll' &&
            p.position &&
            Math.abs(p.position - currentTime) < 1
        ) || null;
    }

    /**
     * Calculate RPM (Revenue Per Mille/Thousand views)
     */
    public calculateRPM(videoId: string, views: number): number {
        const revenue = this.getVideoRevenue(videoId);
        const total = Object.values(revenue).reduce((sum, val) => sum + val, 0);

        if (views === 0) return 0;
        return (total / views) * 1000;
    }
}

// Singleton instance
export const monetizationEngine = new MonetizationEngine();
